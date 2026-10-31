import { NextResponse } from "next/server";
import {
  verifyPaymentWebhookAuth,
  isPaymentEventProcessed,
  markPaymentEventProcessed,
} from "@/core/security/payment-webhook-guard";
import { sanitizeLogData } from "@/core/security/api-guard";
import { createServerSupabaseClient } from "@/core/supabase/server";

// ============================================================================
// BỘ NHỚ ĐỆM GIAO DỊCH THANH TOÁN (ORDER STATUS CACHE)
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

const paymentCache = new Map<string, PaymentRecord>();

function generateLicenseKey(volumeId: string, cmd: string): string {
  const cleanId = (volumeId || "PC01").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const hash = cleanId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 12345);
  return `NTPRO-${cleanId.slice(0, 4)}-${cmd}-${hash}`;
}

// ============================================================================
// 1. WEBHOOK NHẬN TÍN HIỆU TỪ SEPAY / PAYOS (POST)
// ============================================================================
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // 1. Xác thực Chữ ký HMAC / API Key Webhook
    const authCheck = verifyPaymentWebhookAuth(request.headers, rawBody);
    if (!authCheck.valid) {
      return NextResponse.json(
        { success: false, error: authCheck.reason || "Unauthorized Webhook" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);

    let orderCode = "";
    let amount = 0;
    let description = "";
    let referenceCode = "";
    let eventId = "";

    if (body.data && body.data.orderCode) {
      // Chuẩn PayOS
      orderCode = String(body.data.orderCode);
      amount = Number(body.data.amount || 0);
      description = String(body.data.description || "");
      referenceCode = String(body.data.reference || "");
      eventId = `payos_${referenceCode || orderCode}`;
    } else {
      // Chuẩn SePay
      amount = Number(body.transferAmount || body.amount || 0);
      description = String(body.content || body.description || "");
      referenceCode = String(body.referenceCode || body.id || "");

      const matchOrder = description.match(/(NT[A-Z0-9_-]+|LISP_[A-Z0-9_-]+|NOITHATPRO\s+[A-Z0-9_-]+)/i);
      if (matchOrder) {
        orderCode = matchOrder[1].replace(/\s+/g, "_").toUpperCase();
      } else {
        orderCode = referenceCode || `ORD_${Date.now()}`;
      }
      eventId = `sepay_${referenceCode || orderCode}`;
    }

    // 2. Chống xử lý trùng lặp (Idempotency Check)
    if (isPaymentEventProcessed(eventId)) {
      return NextResponse.json({
        success: true,
        idempotent: true,
        message: "Giao dịch này đã được ghi nhận trước đó, bỏ qua xử lý lặp lại.",
        orderCode,
      });
    }

    // Ghi an toàn không log thông tin cá nhân
    const safeLog = sanitizeLogData({
      event: "WEBHOOK_PAYMENT_RECEIVED",
      provider: authCheck.provider,
      orderCode,
      amount,
      eventId,
    });
    console.log("[Webhook VietQR]", JSON.stringify(safeLog));

    const isLispPurchase =
      description.toUpperCase().includes("LISP") ||
      orderCode.toUpperCase().startsWith("LISP");

    let licenseKey: string | undefined = undefined;
    if (isLispPurchase) {
      licenseKey = generateLicenseKey("PC-REG", "CAD");
    }

    // Đánh dấu đã xử lý
    markPaymentEventProcessed(eventId);

    // Cập nhật vào Memory Cache
    paymentCache.set(orderCode, {
      orderCode,
      amount,
      type: isLispPurchase ? "plugin" : "subscription",
      status: "paid",
      licenseKey,
      paidAt: new Date().toISOString(),
    });

    // Cập nhật Database nếu có kết nối Supabase
    try {
      const supabase = await createServerSupabaseClient();
      // Ghi nhận sự kiện thanh toán vào bảng payment_events chống trùng lặp vĩnh viễn
      await supabase.from("payment_events").insert({
        event_id: eventId,
        provider: authCheck.provider,
        order_code: orderCode,
        amount,
        payload: body,
      });
    } catch (dbErr: any) {
      // Không để lỗi DB làm sập webhook response, ghi cảnh báo an toàn
      console.warn("[Webhook Payment DB Warning]", dbErr?.message || "Lỗi ghi nhận payment_events");
    }

    return NextResponse.json({
      success: true,
      message: "Thanh toán VietQR đã được xử lý thành công",
      orderCode,
      amount,
      processedAt: new Date().toISOString(),
    });
  } catch (error: any) {
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

  // Chế độ giả lập test thanh toán: Nghiêm cấm tuyệt đối trên Production!
  if (simulate) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: "Chế độ thanh toán giả lập bị khóa trên môi trường Production.",
        },
        { status: 403 }
      );
    }

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
      message: "Thanh toán giả lập thành công (Chế độ phát triển)",
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
