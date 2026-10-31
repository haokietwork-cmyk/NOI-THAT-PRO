import { NextResponse } from "next/server";
import {
  checkRateLimit,
  checkBodySize,
  getClientIp,
  sanitizeLogData,
  DirectIngestRequestSchema,
} from "@/core/security/api-guard";
import { createServerSupabaseClient } from "@/core/supabase/server";

/**
 * API tiếp nhận Cutlist trực tiếp từ AutoCAD hoặc SketchUp (1-Click Direct Ingest)
 * Endpoint: POST /api/projects/direct-ingest
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  // 1. Kiểm soát giới hạn tần suất (Rate Limiting: 30 requests / phút / IP)
  const rateCheck = checkRateLimit(`ingest_${clientIp}`, 30, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
        retryAfterMs: rateCheck.resetMs,
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)) },
      }
    );
  }

  // 2. Đọc raw text và kiểm soát kích thước body (Body Size Limit: tối đa 2MB)
  const rawBody = await request.text();
  const sizeCheck = checkBodySize(request.headers.get("content-length"), rawBody, 2 * 1024 * 1024);
  if (!sizeCheck.valid) {
    return NextResponse.json(
      {
        success: false,
        error: `Dung lượng payload quá lớn (${sizeCheck.actualBytes} bytes). Giới hạn tối đa là ${sizeCheck.maxBytes} bytes.`,
      },
      { status: 413 }
    );
  }

  try {
    const json = JSON.parse(rawBody);

    // 3. Kiểm duyệt dữ liệu đầu vào bằng Zod Schema
    const validation = DirectIngestRequestSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu gửi từ CAD không hợp lệ",
          details: validation.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { projectName, clientName, clientPhone, clientAddress, sourceApp, items } = validation.data;

    // 4. Kiểm tra phiên người dùng (nếu có)
    let authenticatedUserId: string | null = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        authenticatedUserId = user.id;
      }
    } catch {
      // Cho phép guest import vào session tạm nếu chưa đăng nhập
    }

    // 5. Chuẩn hóa danh sách tấm chi tiết
    const cleanedItems = items.map((item, idx) => ({
      id: `cad_${Date.now()}_${idx}`,
      moduleName: item.moduleName,
      partName: item.partName,
      length: item.length,
      width: item.width,
      thickness: item.thickness,
      qty: item.qty,
      materialCode: item.materialCode,
      edges: item.edges,
    }));

    // Tạo mã token tạm để trình duyệt nạp dữ liệu vào /quoting
    const ingestId = `ingest_${Date.now()}`;

    // 6. Log an toàn: TUYỆT ĐỐI không in tên khách, SĐT, địa chỉ (Rule 4)
    const safeLog = sanitizeLogData({
      event: "CAD_DIRECT_INGEST",
      sourceApp,
      itemsCount: cleanedItems.length,
      userId: authenticatedUserId ? "[AUTHENTICATED]" : "[GUEST]",
      ip: clientIp,
      clientName,
      clientPhone,
      clientAddress,
    });
    console.log("[Direct Ingest Success]", JSON.stringify(safeLog));

    return NextResponse.json({
      success: true,
      message: `Đã nạp thành công ${cleanedItems.length} chi tiết từ ${sourceApp}!`,
      ingestId,
      projectName,
      itemsCount: cleanedItems.length,
      sampleItems: cleanedItems.slice(0, 5),
      webQuotingUrl: `/quoting?source=cad&ingestId=${ingestId}`,
      receivedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Định dạng JSON gửi lên không hợp lệ" },
      { status: 400 }
    );
  }
}
