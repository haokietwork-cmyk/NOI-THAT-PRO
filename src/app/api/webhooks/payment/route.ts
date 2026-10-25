import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/core/supabase/server";

// ============================================================================
// BỘ NHỚ ĐỆM GIAO DỊCH THANH TOÁN (ORDER STATUS CACHE)
// Lưu trữ tạm thời trạng thái các đơn hàng VietQR để client polling nhận diện ngay
// ============================================================================

interface PaymentRecord {
  orderCode: string;
  amount: number;
  type: "subscription" | "plugin";
  status: "pending" | "paid";
  userId?: string;
  pluginId?: string;
  volumeId?: string;
  licenseKey?: string;
  paidAt?: string;
}

// Lưu trữ in-memory các đơn hàng gần đây (hỗ trợ cả dev & prod)
const paymentCache = new Map<string, PaymentRecord>();

/**
 * Thuật toán sinh License Key chuẩn bảo mật theo Volume ID máy
 */
function generateLicenseKey(volumeId: string, cmd: string): string {
  const cleanId = (volumeId || "PC01").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const hash = cleanId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 12345);
  return `NTPRO-${cleanId.slice(0, 4)}-${cmd}-${hash}`;
}

// ============================================================================
// 1. WEBHOOK NHẬN TÍN HIỆU TỪ SEPAY / PAYOS / NGÂN HÀNG (POST)
// ============================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Hỗ trợ cả 2 định dạng phổ biến: SePay và PayOS
    let orderCode = "";
    let amount = 0;
    let description = "";
    let referenceCode = "";

    if (body.data && body.data.orderCode) {
      // Chuẩn PayOS
      orderCode = String(body.data.orderCode);
      amount = Number(body.data.amount || 0);
      description = String(body.data.description || "");
      referenceCode = String(body.data.reference || "");
    } else {
      // Chuẩn SePay
      // { id, gateway, transactionDate, accountNumber, transferAmount, content, referenceCode }
      amount = Number(body.transferAmount || body.amount || 0);
      description = String(body.content || body.description || "");
      referenceCode = String(body.referenceCode || body.id || "");

      // Tìm mã đơn hàng dạng NT123456 hoặc LISP_... trong nội dung chuyển khoản
      const matchOrder = description.match(/(NT[A-Z0-9_-]+|LISP_[A-Z0-9_-]+|NOITHATPRO\s+[A-Z0-9_-]+)/i);
      if (matchOrder) {
        orderCode = matchOrder[1].replace(/\s+/g, "_").toUpperCase();
      } else {
        orderCode = referenceCode || `ORD_${Date.now()}`;
      }
    }

    console.log(`[Webhook VietQR] Nhận thanh toán: Mã=${orderCode}, Số tiền=${amount}đ, Nội dung="${description}"`);

    // Xác định loại đơn hàng: Nâng cấp Pro hay Mua Plugin CAD
    const isProSubscription =
      description.toUpperCase().includes("PRO") ||
      orderCode.toUpperCase().startsWith("NT") ||
      amount >= 149_000;

    const isLispPurchase =
      description.toUpperCase().includes("LISP") ||
      orderCode.toUpperCase().startsWith("LISP");

    // Cập nhật trạng thái vào Cache để Client Polling nhận diện trong vòng 2-3s
    let licenseKey: string | undefined = undefined;
    if (isLispPurchase) {
      licenseKey = generateLicenseKey("PC-REG", "CAD");
    }

    paymentCache.set(orderCode, {
      orderCode,
      amount,
      type: isLispPurchase ? "plugin" : "subscription",
      status: "paid",
      licenseKey,
      paidAt: new Date().toISOString(),
    });

    // Cập nhật lên Supabase nếu có cấu hình DB
    try {
      const supabase = await createServerSupabaseClient();

      if (isProSubscription) {
        // Cập nhật gói Pro cho user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({
              subscription_tier: "pro",
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }
      }

      if (isLispPurchase) {
        // Ghi vào bảng plugin_orders
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("plugin_orders").insert({
            user_id: user.id,
            order_code: orderCode,
            amount,
            status: "paid",
            license_key: licenseKey,
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (dbErr) {
      console.warn("[Webhook] Supabase offline hoặc chưa đăng nhập user:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Thanh toán VietQR đã được xử lý thành công",
      orderCode,
      amount,
      processedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Invalid webhook payload" },
      { status: 400 }
    );
  }
}

// ============================================================================
// 2. POLLING API CHO CLIENT KIỂM TRA TRẠNG THÁI THANH TOÁN (GET)
// Endpoint: /api/webhooks/payment?orderCode=...&simulate=true&volumeId=...
// ============================================================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderCode = searchParams.get("orderCode") || "";
  const simulate = searchParams.get("simulate") === "true";
  const volumeId = searchParams.get("volumeId") || "4A2B-8C1D";
  const pluginCmd = searchParams.get("pluginCmd") || "CAD";

  if (!orderCode) {
    return NextResponse.json(
      { success: false, message: "Thiếu tham số orderCode" },
      { status: 400 }
    );
  }

  // Chế độ giả lập test thanh toán (dành cho kiểm thử và Demo Mode)
  if (simulate) {
    const licenseKey = generateLicenseKey(volumeId, pluginCmd);
    const mockPaid: PaymentRecord = {
      orderCode,
      amount: orderCode.includes("LISP") ? 199_000 : 149_000,
      type: orderCode.includes("LISP") ? "plugin" : "subscription",
      status: "paid",
      volumeId,
      licenseKey,
      paidAt: new Date().toISOString(),
    };

    paymentCache.set(orderCode, mockPaid);

    return NextResponse.json({
      success: true,
      paid: true,
      orderCode,
      tier: "pro",
      licenseKey,
      message: "Thanh toán giả lập thành công!",
      paidAt: mockPaid.paidAt,
    });
  }

  // Kiểm tra trong Cache xem webhook SePay/PayOS đã gọi tới chưa
  const record = paymentCache.get(orderCode);
  if (record && record.status === "paid") {
    return NextResponse.json({
      success: true,
      paid: true,
      orderCode: record.orderCode,
      amount: record.amount,
      type: record.type,
      tier: "pro",
      licenseKey: record.licenseKey,
      paidAt: record.paidAt,
    });
  }

  // Chưa thanh toán xong
  return NextResponse.json({
    success: true,
    paid: false,
    orderCode,
    message: "Đang chờ tín hiệu chuyển khoản từ ngân hàng...",
  });
}
