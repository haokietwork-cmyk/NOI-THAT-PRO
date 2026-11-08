"use client";

import React, { useState } from "react";
import {
  Box,
  Wrench,
  Table,
  Bed,
  FlaskConical,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
  DollarSign,
} from "lucide-react";
import type {
  StructuralBlockId,
  CompletionScope,
  ExecutionSource,
  MaterialAllocationRow,
  UniversalProductStructure,
} from "../calculations/structural-schema.ts";
import { STRUCTURAL_BLOCK_DEFINITIONS } from "../calculations/structural-schema.ts";
import type { MaterialItem } from "../types/index.ts";

interface UniversalStructureBlockConfiguratorProps {
  structure: UniversalProductStructure;
  onChange: (updater: (prev: UniversalProductStructure) => UniversalProductStructure) => void;
  workshopMaterials?: MaterialItem[];
}

export default function UniversalStructureBlockConfigurator({
  structure,
  onChange,
  workshopMaterials = [],
}: UniversalStructureBlockConfiguratorProps) {
  const [expandedBlock, setExpandedBlock] = useState<StructuralBlockId | null>("B1_PANEL_BOX");

  const toggleBlock = (blockId: StructuralBlockId) => {
    onChange((prev) => {
      const isEnabled = prev.enabledBlocks.includes(blockId);
      const newEnabled = isEnabled
        ? prev.enabledBlocks.filter((b) => b !== blockId)
        : [...prev.enabledBlocks, blockId];

      return {
        ...prev,
        enabledBlocks: newEnabled,
      };
    });

    if (!structure.enabledBlocks.includes(blockId)) {
      setExpandedBlock(blockId);
    }
  };

  const getBlockIcon = (id: StructuralBlockId) => {
    switch (id) {
      case "B1_PANEL_BOX":
        return <Box className="w-4 h-4" />;
      case "B2_FRAME_SKELETON":
        return <Wrench className="w-4 h-4" />;
      case "B3_SURFACE_SLAB":
        return <Table className="w-4 h-4" />;
      case "B4_VOLUME_CUSHION":
        return <Bed className="w-4 h-4" />;
      case "B5_SURFACE_FINISH":
        return <FlaskConical className="w-4 h-4" />;
      case "B6_HARDWARE_ELECTRO":
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* ================================================================== */}
      {/* THANH CHỌN 6 KHỐI CẤU TẠO VẬT LÝ TỔNG QUÁT (BLOCK SELECTOR BAR)    */}
      {/* ================================================================== */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Mô-đun Kết cấu Vật lý Sản phẩm (Bật/Tắt theo thực tế)</span>
          </label>
          <span className="text-[11px] text-slate-500 font-medium">
            Đang bật: <strong className="text-slate-900">{structure.enabledBlocks.length}/6 khối</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(Object.keys(STRUCTURAL_BLOCK_DEFINITIONS) as StructuralBlockId[]).map((id) => {
            const def = STRUCTURAL_BLOCK_DEFINITIONS[id];
            const isEnabled = structure.enabledBlocks.includes(id);

            return (
              <div
                key={id}
                onClick={() => {
                  toggleBlock(id);
                }}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition select-none flex flex-col justify-between ${
                  isEnabled
                    ? "bg-white border-slate-900 shadow-2xs text-slate-900"
                    : "bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-white/80"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                      isEnabled ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {getBlockIcon(id)}
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isEnabled ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"
                    }`}
                  >
                    {isEnabled ? "✓" : "+"}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold leading-tight truncate" title={def.name}>
                    {def.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5" title={def.shortDesc}>
                    {def.shortDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* CHI TIẾT CẤU HÌNH TỪNG KHỐI ĐƯỢC BẬT (EXPANDABLE CONFIG CARDS)      */}
      {/* ================================================================== */}
      <div className="space-y-3">
        {/* ---------------------------------------------------------------- */}
        {/* KHỐI 1: B1_PANEL_BOX (THÙNG HỘP & VÁCH VÁN)                     */}
        {/* ---------------------------------------------------------------- */}
        {structure.enabledBlocks.includes("B1_PANEL_BOX") && structure.panelBoxConfig && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => setExpandedBlock(expandedBlock === "B1_PANEL_BOX" ? null : "B1_PANEL_BOX")}
              className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center">
                  <Box className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Khối 1: Thùng Hộp, Vách Tấm &amp; Cánh Tủ
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Chế độ: {structure.panelBoxConfig.geometryMode} • Cánh mở: {structure.panelBoxConfig.swingDoors} • Ngăn kéo: {structure.panelBoxConfig.drawers}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  {structure.panelBoxConfig.scope === "FULL_TURNKEY" ? "Trọn gói xưởng" : structure.panelBoxConfig.scope}
                </span>
                {expandedBlock === "B1_PANEL_BOX" ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedBlock === "B1_PANEL_BOX" && (
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Kiểu hình học thùng hộp:
                    </label>
                    <select
                      value={structure.panelBoxConfig.geometryMode}
                      onChange={(e) => {
                        const mode = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          panelBoxConfig: prev.panelBoxConfig
                            ? { ...prev.panelBoxConfig, geometryMode: mode }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="CLOSED_CABINET_BOX">Tủ hộp kín có cánh &amp; ngăn kéo</option>
                      <option value="OPEN_SHELF_BOX">Kệ mở không cánh (đợt trang trí)</option>
                      <option value="SINGLE_PANEL_FACE">Vách phẳng 1 mặt (ốp tường/hậu)</option>
                      <option value="BASE_NO_TOP">Tủ dưới không nóc (để đặt mặt đá)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Phạm vi cung ứng:
                    </label>
                    <select
                      value={structure.panelBoxConfig.scope}
                      onChange={(e) => {
                        const sc = e.target.value as CompletionScope;
                        onChange((prev) => ({
                          ...prev,
                          panelBoxConfig: prev.panelBoxConfig
                            ? { ...prev.panelBoxConfig, scope: sc }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="FULL_TURNKEY">Trọn gói 100% (Xưởng cấp ván &amp; hoàn thiện)</option>
                      <option value="SEMI_FINISHED">Bán thành phẩm (Cắt CNC phôi thô)</option>
                      <option value="CLIENT_MATERIAL_COM">Khách cấp ván (Chỉ tính công cắt &amp; phụ kiện)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nẹp chỉ dán cạnh PVC:
                    </label>
                    <select
                      value={structure.panelBoxConfig.edgeBandingRule}
                      onChange={(e) => {
                        const rule = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          panelBoxConfig: prev.panelBoxConfig
                            ? { ...prev.panelBoxConfig, edgeBandingRule: rule }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="ALL_EXPOSED_EDGES">Dán 4 cạnh lộ thiên (Chuẩn xưởng)</option>
                      <option value="FRONT_ONLY">Chỉ dán mép trước mặt tiền</option>
                      <option value="MITER_45_NO_EDGE">Vát mòi 45° ghép không dán chỉ</option>
                      <option value="NONE">Không dán chỉ (Gỗ thịt / Ván trơn)</option>
                    </select>
                  </div>
                </div>

                {/* Các biến số công năng ảnh hưởng trực tiếp đến bản lề & ray */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Số cánh mở:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={structure.panelBoxConfig.swingDoors}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        onChange((prev) => ({
                          ...prev,
                          panelBoxConfig: prev.panelBoxConfig
                            ? { ...prev.panelBoxConfig, swingDoors: val }
                            : undefined,
                        }));
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      = {structure.panelBoxConfig.swingDoors * 2} - {structure.panelBoxConfig.swingDoors * 4} bản lề
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Số ngăn kéo:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={structure.panelBoxConfig.drawers}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        onChange((prev) => ({
                          ...prev,
                          panelBoxConfig: prev.panelBoxConfig
                            ? { ...prev.panelBoxConfig, drawers: val }
                            : undefined,
                        }));
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      = {structure.panelBoxConfig.drawers} bộ ray trượt
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Số đợt ngang:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={structure.panelBoxConfig.horizontalShelves}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        onChange((prev) => ({
                          ...prev,
                          panelBoxConfig: prev.panelBoxConfig
                            ? { ...prev.panelBoxConfig, horizontalShelves: val }
                            : undefined,
                        }));
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Số vách đứng:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={structure.panelBoxConfig.verticalDividers}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        onChange((prev) => ({
                          ...prev,
                          panelBoxConfig: prev.panelBoxConfig
                            ? { ...prev.panelBoxConfig, verticalDividers: val }
                            : undefined,
                        }));
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Vật tư ván thùng */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Vật liệu ván thùng hộp chính:
                    </label>
                  </div>
                  <select
                    value={structure.panelBoxConfig.materials[0]?.materialCode || "MDF_17_CHONG_AM"}
                    onChange={(e) => {
                      const code = e.target.value;
                      const matName =
                        code === "MDF_17_CHONG_AM"
                          ? "Ván MDF chống ẩm lõi xanh 17mm"
                          : code === "PLYWOOD_17"
                          ? "Ván Plywood Bạch Dương kháng nước 17mm"
                          : code === "PVC_17"
                          ? "Ván nhựa đặc Picomat chịu nước 17mm"
                          : code === "MFC_18_CHONG_AM"
                          ? "Ván MFC chống ẩm lõi xanh 18mm"
                          : "Ván chuyên dụng";
                      const price =
                        code === "PLYWOOD_17"
                          ? 850000
                          : code === "PVC_17"
                          ? 980000
                          : code === "MFC_18_CHONG_AM"
                          ? 520000
                          : 680000;

                      onChange((prev) => {
                        if (!prev.panelBoxConfig) return prev;
                        return {
                          ...prev,
                          panelBoxConfig: {
                            ...prev.panelBoxConfig,
                            materials: [
                              {
                                id: "mat_b1_main",
                                materialCode: code,
                                materialName: matName,
                                category: "BOARD",
                                unit: "sheet",
                                unitPriceVnd: price,
                                baseWasteFactor: 1.15,
                                allocationRatio: 1.0,
                              },
                            ],
                          },
                        };
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                  >
                    <option value="MDF_17_CHONG_AM">MDF chống ẩm lõi xanh 17mm (680.000 đ/tấm)</option>
                    <option value="PLYWOOD_17">Plywood Bạch Dương kháng nước 17mm (850.000 đ/tấm)</option>
                    <option value="PVC_17">Ván nhựa đặc Picomat chịu nước 17mm (980.000 đ/tấm)</option>
                    <option value="MFC_18_CHONG_AM">MFC chống ẩm lõi xanh 18mm (520.000 đ/tấm)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* KHỐI 2: B2_FRAME_SKELETON (KHUNG XƯƠNG, CHÂN ĐỠ & THANH GIẰNG)   */}
        {/* ---------------------------------------------------------------- */}
        {structure.enabledBlocks.includes("B2_FRAME_SKELETON") && structure.frameSkeletonConfig && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => setExpandedBlock(expandedBlock === "B2_FRAME_SKELETON" ? null : "B2_FRAME_SKELETON")}
              className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Khối 2: Khung Xương, Chân Đỡ &amp; Thanh Giằng Chịu Lực
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Kiểu: {structure.frameSkeletonConfig.geometryMode} • Phối hợp: {structure.frameSkeletonConfig.materials.length} vật liệu
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-semibold border border-sky-200">
                  {structure.frameSkeletonConfig.materials.map((m) => m.materialName.split(" ")[0]).join(" + ")}
                </span>
                {expandedBlock === "B2_FRAME_SKELETON" ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedBlock === "B2_FRAME_SKELETON" && (
              <div className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Kiểu kết cấu khung chịu lực:
                    </label>
                    <select
                      value={structure.frameSkeletonConfig.geometryMode}
                      onChange={(e) => {
                        const mode = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          frameSkeletonConfig: prev.frameSkeletonConfig
                            ? { ...prev.frameSkeletonConfig, geometryMode: mode }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="RIBBED_STRUCTURAL_BOX">Khung hộp đố giằng chịu lực dày (Sofa, Giường, Vách)</option>
                      <option value="PERIMETER_4_LEGS">4 chân + diềm đỡ mặt bàn / ghế đơn</option>
                      <option value="SPACE_FRAME_3D">Khung lồng không gian 3D (Kim loại / Kệ mở)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Bước đố giằng phụ:
                    </label>
                    <select
                      value={structure.frameSkeletonConfig.ribSpacingMm}
                      onChange={(e) => {
                        const spacing = parseInt(e.target.value) as any;
                        onChange((prev) => ({
                          ...prev,
                          frameSkeletonConfig: prev.frameSkeletonConfig
                            ? { ...prev.frameSkeletonConfig, ribSpacingMm: spacing }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value={300}>300 mm (Dày đặc chịu lực lớn)</option>
                      <option value={400}>400 mm (Tiêu chuẩn đồ bọc / khung bàn)</option>
                      <option value={500}>500 mm (Thưa nhẹ cho kệ thấp)</option>
                      <option value={0}>0 (Không có đố giằng phụ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nguồn thực hiện:
                    </label>
                    <select
                      value={structure.frameSkeletonConfig.executionSource}
                      onChange={(e) => {
                        const src = e.target.value as ExecutionSource;
                        onChange((prev) => ({
                          ...prev,
                          frameSkeletonConfig: prev.frameSkeletonConfig
                            ? { ...prev.frameSkeletonConfig, executionSource: src }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="IN_HOUSE">Sản xuất tại xưởng (Chịu Overhead xưởng)</option>
                      <option value="SUBCONTRACT">Thuê cơ khí / xưởng mộc ngoài (10% OH)</option>
                      <option value="PASS_THROUGH">Mua sẵn thương mại (0% OH)</option>
                    </select>
                  </div>
                </div>

                {/* Danh sách vật liệu phối hợp trong khung (BUG-02 Fix) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Vật liệu phối hợp trong kết cấu khung:</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        (Hỗ trợ nhiều vật liệu: Plywood + Gỗ Beech + Poplar + Sắt...)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        onChange((prev) => {
                          if (!prev.frameSkeletonConfig) return prev;
                          const nextIdx = prev.frameSkeletonConfig.materials.length + 1;
                          const newMat: MaterialAllocationRow = {
                            id: `frame_mat_${Date.now()}`,
                            materialCode: `MAT_TIMBER_${nextIdx}`,
                            materialName: "Gỗ Tần Bì (Ash) xẻ sấy phôi chuẩn",
                            category: "TIMBER_M3",
                            unit: "m3",
                            unitPriceVnd: 18500000,
                            baseWasteFactor: 1.45,
                            allocationRatio: 0.3,
                          };
                          return {
                            ...prev,
                            frameSkeletonConfig: {
                              ...prev.frameSkeletonConfig,
                              materials: [...prev.frameSkeletonConfig.materials, newMat],
                            },
                          };
                        });
                      }}
                      className="text-xs font-semibold text-slate-900 hover:text-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm vật liệu phối hợp</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {structure.frameSkeletonConfig.materials.map((mat, idx) => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900 truncate">
                            {mat.materialName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            ({mat.unitPriceVnd.toLocaleString("vi-VN")} đ/{mat.unit})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-500 font-mono">
                            Tỷ trọng: {Math.round((mat.allocationRatio || 1.0) * 100)}%
                          </span>
                          {structure.frameSkeletonConfig!.materials.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                onChange((prev) => {
                                  if (!prev.frameSkeletonConfig) return prev;
                                  return {
                                    ...prev,
                                    frameSkeletonConfig: {
                                      ...prev.frameSkeletonConfig,
                                      materials: prev.frameSkeletonConfig.materials.filter(
                                        (m) => m.id !== mat.id
                                      ),
                                    },
                                  };
                                });
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* KHỐI 3: B3_SURFACE_SLAB (MẶT ĐÁ, KÍNH & TẤM MẶT BÀN/ỐP)         */}
        {/* ---------------------------------------------------------------- */}
        {structure.enabledBlocks.includes("B3_SURFACE_SLAB") && structure.surfaceSlabConfig && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => setExpandedBlock(expandedBlock === "B3_SURFACE_SLAB" ? null : "B3_SURFACE_SLAB")}
              className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center">
                  <Table className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Khối 3: Mặt Đá, Cánh Kính &amp; Tấm Mặt Trang Trí
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Kiểu: {structure.surfaceSlabConfig.geometryMode} • Cạnh: {structure.surfaceSlabConfig.edgeProfile}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                  {structure.surfaceSlabConfig.materials[0]?.materialName || "Mặt đá/kính"}
                </span>
                {expandedBlock === "B3_SURFACE_SLAB" ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedBlock === "B3_SURFACE_SLAB" && (
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Kiểu bố trí mặt đá/kính:
                    </label>
                    <select
                      value={structure.surfaceSlabConfig.geometryMode}
                      onChange={(e) => {
                        const mode = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          surfaceSlabConfig: prev.surfaceSlabConfig
                            ? { ...prev.surfaceSlabConfig, geometryMode: mode }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="TOP_HORIZONTAL">Mặt ngang W × D (Bàn ăn, mặt bếp, đảo bàn)</option>
                      <option value="WATERFALL_3_SIDES">Thác đổ 3 mặt liền (Đảo bếp vát mòi)</option>
                      <option value="FRONT_VERTICAL">Mặt đứng W × H (Cánh kính Slim, vách gương)</option>
                      <option value="CUSTOM_AREA">Diện tích tùy chỉnh theo thiết kế</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Gia công cạnh mòi:
                    </label>
                    <select
                      value={structure.surfaceSlabConfig.edgeProfile}
                      onChange={(e) => {
                        const prof = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          surfaceSlabConfig: prev.surfaceSlabConfig
                            ? { ...prev.surfaceSlabConfig, edgeProfile: prof }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="MITER_45_THICK">Vát mòi 45° ghép liền khối (sang trọng)</option>
                      <option value="FLAT_POLISH">Mài bóng thẳng tiêu chuẩn</option>
                      <option value="BULLNOSE_CNC">Bo tròn R5 CNC mềm mại</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nguồn thực hiện (Overhead):
                    </label>
                    <select
                      value={structure.surfaceSlabConfig.executionSource}
                      onChange={(e) => {
                        const src = e.target.value as ExecutionSource;
                        onChange((prev) => ({
                          ...prev,
                          surfaceSlabConfig: prev.surfaceSlabConfig
                            ? { ...prev.surfaceSlabConfig, executionSource: src }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="PASS_THROUGH">Mua đứt thương mại (0% OH - chuẩn đá đại lý)</option>
                      <option value="SUBCONTRACT">Thuê thầu phụ gia công (10% OH)</option>
                      <option value="IN_HOUSE">Xưởng tự cắt mài (25% OH)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Chủng loại vật liệu mặt:
                  </label>
                  <select
                    value={structure.surfaceSlabConfig.materials[0]?.materialCode || "STONE_VICOSTONE"}
                    onChange={(e) => {
                      const code = e.target.value;
                      const matName =
                        code === "STONE_VICOSTONE"
                          ? "Đá Thạch Anh Nhân Tạo Vicostone Cao Cấp"
                          : code === "STONE_WHITE_CERAMIC"
                          ? "Đá Trắng Sứ Nung Kết Vân Mây Kháng Ố"
                          : code === "GLASS_SMOKE_5"
                          ? "Kính Cường Lực Tôi Nhiệt 5mm Màu Khói"
                          : "Đá Granite Kim Sa Tự Nhiên";
                      const price =
                        code === "STONE_VICOSTONE"
                          ? 2850000
                          : code === "STONE_WHITE_CERAMIC"
                          ? 2200000
                          : code === "GLASS_SMOKE_5"
                          ? 650000
                          : 1650000;

                      onChange((prev) => {
                        if (!prev.surfaceSlabConfig) return prev;
                        return {
                          ...prev,
                          surfaceSlabConfig: {
                            ...prev.surfaceSlabConfig,
                            materials: [
                              {
                                id: "mat_b3_main",
                                materialCode: code,
                                materialName: matName,
                                category: code.includes("GLASS") ? "GLASS_M2" : "STONE_M2",
                                unit: "m2",
                                unitPriceVnd: price,
                                baseWasteFactor: 1.1,
                                allocationRatio: 1.0,
                              },
                            ],
                          },
                        };
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                  >
                    <option value="STONE_VICOSTONE">Đá Vicostone nhân tạo cao cấp (2.850.000 đ/m²)</option>
                    <option value="STONE_WHITE_CERAMIC">Đá trắng sứ Ceramic vân mây (2.200.000 đ/m²)</option>
                    <option value="STONE_BLACK_GALAXY">Đá Granite Kim Sa trung tự nhiên (1.650.000 đ/m²)</option>
                    <option value="GLASS_SMOKE_5">Kính cường lực màu khói 5mm (650.000 đ/m²)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* KHỐI 4: B4_VOLUME_CUSHION (ĐỆM MÚT, ĐÀN HỒI & BỌC VẢI/DA/MÂY)   */}
        {/* ---------------------------------------------------------------- */}
        {structure.enabledBlocks.includes("B4_VOLUME_CUSHION") && structure.volumeCushionConfig && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => setExpandedBlock(expandedBlock === "B4_VOLUME_CUSHION" ? null : "B4_VOLUME_CUSHION")}
              className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center">
                  <Bed className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Khối 4: Khối Đệm Mút, Hệ Đàn Hồi &amp; Vỏ Bọc Da/Vải/Mây
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Kiểu: {structure.volumeCushionConfig.geometryMode} • Cấp độ:{" "}
                    <strong className="text-slate-900">
                      {structure.volumeCushionConfig.scope === "SEMI_FINISHED"
                        ? "Finish to Foam (Bán thành phẩm)"
                        : structure.volumeCushionConfig.scope === "CLIENT_MATERIAL_COM"
                        ? "Khách cấp vải (COM)"
                        : "Trọn gói 100%"}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                  {structure.volumeCushionConfig.scope}
                </span>
                {expandedBlock === "B4_VOLUME_CUSHION" ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedBlock === "B4_VOLUME_CUSHION" && (
              <div className="p-4 space-y-4 text-xs">
                {/* 3 Chế độ Hoàn thiện: Trọn gói vs Finish to Foam vs Khách cấp COM (BUG-04 Fix) */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <label className="text-[11px] font-bold text-slate-800 block">
                    Cấp độ hoàn thiện đệm &amp; vỏ bọc (Completion Scope):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        scope: "FULL_TURNKEY" as CompletionScope,
                        label: "Trọn Gói Hoàn Thiện",
                        desc: "Xưởng cấp đủ mút + vải/da bọc ngoài",
                      },
                      {
                        scope: "SEMI_FINISHED" as CompletionScope,
                        label: "Finish to Foam (Bán thành phẩm)",
                        desc: "Lên khung mút hoàn chỉnh, tiền vải bọc ngoài = 0 đ",
                      },
                      {
                        scope: "CLIENT_MATERIAL_COM" as CompletionScope,
                        label: "Khách Cấp Vải/Da (COM)",
                        desc: "Tiền vải = 0 đ, xuất định mức md cần cấp & tính công bọc",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.scope}
                        type="button"
                        onClick={() => {
                          onChange((prev) => ({
                            ...prev,
                            volumeCushionConfig: prev.volumeCushionConfig
                              ? { ...prev.volumeCushionConfig, scope: opt.scope }
                              : undefined,
                          }));
                        }}
                        className={`p-2.5 rounded-md border text-left cursor-pointer transition ${
                          structure.volumeCushionConfig!.scope === opt.scope
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="font-bold text-xs">{opt.label}</div>
                        <div
                          className={`text-[10px] mt-0.5 leading-snug ${
                            structure.volumeCushionConfig!.scope === opt.scope
                              ? "text-slate-300"
                              : "text-slate-500"
                          }`}
                        >
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Kiểu hình học khối đệm:
                    </label>
                    <select
                      value={structure.volumeCushionConfig.geometryMode}
                      onChange={(e) => {
                        const mode = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          volumeCushionConfig: prev.volumeCushionConfig
                            ? { ...prev.volumeCushionConfig, geometryMode: mode }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="SCULPTED_PLUMP_3D">Khối đệm 3D bo tròn (Sofa toàn khối, Armchair)</option>
                      <option value="L_SHAPE_SEAT_BACK">Đệm ngồi + Tựa lưng góc chữ L</option>
                      <option value="FULL_WRAP_360">Bọc trùm 360° toàn thân</option>
                      <option value="FLAT_PAD_1D">Đệm phẳng lót mặt W × D (Ghế ăn, đôn phẳng)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Hệ đàn hồi đáy khung:
                    </label>
                    <select
                      value={structure.volumeCushionConfig.suspensionSystem}
                      onChange={(e) => {
                        const sys = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          volumeCushionConfig: prev.volumeCushionConfig
                            ? { ...prev.volumeCushionConfig, suspensionSystem: sys }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="SINUOUS_SPRING_WEBBING">Lò xo zic-zac &amp; Đai thun dệt (Sofa chuẩn)</option>
                      <option value="WEBBING_STRAP">Đai thun đan dệt chịu lực</option>
                      <option value="NONE">Không (Đặt đệm trực tiếp lên ván/khung)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Kiểu đường may &amp; viền mí:
                    </label>
                    <select
                      value={structure.volumeCushionConfig.seamAndDetailStyle}
                      onChange={(e) => {
                        const seam = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          volumeCushionConfig: prev.volumeCushionConfig
                            ? { ...prev.volumeCushionConfig, seamAndDetailStyle: seam }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="PIPING_WELT">Gân mí viền sang trọng (Piping Welt)</option>
                      <option value="PLAIN_SEAM">May can phẳng giấu chỉ tiêu chuẩn</option>
                      <option value="DEEP_TUFTING">Rút múi quả trám cổ điển (Tufting)</option>
                    </select>
                  </div>
                </div>

                {/* Vật liệu Mút & Vỏ bọc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Loại mút đệm chính:
                    </label>
                    <select
                      value={structure.volumeCushionConfig.foamMaterials[0]?.materialCode || "FOAM_D40"}
                      onChange={(e) => {
                        const code = e.target.value;
                        const matName =
                          code === "FOAM_D40"
                            ? "Mút xốp D40 đổ khối kháng xẹp lún"
                            : "Mút xốp mềm D25 tạo độ êm";
                        const price = code === "FOAM_D40" ? 4850000 : 3800000;

                        onChange((prev) => {
                          if (!prev.volumeCushionConfig) return prev;
                          return {
                            ...prev,
                            volumeCushionConfig: {
                              ...prev.volumeCushionConfig,
                              foamMaterials: [
                                {
                                  id: "mat_b4_foam",
                                  materialCode: code,
                                  materialName: matName,
                                  category: "FOAM_M3",
                                  unit: "m3",
                                  unitPriceVnd: price,
                                  baseWasteFactor: 1.15,
                                  allocationRatio: 1.0,
                                },
                              ],
                            },
                          };
                        });
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="FOAM_D40">Mút D40 cao cấp kháng xẹp lún (4.850.000 đ/m³)</option>
                      <option value="FOAM_D25">Mút D25 êm mềm tạo phom (3.800.000 đ/m³)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Chất liệu vải / da bọc ngoài:
                    </label>
                    <select
                      disabled={structure.volumeCushionConfig.scope === "SEMI_FINISHED"}
                      value={structure.volumeCushionConfig.coverMaterials[0]?.materialCode || "FABRIC_MICROFIBER"}
                      onChange={(e) => {
                        const code = e.target.value;
                        const matName =
                          code === "FABRIC_MICROFIBER"
                            ? "Vải da Microfiber cao cấp kháng trầy"
                            : code === "FABRIC_VELVET"
                            ? "Vải nỉ nhung tuyết nhập khẩu Hàn Quốc"
                            : "Da bò Ý tự nhiên cao cấp";
                        const price =
                          code === "FABRIC_MICROFIBER"
                            ? 280000
                            : code === "FABRIC_VELVET"
                            ? 220000
                            : 850000;

                        onChange((prev) => {
                          if (!prev.volumeCushionConfig) return prev;
                          return {
                            ...prev,
                            volumeCushionConfig: {
                              ...prev.volumeCushionConfig,
                              coverMaterials: [
                                {
                                  id: "mat_b4_cover",
                                  materialCode: code,
                                  materialName: matName,
                                  category: "FABRIC_MD",
                                  unit: "md",
                                  unitPriceVnd: price,
                                  baseWasteFactor: 1.18,
                                  allocationRatio: 1.0,
                                },
                              ],
                            },
                          };
                        });
                      }}
                      className={`w-full p-2 border rounded text-xs font-medium ${
                        structure.volumeCushionConfig.scope === "SEMI_FINISHED"
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    >
                      <option value="FABRIC_MICROFIBER">Vải da Microfiber kháng trầy (280.000 đ/md)</option>
                      <option value="FABRIC_VELVET">Vải nỉ nhung tuyết nhập khẩu (220.000 đ/md)</option>
                      <option value="LEATHER_COW">Da bò tự nhiên thuộc mộc (850.000 đ/md)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* KHỐI 5: B5_SURFACE_FINISH (SƠN PU, 2K & HOÀN THIỆN BỀ MẶT)        */}
        {/* ---------------------------------------------------------------- */}
        {structure.enabledBlocks.includes("B5_SURFACE_FINISH") && structure.surfaceFinishConfig && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => setExpandedBlock(expandedBlock === "B5_SURFACE_FINISH" ? null : "B5_SURFACE_FINISH")}
              className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center">
                  <FlaskConical className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Khối 5: Xử Lý Bề Mặt, Sơn PU/2K &amp; Mạ Hoàn Thiện
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Quy trình: {structure.surfaceFinishConfig.finishType}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200">
                  {structure.surfaceFinishConfig.finishType}
                </span>
                {expandedBlock === "B5_SURFACE_FINISH" ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedBlock === "B5_SURFACE_FINISH" && (
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Công nghệ &amp; chủng loại sơn hoàn thiện:
                    </label>
                    <select
                      value={structure.surfaceFinishConfig.finishType}
                      onChange={(e) => {
                        const ft = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          surfaceFinishConfig: prev.surfaceFinishConfig
                            ? { ...prev.surfaceFinishConfig, finishType: ft }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="PU_WOOD_COATING">Sơn PU mờ Inchem cao cấp cho gỗ tự nhiên (350.000 đ/m²)</option>
                      <option value="PAINT_2K">Sơn bệt men mờ 2K chống ố vàng cho MDF (380.000 đ/m²)</option>
                      <option value="POWDER_COAT_METAL">Sơn tĩnh điện kim loại (180.000 đ/m²)</option>
                      <option value="PVD_PLATING">Mạ PVD kim loại titan vàng gương / Champagne (650.000 đ/m²)</option>
                      <option value="MELAMINE_PRELAM">Phủ sẵn Melamine / Laminate (0 đ chi phí sơn rời)</option>
                      <option value="NONE_RAW">Phôi mộc thô chưa sơn (0 đ sơn)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nguồn thi công:
                    </label>
                    <select
                      value={structure.surfaceFinishConfig.executionSource}
                      onChange={(e) => {
                        const src = e.target.value as ExecutionSource;
                        onChange((prev) => ({
                          ...prev,
                          surfaceFinishConfig: prev.surfaceFinishConfig
                            ? { ...prev.surfaceFinishConfig, executionSource: src }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="IN_HOUSE">Sơn tại buồng sơn xưởng (25% OH)</option>
                      <option value="SUBCONTRACT">Gửi xưởng sơn ngoài (10% OH)</option>
                      <option value="PASS_THROUGH">Không tính OH (0%)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* KHỐI 6: B6_HARDWARE_ELECTRO (PHỤ KIỆN KIM KHÍ & ĐÈN LED)         */}
        {/* ---------------------------------------------------------------- */}
        {structure.enabledBlocks.includes("B6_HARDWARE_ELECTRO") && structure.hardwareElectroConfig && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => setExpandedBlock(expandedBlock === "B6_HARDWARE_ELECTRO" ? null : "B6_HARDWARE_ELECTRO")}
              className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Khối 6: Phụ Kiện Kim Khí, Liên Kết &amp; Hệ Đèn LED
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Phân khúc: {structure.hardwareElectroConfig.hardwareTier} • LED:{" "}
                    {structure.hardwareElectroConfig.hasLedSystem ? "Có lắp LED" : "Không"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200">
                  {structure.hardwareElectroConfig.hardwareTier}
                </span>
                {expandedBlock === "B6_HARDWARE_ELECTRO" ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedBlock === "B6_HARDWARE_ELECTRO" && (
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Phân khúc phụ kiện kim khí:
                    </label>
                    <select
                      value={structure.hardwareElectroConfig.hardwareTier}
                      onChange={(e) => {
                        const tier = e.target.value as any;
                        onChange((prev) => ({
                          ...prev,
                          hardwareElectroConfig: prev.hardwareElectroConfig
                            ? { ...prev.hardwareElectroConfig, hardwareTier: tier }
                            : undefined,
                        }));
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    >
                      <option value="STANDARD_DTC">Tiêu chuẩn: Bản lề &amp; ray DTC giảm chấn</option>
                      <option value="MID_HAFELE">Trung cấp: Phụ kiện Hafele Đức</option>
                      <option value="PREMIUM_BLUM">Cao cấp: Bản lề &amp; ray Blum Áo chính hãng</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Hệ đèn LED âm &amp; cảm biến:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onChange((prev) => ({
                            ...prev,
                            hardwareElectroConfig: prev.hardwareElectroConfig
                              ? { ...prev.hardwareElectroConfig, hasLedSystem: !prev.hardwareElectroConfig.hasLedSystem }
                              : undefined,
                          }));
                        }}
                        className={`px-3 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          structure.hardwareElectroConfig.hasLedSystem
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>{structure.hardwareElectroConfig.hasLedSystem ? "ĐANG BẬT ĐÈN LED" : "TẮT ĐÈN LED"}</span>
                      </button>

                      {structure.hardwareElectroConfig.hasLedSystem && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0.5}
                            step={0.5}
                            max={50}
                            value={structure.hardwareElectroConfig.ledMetersCount || 2.0}
                            onChange={(e) => {
                              const meters = parseFloat(e.target.value) || 2.0;
                              onChange((prev) => ({
                                ...prev,
                                hardwareElectroConfig: prev.hardwareElectroConfig
                                  ? { ...prev.hardwareElectroConfig, ledMetersCount: meters }
                                  : undefined,
                              }));
                            }}
                            className="w-16 p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-xs"
                          />
                          <span className="text-[11px] text-slate-500 font-mono">mét LED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
