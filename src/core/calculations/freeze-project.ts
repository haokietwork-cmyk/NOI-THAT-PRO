/**
/**
 * MODULE ĐÓNG BĂNG HỢP ĐỒNG & BẢO TOÀN TÍNH TOÀN VẸN DỰ ÁN (P1 - GIAI ĐOẠN H1)
 * Tuân thủ Hiến pháp: Khóa chặt BOM và tổng tiền khi chốt hợp đồng.
 * Chặn sửa đổi tùy tiện, bảo đảm số vàng đã ký với khách hàng không bao giờ bị nhảy số.
 */

import crypto from "node:crypto";
import type {
  SavedProject,
  ProjectCalculationResult,
  FrozenProjectTotals,
  CutlistPart,
  ProjectStatus,
} from "../types/index.ts";

/**
 * Các trạng thái hợp đồng đã được chốt / cam kết sản xuất
 */
export const CONTRACT_LOCKED_STATUSES: readonly ProjectStatus[] = [
  "approved",
  "ordered",
  "in_production",
  "finalized",
];

/**
 * Kiểm tra xem một dự án có đang ở trạng thái đóng băng hay không
 */
export function isProjectContractLocked(status?: string, isLocked?: boolean): boolean {
  if (isLocked === true) return true;
  if (!status) return false;
  return CONTRACT_LOCKED_STATUSES.includes(status as ProjectStatus);
}

/**
 * Sinh mã băm SHA-256 xác thực toàn vẹn danh sách tấm phôi
 */
export function computeItemsHash(items: CutlistPart[]): string {
  if (!Array.isArray(items) || items.length === 0) {
    return crypto.createHash("sha256").update("EMPTY_CUTLIST").digest("hex");
  }

  // Chuẩn hóa danh sách tấm theo thứ tự xác định để mã băm không đổi
  const normalized = items.map((item) => ({
    m: item.moduleName,
    p: item.partName,
    l: item.lengthMm ?? item.length ?? 0,
    w: item.widthMm ?? item.width ?? 0,
    t: item.thicknessMm ?? item.thickness ?? 17,
    q: item.qty,
    c: item.materialCode,
    e1: Boolean(item.edgeL1),
    e2: Boolean(item.edgeL2),
    e3: Boolean(item.edgeW1),
    e4: Boolean(item.edgeW2),
  }));

  const json = JSON.stringify(normalized);
  return crypto.createHash("sha256").update(json).digest("hex");
}

/**
 * Đóng băng toàn bộ hợp đồng dự án: tổng tiền, chi tiết BOM, mét dán chỉ và mã băm cutlist
 */
export function freezeProjectContract(
  project: SavedProject,
  calcResult: ProjectCalculationResult,
  targetStatus: ProjectStatus = "approved"
): SavedProject {
  const now = new Date().toISOString();
  const itemsHash = computeItemsHash(project.items);

  const snapshotTotals: FrozenProjectTotals = {
    frozenAt: now,
    totalCost: calcResult.totalBaseCost,
    totalQuote: calcResult.totalQuotePrice,
    totalSheets: calcResult.totalSheets,
    totalEdgeLengthMd: calcResult.totalEdgeLengthMd,
    hardwareCost: calcResult.hardwareCost,
    laborCost: calcResult.laborCost,
    suppliesCost: calcResult.suppliesCost,
    boardsSummary: calcResult.boards.map((b) => ({ ...b })),
    edgesSummary: calcResult.edges.map((e) => ({ ...e })),
    itemsCount: project.items.length,
    itemsHash,
  };

  return {
    ...project,
    status: CONTRACT_LOCKED_STATUSES.includes(project.status) ? project.status : targetStatus,
    isLocked: true,
    frozenAt: project.frozenAt || now,
    totalCost: calcResult.totalBaseCost,
    totalQuote: calcResult.totalQuotePrice,
    snapshotTotals,
    updatedAt: now,
  };
}

/**
 * Tạo bản sao sửa đổi mới (Revision v2, v3...) từ một dự án đã đóng băng hợp đồng.
 * Giữ nguyên bản gốc v1 bất biến, mở bản sao mới ở trạng thái 'draft' để xưởng tiếp tục làm việc.
 */
export function createProjectRevision(
  parentProject: SavedProject,
  customNewId?: string
): SavedProject {
  const now = new Date().toISOString();
  const nextVersionNo = (parentProject.versionNo || 1) + 1;
  const newId = customNewId || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    ...parentProject,
    id: newId,
    parentProjectId: parentProject.id,
    versionNo: nextVersionNo,
    status: "draft",
    isLocked: false,
    frozenAt: undefined,
    snapshotTotals: undefined,
    createdAt: now,
    updatedAt: now,
    // Bản sao chép sâu danh sách tấm và thư viện vật tư để không bị tham chiếu chéo
    items: parentProject.items.map((item) => ({ ...item })),
    materialsSnapshot: Array.isArray(parentProject.materialsSnapshot)
      ? parentProject.materialsSnapshot.map((m) => ({ ...m }))
      : [],
    costConfigSnapshot: parentProject.costConfigSnapshot
      ? { ...parentProject.costConfigSnapshot }
      : undefined,
  };
}

/**
 * Kiểm định tính toàn vẹn của dự án đã đóng băng (Tamper Detection)
 */
export function verifyProjectIntegrity(project: SavedProject): {
  intact: boolean;
  reason?: string;
} {
  if (!project.isLocked || !project.snapshotTotals) {
    return { intact: true };
  }

  const { snapshotTotals } = project;

  // 1. Kiểm tra tổng tiền
  if (Math.abs(project.totalCost - snapshotTotals.totalCost) > 1) {
    return {
      intact: false,
      reason: `Giá vốn đã bị sửa đổi (gốc: ${snapshotTotals.totalCost}, hiện tại: ${project.totalCost})`,
    };
  }

  if (Math.abs(project.totalQuote - snapshotTotals.totalQuote) > 1) {
    return {
      intact: false,
      reason: `Tổng báo giá đã bị sửa đổi (gốc: ${snapshotTotals.totalQuote}, hiện tại: ${project.totalQuote})`,
    };
  }

  // 2. Kiểm tra mã băm cutlist
  if (snapshotTotals.itemsHash) {
    const currentHash = computeItemsHash(project.items);
    if (currentHash !== snapshotTotals.itemsHash) {
      return {
        intact: false,
        reason: "Chi tiết danh sách tấm phôi (cutlist) đã bị can thiệp trái phép sau khi đóng băng hợp đồng.",
      };
    }
  }

  return { intact: true };
}
