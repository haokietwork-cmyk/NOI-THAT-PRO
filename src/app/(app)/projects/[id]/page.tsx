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
import HelpTooltip from "@/core/components/HelpTooltip";

export default function ProjectWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const { projects, profile, materials, createRevision, saveProject } = useAppStore();
  const project = projects.find((p) => p.id === projectId);

  const [activeTab, setActiveTab] = useState<"bom" | "quote" | "items">("bom");
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);

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

        <div className="flex items-center gap-2">
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
      <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2">
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

          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
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
        </div>
      )}

      {/* TAB 2: A4 QUOTE */}
      {activeTab === "quote" && (
        <div className="space-y-4">
          <div className="print-area bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 shadow-md space-y-6 text-xs max-w-4xl mx-auto">
            {/* Header A4 */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
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
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
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
            <table className="w-full text-left border-collapse text-xs">
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

            {/* Total */}
            <div className="pt-4 border-t-2 border-slate-800 flex justify-between items-center">
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
    </div>
  );
}
