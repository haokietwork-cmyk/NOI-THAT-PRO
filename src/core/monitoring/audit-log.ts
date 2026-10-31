/**
 * QUẢN LÝ NHẬT KÝ THAY ĐỔI DỰ ÁN (PROJECT AUDIT LOG) - P1 / H2
 * Tuân thủ Rule 4: Tuyệt đối không lưu trữ dữ liệu cá nhân PII trong log.
 * Ghi nhận các mốc quan trọng: Chốt hợp đồng, đổi giá, chuyển trạng thái, tạo bản sửa đổi v2.
 */

import { scrubPiiFromString, sanitizeMonitoringData } from "./error-logger.ts";
import { createClient, isSupabaseConfigured } from "../supabase/client.ts";

export type ProjectAuditAction =
  | "PRICE_CHANGED"
  | "BOM_FROZEN"
  | "STATUS_CHANGED"
  | "REVISION_CREATED"
  | "DRAFT_UNLOCKED";

export interface ProjectAuditLogEntry {
  id: string;
  projectId: string;
  orgId?: string;
  userId?: string;
  action: ProjectAuditAction;
  details: Record<string, any>;
  createdAt: string;
}

/**
 * Danh sách các trường được phép có trong details của nhật ký (Allowlist kỹ thuật)
 */
const ALLOWED_AUDIT_KEYS = new Set([
  "old_status",
  "new_status",
  "old_total_quote",
  "new_total_quote",
  "old_margin",
  "new_margin",
  "total_cost",
  "total_quote",
  "version_no",
  "parent_project_id",
  "frozen_at",
  "items_count",
  "reason",
]);

/**
 * Lọc sạch thông tin chi tiết nhật ký, loại bỏ hoàn toàn PII
 */
export function sanitizeAuditDetails(details: Record<string, any>): Record<string, any> {
  if (!details || typeof details !== "object") return {};

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(details)) {
    const lower = key.toLowerCase();
    // Bỏ qua nếu là key nhạy cảm (tên khách, SĐT, địa chỉ, tài khoản)
    if (
      lower.includes("name") ||
      lower.includes("phone") ||
      lower.includes("address") ||
      lower.includes("bank") ||
      lower.includes("account") ||
      lower.includes("email")
    ) {
      continue;
    }

    if (typeof val === "string") {
      clean[key] = scrubPiiFromString(val);
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

/**
 * Chuyển đổi mã hành động sang mô tả tiếng Việt thân thiện xưởng sản xuất
 */
export function formatAuditActionVi(action: ProjectAuditAction): {
  label: string;
  badgeClass: string;
} {
  switch (action) {
    case "BOM_FROZEN":
      return {
        label: "🔒 Đóng băng hợp đồng & khóa BOM",
        badgeClass: "bg-slate-900 text-amber-300 border-slate-700",
      };
    case "STATUS_CHANGED":
      return {
        label: "🔄 Thay đổi trạng thái tiến độ",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "PRICE_CHANGED":
      return {
        label: "💰 Cập nhật đơn giá & tỷ suất lợi nhuận",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "REVISION_CREATED":
      return {
        label: "🌿 Tạo bản sửa đổi bổ sung (Revision)",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
      };
    case "DRAFT_UNLOCKED":
      return {
        label: "🔓 Mở khóa chỉnh sửa bản nháp",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      };
    default:
      return {
        label: action,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

// Bộ nhớ đệm Local Storage cho Audit Log khi chạy Offline / Demo
const LOCAL_AUDIT_KEY = "noithat_pro_audit_logs_v1";

export function getLocalAuditLogs(projectId?: string): ProjectAuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    if (!raw) return [];
    const list: ProjectAuditLogEntry[] = JSON.parse(raw);
    if (projectId) {
      return list.filter((item) => item.projectId === projectId);
    }
    return list;
  } catch {
    return [];
  }
}

export function recordLocalAuditLog(
  projectId: string,
  action: ProjectAuditAction,
  details: Record<string, any>,
  userId?: string
): ProjectAuditLogEntry {
  const entry: ProjectAuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    projectId,
    userId,
    action,
    details: sanitizeAuditDetails(details),
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = getLocalAuditLogs();
      const updated = [entry, ...current].slice(0, 500); // Giới hạn 500 logs gần nhất
      localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Không thể ghi local audit log:", e);
    }
  }

  return entry;
}

/**
 * Lấy lịch sử thay đổi dự án từ Supabase Cloud hoặc LocalStorage Fallback
 */
export async function getProjectAuditHistory(
  projectId: string
): Promise<ProjectAuditLogEntry[]> {
  if (typeof window !== "undefined" && isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("project_audit_log")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            projectId: d.project_id,
            orgId: d.org_id,
            userId: d.user_id,
            action: d.action as ProjectAuditAction,
            details: d.details || {},
            createdAt: d.created_at,
          }));
        }
      }
    } catch (err) {
      console.warn("Lỗi đọc Supabase audit log, dùng local:", err);
    }
  }

  return getLocalAuditLogs(projectId);
}
