"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Printer,
  Download,
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  User,
  Sliders,
  Boxes,
  Lock,
  ShieldCheck,
  GitBranch,
  History,
} from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";
import {
  calculateQuoteEngine,
  calculateProject,
  LEGAL_DISCLAIMER,
  resolveProjectProfitMargin,
} from "@/core/calculations/quote-engine";
import { exportWorkshopBOMExcel } from "@/core/exporters/excel-exporter";
import { WORKSHOP_TERMS } from "@/core/constants/terms";
import { isProjectContractLocked, freezeProjectContract } from "@/core/calculations/freeze-project";
import {
  getProjectAuditHistory,
  formatAuditActionVi,
  type ProjectAuditLogEntry,
} from "@/core/monitoring/audit-log";
import {
  isLegacyCalculationProject,
  calculateUpgradePreview,
  applyProjectFormulaUpgrade,
  type UpgradePreviewResult,
} from "@/core/calculations/legacy-upgrade";
import HelpTooltip from "@/core/components/HelpTooltip";

export default function ProjectWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const { projects, profile, materials, createRevision, saveProject } = useAppStore();
  const project = projects.find((p) => p.id === projectId);

  const [activeTab, setActiveTab] = useState<"bom" | "quote" | "items" | "history">("bom");
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);
  const [auditLogs, setAuditLogs] = useState<ProjectAuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradePreview, setUpgradePreview] = useState<UpgradePreviewResult | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleOpenUpgradeModal = () => {
    if (!project) return;
    const preview = calculateUpgradePreview(project, profile.costConfig);
    setUpgradePreview(preview);
    setUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!project) return;
    setIsUpgrading(true);
    try {
      const upgraded = applyProjectFormulaUpgrade(project, profile.costConfig);
      await saveProject(upgraded);
      setUpgradeModalOpen(false);
    } finally {
      setIsUpgrading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history" && project?.id) {
      setLoadingLogs(true);
      getProjectAuditHistory(project.id).then((logs) => {
        setAuditLogs(logs);
        setLoadingLogs(false);
      });
    }
  }, [activeTab, project?.id]);

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy dự án yêu cầu</h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-500 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về bàn điều khiển</span>
        </Link>
      </div>
    );
  }

  // Ưu tiên snapshot giá tại ngày tạo để bảo toàn lịch sử dự án
  const projectMaterials = (project.materialsSnapshot && project.materialsSnapshot.length > 0)
    ? project.materialsSnapshot
    : (project.materialSnapshots && project.materialSnapshots.length > 0)
    ? project.materialSnapshots
    : materials;

  const effectiveProfitMargin = resolveProjectProfitMargin(project.profitMargin);
  const calcResult = calculateQuoteEngine(
    project.items,
    projectMaterials,
    effectiveProfitMargin,
    undefined,
    project.costConfigSnapshot
  );
  const formatVND = (val: number) => (val || 0).toLocaleString("vi-VN") + " đ";

  const isLocked = isProjectContractLocked(project.status, project.isLocked);

  const handleCreateRevision = async () => {
    setIsCreatingRevision(true);
    try {
      const res = await createRevision(project.id);
      if (res.success && res.project) {
        router.push(`/quoting?id=${res.project.id}`);
      } else {
        alert(res.error || "Không thể tạo bản sửa đổi lúc này");
      }
    } finally {
      setIsCreatingRevision(false);
    }
  };

  const handleFreezeContract = async () => {
    if (
      !confirm(
        "Xác nhận CHỐT HỢP ĐỒNG và ĐÓNG BĂNG dự án?\n\nSau khi khóa, toàn bộ chi tiết tấm và giá vốn sẽ được lưu giữ bất biến 100%. Mọi thay đổi tiếp theo sẽ được tạo thành bản sửa đổi v2."
      )
    ) {
      return;
    }
    const fullCalcResult = calculateProject(
      project.items,
      projectMaterials as any,
      {
        profitMargin: effectiveProfitMargin,
        roundingStep: project.roundingStep ?? 0.5,
        costConfig: project.costConfigSnapshot,
      }
    );
    const frozen = freezeProjectContract(project, fullCalcResult, "approved");
    await saveProject(frozen);
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Banner cảnh báo công thức cũ */}
      {isLegacyCalculationProject(project) && (
        <div className="no-print p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <div>
              <strong className="font-bold">Dự án dùng công thức cũ (thiếu định mức vật tư phụ)</strong>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Bản nháp này chưa tính chi phí vật tư phụ (ốc cam, ke góc, vít, màng PE). Bạn có thể xem trước mức chênh và nâng cấp mà không đổi số âm thầm.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenUpgradeModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs shrink-0 cursor-pointer"
          >
            <span>Xem Mức Chênh & Nâng Cấp</span>
          </button>
        </div>
      )}

      {/* Top action header */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{project.projectName}</h1>
              {isLocked ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-slate-700 flex items-center gap-1 shadow-xs">
                  <Lock className="w-3 h-3 text-amber-400" />
                  ĐÃ KHÓA HỢP ĐỒNG {project.versionNo ? `(v${project.versionNo})` : ""}
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Đã bóc tách
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Khách hàng: <strong className="text-slate-700">{project.clientName}</strong> • {new Date(project.createdAt).toLocaleDateString("vi-VN")}
              {project.frozenAt && (
                <span className="ml-2 text-slate-400">• Đóng băng: {new Date(project.frozenAt).toLocaleDateString("vi-VN")}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {isLocked ? (
            <button
              onClick={handleCreateRevision}
              disabled={isCreatingRevision}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition shadow-xs"
            >
              <GitBranch className="w-3.5 h-3.5 text-amber-600" />
              <span>{isCreatingRevision ? "Đang tạo..." : `Tạo Bản Sửa Đổi v${(project.versionNo || 1) + 1}`}</span>
            </button>
          ) : (
            <>
              <Link
                href={`/quoting?id=${project.id}`}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Sửa {WORKSHOP_TERMS.cutlist.labelWithOriginal}
              </Link>
              <button
                onClick={handleFreezeContract}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chốt Hợp Đồng</span>
              </button>
            </>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-sm shadow-amber-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Giá A4</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("bom")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "bom"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>1. {WORKSHOP_TERMS.bom.labelWithOriginal} - Xưởng</span>
        </button>

        <button
          onClick={() => setActiveTab("quote")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "quote"
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          2. Báo Giá Khách Hàng (Chuẩn In A4)
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>3. Nhật Ký Thay Đổi</span>
        </button>
      </div>

      {/* TAB 1: BOM */}
      {activeTab === "bom" && (
        <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bảng Tổng Hợp Vật Tư Gửi Đại Lý</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đã tính hệ số hao hụt đường cưa đĩa (+15%) và hao hụt chỉ (+8%).
              </p>
            </div>

            <button
              onClick={() => {
                exportWorkshopBOMExcel(
                  project.projectName,
                  calcResult.boards,
                  calcResult.edges,
                  calcResult.laborCost,
                  calcResult.totalCost,
                  project.costConfigSnapshot
                );
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất file Excel đặt ván (.xlsx)</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-x-auto text-xs">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã vật liệu & Quy cách</th>
                  <th className="p-3 text-right">Net (m²)</th>
                  <th className="p-3 text-right">Hao hụt</th>
                  <th className="p-3 text-right text-amber-700 font-bold">Số tấm đặt mua</th>
                  <th className="p-3 text-right">Đơn giá vốn</th>
                  <th className="p-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {calcResult.boards.map((b) => (
                  <tr key={b.materialCode}>
                    <td className="p-3 font-mono font-bold text-slate-900">{b.materialCode}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{b.totalNetAreaM2} m²</td>
                    <td className="p-3 text-right font-mono text-slate-500">+15%</td>
                    <td className="p-3 text-right font-mono font-extrabold text-amber-700 text-sm">
                      {b.sheetsNeeded} tấm
                    </td>
                    <td className="p-3 text-right font-mono">{formatVND(b.unitPrice)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{formatVND(b.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white flex justify-between items-center text-xs">
            <span className="font-bold">TỔNG GIÁ VỐN VẬT TƯ & NHÂN CÔNG:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {formatVND(calcResult.totalCost)}
            </span>
          </div>

          {/* Phụ kiện kim khí & Chỉ dán cạnh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Chỉ dán cạnh */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">2. Chỉ dán cạnh PVC (Máy dán tự động)</span>
              <div className="flex justify-between text-slate-600">
                <span>Tổng mét dài (+8% hao hụt):</span>
                <span className="font-mono font-bold text-slate-900">
                  {calcResult.edges.totalMeters} mét dài
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thành tiền chỉ dán:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatVND(calcResult.edges.totalCost)}
                </span>
              </div>
            </div>

            {/* Phụ kiện kim khí */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 block">3. Phụ kiện kim khí xưởng (Hệ 32mm)</span>
                <HelpTooltip
                  content={`Ước tính theo cấu hình xưởng (${project.costConfigSnapshot?.hingesPerSheet ?? profile.costConfig?.hingesPerSheet ?? 2.0} bản lề/tấm, ${project.costConfigSnapshot?.slidesPerSheet ?? profile.costConfig?.slidesPerSheet ?? 0.35} bộ ray/tấm). Bạn có thể cấu hình lại tỷ lệ này trong Cài Đặt Hồ Sơ Xưởng.`}
                  label="Giải thích định mức phụ kiện"
                />
              </div>
              <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-medium">
                Ước tính theo cấu hình xưởng ({project.costConfigSnapshot?.hingesPerSheet ?? profile.costConfig?.hingesPerSheet ?? 2.0} bản lề/tấm, {project.costConfigSnapshot?.slidesPerSheet ?? profile.costConfig?.slidesPerSheet ?? 0.35} bộ ray/tấm)
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bản lề Inox 304 giảm chấn:</span>
                <span className="font-mono font-bold text-slate-900">
                  ~{Math.max(4, Math.round(calcResult.totalSheets * (project.costConfigSnapshot?.hingesPerSheet ?? profile.costConfig?.hingesPerSheet ?? 2.0)))} cái
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ray trượt âm giảm chấn 450mm:</span>
                <span className="font-mono font-bold text-slate-900">
                  ~{Math.max(1, Math.round(calcResult.totalSheets * (project.costConfigSnapshot?.slidesPerSheet ?? profile.costConfig?.slidesPerSheet ?? 0.35)))} bộ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: A4 QUOTE */}
      {activeTab === "quote" && (
        <div className="space-y-4">
          <div className="print-area bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-8 md:p-12 shadow-md space-y-6 text-xs max-w-4xl mx-auto">
            {/* Header A4 */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-800">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  {profile.name || "XƯỞNG NỘI THẤT HOÀNG GIA"}
                </h2>
                <p className="text-slate-600 text-xs">
                  Hotline: <strong>{profile.phone}</strong>
                </p>
                <p className="text-slate-500 text-[11px]">{profile.address}</p>
              </div>

              <div className="text-right">
                <span className="inline-block text-xs font-black px-3 py-1 rounded bg-slate-900 text-white tracking-widest uppercase">
                  BÁO GIÁ THI CÔNG
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Ngày: {new Date(project.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">CÔNG TRÌNH:</span>
                <strong className="text-slate-900 text-sm font-bold">{project.projectName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">KHÁCH HÀNG:</span>
                <strong className="text-slate-900 text-sm font-bold">{project.clientName}</strong>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                  <tr>
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3">{WORKSHOP_TERMS.module.labelWithOriginal}</th>
                    <th className="p-3">Quy Cách Vật Liệu</th>
                    <th className="p-3 text-right">Số Tấm</th>
                    <th className="p-3 text-right">Thành Tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calcResult.moduleSummaries.map((m, idx) => (
                    <tr key={m.moduleName}>
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{m.moduleName}</td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        MDF Chống ẩm phủ Melamine, dán chỉ PVC, ray & bản lề giảm chấn
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">{m.itemCount}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatVND(m.estimatedQuote)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">TỔNG CỘNG THANH TOÁN:</span>
                <span className="text-slate-500 text-[11px]">Đã bao gồm lắp đặt hoàn thiện tại công trình.</span>
              </div>
              <span className="text-2xl font-black text-amber-600 font-mono">
                {formatVND(calcResult.totalQuotePrice)}
              </span>
            </div>

            {/* Disclaimer */}
            <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 italic">
              {LEGAL_DISCLAIMER}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT HISTORY */}
      {activeTab === "history" && (
        <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <span>Nhật Ký Thay Đổi Dự Án (Audit Log)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận tự động các mốc chốt hợp đồng, đóng băng số liệu, thay đổi đơn giá và phiên bản bổ sung.
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
              {auditLogs.length} sự kiện
            </span>
          </div>

          {loadingLogs ? (
            <div className="py-8 text-center text-xs text-slate-400">Đang tải nhật ký thay đổi...</div>
          ) : auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Chưa có sự kiện thay đổi nào được ghi nhận cho dự án này.
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => {
                const actionMeta = formatAuditActionVi(log.action);
                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${actionMeta.badgeClass}`}
                        >
                          {actionMeta.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      {/* Chi tiết kỹ thuật */}
                      <div className="text-[11px] text-slate-600 space-x-3">
                        {log.details.old_status && log.details.new_status && (
                          <span>
                            Trạng thái: <strong>{log.details.old_status}</strong> ➔{" "}
                            <strong className="text-emerald-700">{log.details.new_status}</strong>
                          </span>
                        )}
                        {log.details.new_total_quote && (
                          <span>
                            Báo giá:{" "}
                            <strong className="font-mono text-slate-900">
                              {Number(log.details.new_total_quote).toLocaleString("vi-VN")} đ
                            </strong>
                          </span>
                        )}
                        {log.details.version_no && (
                          <span>
                            Phiên bản: <strong>v{log.details.version_no}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL XEM TRƯỚC MỨC CHÊNH NÂNG CẤP CÔNG THỨC */}
      {upgradeModalOpen && upgradePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-xs">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Xem Trước Nâng Cấp Công Thức</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bảo toàn Snapshot: Đối chiếu rõ ràng mức chênh trước khi ghi đè số liệu.
                </p>
              </div>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Giá vốn cũ (chưa có VT phụ):</span>
                  <span className="font-mono font-bold text-slate-700">
                    {formatVND(upgradePreview.currentCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Giá vốn mới (đã thêm VT phụ):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatVND(upgradePreview.upgradedCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-amber-700 font-bold border-t border-slate-200/60 pt-1.5">
                  <span>Mức chênh giá vốn:</span>
                  <span className="font-mono">+{formatVND(upgradePreview.diffCost)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-800">Báo giá cũ (gửi khách):</span>
                  <span className="font-mono font-bold text-emerald-900">
                    {formatVND(upgradePreview.currentQuote)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-800 font-bold">Báo giá mới (sau markup):</span>
                  <span className="font-mono font-black text-emerald-950 text-sm">
                    {formatVND(upgradePreview.upgradedQuote)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-700 font-bold border-t border-emerald-200/60 pt-1.5">
                  <span>Mức chênh báo giá:</span>
                  <span className="font-mono">+{formatVND(upgradePreview.diffQuote)}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Sau khi nâng cấp, dự án sẽ được chuyển sang calc_version: 1 và lưu snapshot vật tư phụ đầy đủ.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isUpgrading}
                onClick={handleConfirmUpgrade}
                className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
              >
                {isUpgrading ? "Đang nâng cấp..." : "Xác Nhận Nâng Cấp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
