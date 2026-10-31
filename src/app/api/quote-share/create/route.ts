import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/core/supabase/server";
import { checkRateLimit, checkBodySize } from "@/core/security/api-guard";
import { logSanitizedError } from "@/core/monitoring/error-logger";
import {
  generateShareToken,
  hashShareToken,
  buildCustomerSharedPayload,
} from "@/core/security/quote-share";
import { calculateProject } from "@/core/calculations/engine";
import { resolveProjectProfitMargin } from "@/core/calculations/quote-engine";
import type { SavedProject, WorkshopProfile, CutlistPart, MaterialItem } from "@/core/types";

const CreateShareSchema = z.object({
  projectId: z.string().min(1, "projectId là bắt buộc"),
  expiresDays: z.number().int().min(1).max(365).optional().default(30),
  includeBankInfo: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  // 1. Đọc và kiểm tra kích thước body
  const rawText = await request.text();
  const bodyCheck = checkBodySize(request.headers.get("content-length"), rawText, 64 * 1024);
  if (!bodyCheck.valid) {
    return NextResponse.json(
      { error: `Payload vượt quá kích thước cho phép (${bodyCheck.maxBytes} bytes)` },
      { status: 413 }
    );
  }

  // 2. Xác thực người dùng qua Supabase Auth
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập tài khoản xưởng để tạo liên kết chia sẻ dự án" },
      { status: 401 }
    );
  }

  // 3. Giới hạn tần suất tạo link (15 lần / 1 phút / user)
  const rateLimitResult = checkRateLimit(`quote-share-create:${user.id}`, 15, 60_000);
  if (!rateLimitResult.allowed) {
    const retrySec = Math.ceil(rateLimitResult.resetMs / 1000);
    return NextResponse.json(
      { error: "Thao tác quá nhanh. Vui lòng chờ giây lát trước khi tạo link tiếp theo." },
      {
        status: 429,
        headers: { "Retry-After": String(retrySec) },
      }
    );
  }

  try {
    const rawBody = JSON.parse(rawText || "{}");
    const parseResult = CreateShareSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Dữ liệu yêu cầu không hợp lệ", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, expiresDays, includeBankInfo } = parseResult.data;

    // 4. Lấy dự án từ database thuộc quyền sở hữu của user
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json(
        { error: "Không tìm thấy dự án hoặc bạn không có quyền truy cập" },
        { status: 404 }
      );
    }

    // 5. Lấy hồ sơ xưởng
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile: WorkshopProfile = {
      name: profileData?.company_name || "XƯỞNG SẢN XUẤT NỘI THẤT",
      phone: profileData?.phone || "",
      address: profileData?.address || "",
      bankName: profileData?.bank_info?.bank_name,
      accountNumber: profileData?.bank_info?.account_number,
      accountName: profileData?.bank_info?.account_name,
      subscriptionTier: profileData?.subscription_tier || "free",
    };

    // 6. Tính toán kết quả báo giá từ chi tiết tấm đã lưu
    const items: CutlistPart[] = Array.isArray(projectData.items) ? projectData.items : [];
    const materials: MaterialItem[] = Array.isArray(projectData.materials_snapshot)
      ? projectData.materials_snapshot
      : [];
    const profitMargin = resolveProjectProfitMargin(projectData.profit_margin);
    const roundingStep = projectData.rounding_step === 1 ? 1 : 0.5;

    const calcResult = calculateProject(items, materials, {
      profitMargin,
      roundingStep,
      costConfig: projectData.cost_config_snapshot,
    });

    const project: SavedProject = {
      id: projectData.id,
      projectName: projectData.project_name,
      clientName: projectData.client_name,
      clientPhone: projectData.client_phone,
      status: projectData.status,
      createdAt: projectData.created_at,
      items,
      materialsSnapshot: materials,
      roundingStep,
      profitMargin,
      totalCost: projectData.total_cost || 0,
      totalQuote: projectData.total_quote || 0,
      versionNo: projectData.version_no || 1,
    };

    // 7. Che dữ liệu ở server
    const customerPayload = buildCustomerSharedPayload(project, calcResult, profile, {
      includeBankInfo,
    });

    // 8. Sinh token và lưu SHA-256 hash
    const rawToken = generateShareToken();
    const tokenHash = hashShareToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    const { error: insertError } = await supabase.from("quote_shares").insert({
      project_id: projectId,
      user_id: user.id,
      token_hash: tokenHash,
      customer_payload: customerPayload,
      version_no: project.versionNo,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      logSanitizedError("Lỗi khi lưu quote_shares vào Supabase", insertError, {
        userId: user.id,
        projectId,
      });
      return NextResponse.json(
        { error: "Không thể tạo liên kết chia sẻ lúc này. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    const origin = request.nextUrl.origin;
    const shareUrl = `${origin}/share/${rawToken}`;

    return NextResponse.json({
      success: true,
      shareToken: rawToken,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: any) {
    logSanitizedError("Lỗi không mong muốn trong POST /api/quote-share/create", err, {
      userId: user.id,
    });
    return NextResponse.json(
      { error: "Đã xảy ra lỗi nội bộ khi tạo liên kết báo giá" },
      { status: 500 }
    );
  }
}
