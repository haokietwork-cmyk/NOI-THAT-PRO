import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/core/supabase/server";
import { checkRateLimit, getClientIp } from "@/core/security/api-guard";
import { hashShareToken, assertPayloadSanitized } from "@/core/security/quote-share";
import { logSanitizedError } from "@/core/monitoring/error-logger";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  // 1. Kiểm tra định dạng sơ bộ của token (64 hex characters)
  if (!token || typeof token !== "string" || !/^[0-9a-fA-F]{64}$/.test(token)) {
    return NextResponse.json(
      { error: "Liên kết báo giá không hợp lệ hoặc không tồn tại" },
      { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow" } }
    );
  }

  // 2. Giới hạn tần suất truy cập chống brute-force (30 requests / 1 phút / IP)
  const ip = getClientIp(request);
  const rateLimitResult = checkRateLimit(`quote-share-view:${ip}`, 30, 60_000);
  if (!rateLimitResult.allowed) {
    const retrySec = Math.ceil(rateLimitResult.resetMs / 1000);
    return NextResponse.json(
      { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retrySec),
          "X-Robots-Tag": "noindex, nofollow",
        },
      }
    );
  }

  try {
    const tokenHash = hashShareToken(token);
    const supabase = await createServerSupabaseClient();

    // 3. Gọi hàm RPC bảo mật get_shared_quote(token_hash)
    // Hàm này chạy SECURITY DEFINER, chỉ trả về customer_payload nếu link hợp lệ và còn hạn
    const { data: payload, error: rpcError } = await supabase.rpc("get_shared_quote", {
      p_token_hash: tokenHash,
    });

    // Nếu không tìm thấy, bị lỗi, hoặc hàm trả về NULL -> luôn trả 404 chung, không lộ lý do
    if (rpcError || !payload) {
      return NextResponse.json(
        { error: "Liên kết báo giá không tồn tại, đã hết hạn hoặc bị thu hồi bởi chủ xưởng" },
        { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow" } }
      );
    }

    // 4. Lớp kiểm định an toàn cuối cùng: khẳng định payload không có trường cấm
    assertPayloadSanitized(payload);

    return NextResponse.json(
      { success: true, quote: payload },
      {
        status: 200,
        headers: {
          "X-Robots-Tag": "noindex, nofollow",
          "Cache-Control": "public, max-age=60, s-maxage=120",
        },
      }
    );
  } catch (err: any) {
    logSanitizedError("Lỗi không mong muốn trong GET /api/quote-share/[token]", err, {
      tokenLength: token.length,
    });
    return NextResponse.json(
      { error: "Không thể tải báo giá lúc này. Vui lòng liên hệ trực tiếp với xưởng." },
      { status: 500, headers: { "X-Robots-Tag": "noindex, nofollow" } }
    );
  }
}
