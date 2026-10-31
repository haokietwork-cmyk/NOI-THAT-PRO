import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/core/supabase/server";
import { checkRateLimit, checkBodySize } from "@/core/security/api-guard";
import { logSanitizedError } from "@/core/monitoring/error-logger";
import { hashShareToken } from "@/core/security/quote-share";

const RevokeShareSchema = z.object({
  projectId: z.string().optional(),
  shareToken: z.string().optional(),
}).refine((data) => data.projectId || data.shareToken, {
  message: "Cần cung cấp ít nhất projectId hoặc shareToken để thu hồi",
});

export async function POST(request: NextRequest) {
  const rawText = await request.text();
  const bodyCheck = checkBodySize(request.headers.get("content-length"), rawText, 16 * 1024);
  if (!bodyCheck.valid) {
    return NextResponse.json(
      { error: `Payload vượt quá kích thước cho phép (${bodyCheck.maxBytes} bytes)` },
      { status: 413 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập để thu hồi liên kết chia sẻ" },
      { status: 401 }
    );
  }

  const rateLimitResult = checkRateLimit(`quote-share-revoke:${user.id}`, 20, 60_000);
  if (!rateLimitResult.allowed) {
    const retrySec = Math.ceil(rateLimitResult.resetMs / 1000);
    return NextResponse.json(
      { error: "Thao tác quá nhanh. Vui lòng chờ giây lát." },
      {
        status: 429,
        headers: { "Retry-After": String(retrySec) },
      }
    );
  }

  try {
    const rawBody = JSON.parse(rawText || "{}");
    const parseResult = RevokeShareSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, shareToken } = parseResult.data;

    let query = supabase
      .from("quote_shares")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("revoked_at", null);

    if (shareToken) {
      const tokenHash = hashShareToken(shareToken);
      query = query.eq("token_hash", tokenHash);
    } else if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { error: updateError } = await query;
    if (updateError) {
      logSanitizedError("Lỗi khi thu hồi quote_shares", updateError, {
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Không thể thu hồi liên kết lúc này" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã thu hồi liên kết chia sẻ báo giá thành công. Khách hàng sẽ không thể truy cập liên kết này nữa.",
    });
  } catch (err: any) {
    logSanitizedError("Lỗi không mong muốn trong POST /api/quote-share/revoke", err, {
      userId: user.id,
    });
    return NextResponse.json(
      { error: "Đã xảy ra lỗi nội bộ khi thu hồi liên kết" },
      { status: 500 }
    );
  }
}
