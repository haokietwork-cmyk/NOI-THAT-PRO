import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/core/supabase/server";
import { checkRateLimit, getClientIp, sanitizeLogData } from "@/core/security/api-guard";

const DeleteAccountSchema = z.object({
  confirmation: z.literal("XOA TAI KHOAN", {
    message: "Vui lòng nhập chính xác cụm từ 'XOA TAI KHOAN'",
  }),
  reason: z.string().max(500).optional(),
});

/**
 * API Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu tổ chức (Cascade Deletion)
 * Endpoint: POST /api/user/delete-account
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  // 1. Giới hạn tần suất: tối đa 5 yêu cầu / 10 phút
  const rate = checkRateLimit(`del_acc_${clientIp}`, 5, 600_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "Thao tác quá thường xuyên. Vui lòng thử lại sau." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = DeleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Xác nhận không hợp lệ" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    // 2. Tìm tổ chức của user và kiểm tra quyền xóa
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_org_id")
      .eq("id", user.id)
      .single();

    if (profile?.active_org_id) {
      // Kiểm tra nếu là owner thì xóa organization (sẽ CASCADE toàn bộ projects, catalog_items, items)
      const { data: member } = await supabase
        .from("org_members")
        .select("role")
        .eq("org_id", profile.active_org_id)
        .eq("user_id", user.id)
        .single();

      if (member?.role === "owner") {
        await supabase.from("organizations").delete().eq("id", profile.active_org_id);
      }
    }

    // 3. Xóa profile của user
    await supabase.from("profiles").delete().eq("id", user.id);

    // 4. Log sự kiện không PII
    console.log(
      "[Account Deleted]",
      JSON.stringify(
        sanitizeLogData({
          event: "USER_ACCOUNT_PERMANENTLY_DELETED",
          userId: user.id,
          ip: clientIp,
          reason: parsed.data.reason || "N/A",
          deletedAt: new Date().toISOString(),
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Tài khoản và toàn bộ dữ liệu đã được xóa vĩnh viễn khỏi máy chủ.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý xóa tài khoản" },
      { status: 500 }
    );
  }
}
