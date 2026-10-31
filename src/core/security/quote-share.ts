/**
 * MODULE QUẢN LÝ CHIA SẺ BÁO GIÁ AN TOÀN (SECURE QUOTE SHARE)
 * Tuân thủ Hiến Pháp GEMINI.md và AGENT_RUNBOOK.md Giai đoạn F:
 * - Sinh token ngẫu nhiên >= 128 bit (32 bytes = 256 bits).
 * - Lưu SHA-256 hash trong database, không lưu token gốc.
 * - Che dữ liệu (Sanitization) 100% tại server trước khi lưu/trả về.
 */

import crypto from "crypto";
import { LEGAL_DISCLAIMER } from "../calculations/engine.ts";
import type { SavedProject, WorkshopProfile } from "../types/index.ts";

// ==============================================================================
// 1. KIỂU DỮ LIỆU ĐÃ CHE SẠCH (CUSTOMER SANITIZED PAYLOAD)
// ==============================================================================

export interface SharedModuleItem {
  stt: number;
  moduleName: string;
  description: string;
  partCount: number;
  quotePrice: number;
}

export interface CustomerSharedQuotePayload {
  projectName: string;
  clientName: string;
  clientPhone?: string;
  contractNumber: string;
  createdAtDateVi: string;
  versionNo: number;
  workshop: {
    name: string;
    phone: string;
    address: string;
    bankInfo?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  };
  modules: SharedModuleItem[];
  totalQuotePrice: number;
  terms: string[];
  legalDisclaimer: string;
}

// Danh sách các từ khóa cấm xuất hiện trong payload khách hàng
export const FORBIDDEN_CUSTOMER_KEYS = [
  "cost",
  "basecost",
  "totalbasecost",
  "profitmargin",
  "margin",
  "waste",
  "wastefactor",
  "lengthmm",
  "widthmm",
  "thicknessmm",
  "materials",
  "materialssnapshot",
  "materialsnapshots",
  "costconfig",
  "costconfigsnapshot",
  "suppliesrate",
  "laborrate",
  "hingespersheet",
  "slidespersheet",
  "gluerate",
  "glueprice",
  "unitprice",
];

// ==============================================================================
// 2. CÁC HÀM XỬ LÝ TOKEN BẢO MẬT
// ==============================================================================

/**
 * Sinh token bảo mật ngẫu nhiên 32-byte (256-bit cryptographically secure)
 */
export function generateShareToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Tạo SHA-256 hash của token để lưu trữ vào database
 */
export function hashShareToken(token: string): string {
  if (!token || typeof token !== "string" || token.length < 16) {
    throw new Error("Token không hợp lệ để tạo hash bảo mật");
  }
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ==============================================================================
// 3. HÀM CHE DỮ LIỆU Ở SERVER (SERVER-SIDE SANITIZATION)
// ==============================================================================

export interface BuildSharedPayloadOptions {
  includeBankInfo?: boolean;
}

/**
 * Trích xuất và che sạch dữ liệu báo giá gửi khách hàng.
 * Loại bỏ toàn bộ giá vốn, hao hụt, kích thước phôi và tỷ lệ lãi nội bộ.
 */
export function buildCustomerSharedPayload(
  project: SavedProject,
  calcResult: {
    moduleQuotes: Array<{
      moduleName: string;
      description?: string;
      partCount: number;
      quotePrice: number;
    }>;
    totalQuotePrice: number;
  },
  profile: WorkshopProfile,
  options: BuildSharedPayloadOptions = {}
): CustomerSharedQuotePayload {
  const versionNo = project.versionNo ?? project.version ?? 1;
  const projectCode = project.id ? project.id.slice(0, 4).toUpperCase() : "889";

  const payload: CustomerSharedQuotePayload = {
    projectName: project.projectName || "Dự án nội thất",
    clientName: project.clientName || "Quý khách hàng",
    clientPhone: project.clientPhone || undefined,
    contractNumber: `HĐNT-2026-VN${projectCode}`,
    createdAtDateVi: new Date().toLocaleDateString("vi-VN"),
    versionNo,
    workshop: {
      name: profile.name || "XƯỞNG SẢN XUẤT NỘI THẤT",
      phone: profile.phone || "",
      address: profile.address || "",
      ...(options.includeBankInfo && profile.bankName && profile.accountNumber
        ? {
            bankInfo: {
              bankName: profile.bankName,
              accountNumber: profile.accountNumber,
              accountName: profile.accountName || "",
            },
          }
        : {}),
    },
    modules: calcResult.moduleQuotes.map((m, idx) => ({
      stt: idx + 1,
      moduleName: m.moduleName,
      description:
        m.description ||
        "Gỗ MDF chống ẩm phủ Melamine, dán cạnh chỉ PVC đồng màu, phụ kiện bản lề giảm chấn",
      partCount: m.partCount,
      quotePrice: m.quotePrice,
    })),
    totalQuotePrice: calcResult.totalQuotePrice,
    terms: [
      "100% cốt ván MDF chống ẩm lõi xanh HMR V313 đạt tiêu chuẩn phát thải E1/E2. Dán cạnh chỉ PVC đồng màu bằng keo PUR chống nước cạnh.",
      "Hoàn thiện gia công và lắp đặt trong 07 – 10 ngày làm việc kể từ ngày thống nhất mẫu ván.",
      "Bảo hành 24 tháng đối với kết cấu gỗ công nghiệp, 12 tháng đối với phụ kiện kim khí (ray trượt, bản lề).",
      "Đợt 1 tạm ứng 50% khi duyệt mẫu ván & ký hợp đồng; Đợt 2 thanh toán 50% sau khi nghiệm thu bàn giao hoàn thiện.",
    ],
    legalDisclaimer: LEGAL_DISCLAIMER,
  };

  // Xác minh lớp phòng thủ cuối cùng trước khi trả payload
  assertPayloadSanitized(payload);

  return payload;
}

/**
 * Kiểm tra đệ quy toàn bộ các key trong payload.
 * Nếu phát hiện bất kỳ key nhạy cảm nào, lập tức ném lỗi để ngăn chặn rò rỉ dữ liệu.
 */
export function assertPayloadSanitized(obj: any): void {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    obj.forEach((item) => assertPayloadSanitized(item));
    return;
  }

  for (const key of Object.keys(obj)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");
    for (const forbidden of FORBIDDEN_CUSTOMER_KEYS) {
      if (normalizedKey === forbidden || normalizedKey.includes(forbidden)) {
        throw new Error(
          `CẢNH BÁO BẢO MẬT: Phát hiện trường dữ liệu nội bộ cấm xuất hiện trong payload khách: "${key}"`
        );
      }
    }
    assertPayloadSanitized(obj[key]);
  }
}
