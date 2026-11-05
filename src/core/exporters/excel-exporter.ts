/**
 * MODULE XUẤT FILE EXCEL (.xlsx) CHUẨN XƯỞNG NỘI THẤT
 * Sử dụng thư viện xlsx (SheetJS)
 */

import * as XLSX from "xlsx";
import { WorkshopBOMBoard, WorkshopBOMEdge, CutlistItem } from "@/core/calculations/quote-engine";
import type { WorkshopCostConfig } from "@/core/types";
import type { GeneratedCostingResult } from "@/core/calculations/parametric-types";

/**
 * Xuất file Excel Bảng Tổng Hợp Vật Tư Xưởng (BOM)
 */
export function exportWorkshopBOMExcel(
  projectName: string,
  boards: any[],
  edges: any,
  laborCost: number,
  totalCost: number,
  costConfig?: WorkshopCostConfig
) {
  const wb = XLSX.utils.book_new();

  // Định mức xưởng
  const hingesRate = costConfig?.hingesPerSheet ?? 2.0;
  const slidesRate = costConfig?.slidesPerSheet ?? 0.35;
  const totalSheets = boards.reduce((s, b) => s + (b.sheetsNeeded ?? b.sheetsToBuy ?? 0), 0);
  const estHinges = Math.max(4, Math.round(totalSheets * hingesRate));
  const estSlides = Math.max(1, Math.round(totalSheets * slidesRate));

  // 1. Sheet Đặt Ván
  const boardData = boards.map((b, idx) => ({
    STT: idx + 1,
    "Mã Ván & Quy Cách": b.materialCode || b.materialName,
    "Diện Tích Net (m2)": b.totalNetAreaM2 ?? b.netAreaM2 ?? 0,
    "Số Tấm Cần Mua (1220x2440)": b.sheetsNeeded ?? b.sheetsToBuy ?? 0,
    "Đơn Giá (đ/tấm)": b.unitPrice,
    "Thành Tiền (VNĐ)": b.totalCost,
  }));
  const wsBoards = XLSX.utils.json_to_sheet(boardData);
  XLSX.utils.book_append_sheet(wb, wsBoards, "Dat_Hang_Van");

  // 2. Sheet Chỉ Dán Cạnh
  const edgeMeters = edges?.totalMeters ?? (Array.isArray(edges) ? edges[0]?.grossLengthMd : edges?.grossLengthMd) ?? 0;
  const edgePrice = edges?.unitPrice ?? (Array.isArray(edges) ? edges[0]?.unitPrice : 3500) ?? 3500;
  const edgeCost = edges?.totalCost ?? (Array.isArray(edges) ? edges[0]?.totalCost : 0) ?? 0;

  const edgeData = [
    {
      "Hạng Mục": "Chỉ dán cạnh PVC đồng màu vân gỗ",
      "Khối Lượng": `${edgeMeters} mét dài`,
      "Hao Hụt": "+8% (Máy dán cạnh tự động)",
      "Đơn Giá (đ/md)": edgePrice,
      "Thành Tiền (VNĐ)": edgeCost,
    },
  ];
  const wsEdge = XLSX.utils.json_to_sheet(edgeData);
  XLSX.utils.book_append_sheet(wb, wsEdge, "Chi_Dan_Canh");

  // 3. Sheet Phụ Kiện Kim Khí
  const hardwareData = [
    {
      "Hạng Mục Phụ Kiện": "Bản lề bật Inox 304 giảm chấn (Hệ 32mm)",
      "Quy Cách": "Chén phi 35mm, tháo lắp nhanh",
      "Số Lượng": estHinges,
      "Đơn Vị": "Cái",
      "Ghi Chú": `Ước tính theo cấu hình xưởng (${hingesRate} bản lề/tấm)`,
    },
    {
      "Hạng Mục Phụ Kiện": "Ray trượt âm giảm chấn 450mm mở toàn phần",
      "Quy Cách": "Độ sâu lọt lòng hộc ≥ 460mm, tải trọng 35kg",
      "Số Lượng": estSlides,
      "Đơn Vị": "Bộ",
      "Ghi Chú": `Ước tính theo cấu hình xưởng (${slidesRate} bộ ray/tấm)`,
    },
    {
      "Hạng Mục Phụ Kiện": "Vật tư phụ & phụ kiện liên kết (ốc cam, chốt đợt, đinh vít, keo)",
      "Quy Cách": "Quy cách chuẩn xưởng sản xuất",
      "Số Lượng": `${totalSheets} tấm`,
      "Đơn Vị": "Gói",
      "Ghi Chú": `Định mức ${costConfig?.suppliesRatePerSheet ?? 15000} đ/tấm`,
    },
  ];
  const wsHardware = XLSX.utils.json_to_sheet(hardwareData);
  XLSX.utils.book_append_sheet(wb, wsHardware, "Phu_Kien_Kim_Khi");

  // 4. Sheet Nhân Công & Tổng Hợp Giá Vốn
  const summaryData = [
    {
      "Thành Phần Giá Vốn": "1. Tiền phôi ván gỗ công nghiệp",
      "Chi Tiết": "Xem chi tiết tại Sheet Dat_Hang_Van",
      "Thành Tiền (VNĐ)": boardData.reduce((s, b) => s + (b["Thành Tiền (VNĐ)"] || 0), 0),
    },
    {
      "Thành Phần Giá Vốn": "2. Tiền chỉ dán cạnh PVC",
      "Chi Tiết": `${edgeMeters} mét dài`,
      "Thành Tiền (VNĐ)": edgeCost,
    },
    {
      "Thành Phần Giá Vốn": "3. Phụ kiện kim khí (Bản lề, ray)",
      "Chi Tiết": `Ước tính theo cấu hình xưởng (${hingesRate} bản lề/tấm, ${slidesRate} bộ ray/tấm)`,
      "Thành Tiền (VNĐ)": Math.max(0, totalCost - boardData.reduce((s, b) => s + (b["Thành Tiền (VNĐ)"] || 0), 0) - edgeCost - laborCost - (totalSheets * (costConfig?.suppliesRatePerSheet ?? 15000))),
    },
    {
      "Thành Phần Giá Vốn": "4. Vật tư phụ & phụ kiện liên kết",
      "Chi Tiết": `Định mức ${costConfig?.suppliesRatePerSheet ?? 15000} đ/tấm × ${totalSheets} tấm`,
      "Thành Tiền (VNĐ)": totalSheets * (costConfig?.suppliesRatePerSheet ?? 15000),
    },
    {
      "Thành Phần Giá Vốn": "5. Nhân công gia công xưởng & lắp ráp công trình",
      "Chi Tiết": `Định mức ${costConfig?.laborRatePerSheet ?? 120000} đ/tấm × ${totalSheets} tấm`,
      "Thành Tiền (VNĐ)": laborCost,
    },
    {
      "Thành Phần Giá Vốn": "TỔNG GIÁ VỐN NỘI BỘ XƯỞNG",
      "Chi Tiết": "Bao gồm đủ 5 thành phần giá vốn",
      "Thành Tiền (VNĐ)": totalCost,
    },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Nhan_Cong_Va_Gia_Von");

  // Xuất file về máy
  const safeName = projectName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, "_");
  XLSX.writeFile(wb, `Bang_Dat_Hang_Vat_Tu_${safeName}.xlsx`);
}

/**
 * Xuất file Excel Cutlist 8 cột chuẩn
 */
export function exportStandardCutlistExcel(projectName: string, items: CutlistItem[]) {
  const wb = XLSX.utils.book_new();

  const data = items.map((item, idx) => {
    const edgeList = [
      (item.edges?.l1 || item.edgeL1) && "D1",
      (item.edges?.l2 || item.edgeL2) && "D2",
      (item.edges?.w1 || item.edgeW1) && "R1",
      (item.edges?.w2 || item.edgeW2) && "R2",
    ].filter(Boolean).join(",");

    return {
      STT: idx + 1,
      Hang_Muc: item.moduleName,
      Ten_Chi_Tiet: item.partName,
      Dai_mm: item.lengthMm,
      Rong_mm: item.widthMm,
      Day_mm: item.thicknessMm,
      So_Luong: item.qty,
      Ma_Vat_Lieu: item.materialCode,
      Dan_Canh: edgeList,
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Cutlist_Chuan");

  const safeName = projectName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, "_");
  XLSX.writeFile(wb, `Cutlist_Chuan_${safeName}.xlsx`);
}

/**
 * Xuất file Excel Mẫu Bảng Giá Vật Tư Xưởng (Materials Template) - H5
 */
export function exportMaterialsTemplateExcel() {
  const wb = XLSX.utils.book_new();

  const templateData = [
    {
      "Mã Vật Tư": "MDF_17_CHONG_AM",
      "Tên Vật Liệu / Quy Cách": "Gỗ MDF chống ẩm lõi xanh HMR V313 dày 17mm",
      "Danh Mục": "board",
      "Đơn Vị": "tấm",
      "Khổ Dài (mm)": 2440,
      "Khổ Rộng (mm)": 1220,
      "Độ Dày (mm)": 17,
      "Hệ Số Hao Hụt": 1.15,
      "Đơn Giá Xưởng (VNĐ)": 680000,
      "Ghi Chú": "Cắt CNC ván thùng và cánh tủ",
    },
    {
      "Mã Vật Tư": "MDF_6_HAU",
      "Tên Vật Liệu / Quy Cách": "Gỗ MDF chống ẩm lõi xanh dày 6mm làm hậu tủ",
      "Danh Mục": "board",
      "Đơn Vị": "tấm",
      "Khổ Dài (mm)": 2440,
      "Khổ Rộng (mm)": 1220,
      "Độ Dày (mm)": 6,
      "Hệ Số Hao Hụt": 1.12,
      "Đơn Giá Xưởng (VNĐ)": 320000,
      "Ghi Chú": "Hậu tủ soi rãnh 9mm",
    },
    {
      "Mã Vật Tư": "CHI_PVC_DONG_MAU",
      "Tên Vật Liệu / Quy Cách": "Chỉ dán cạnh PVC đồng màu vân gỗ dày 1mm",
      "Danh Mục": "edge",
      "Đơn Vị": "md",
      "Khổ Dài (mm)": 100000,
      "Khổ Rộng (mm)": 22,
      "Độ Dày (mm)": 1,
      "Hệ Số Hao Hụt": 1.08,
      "Đơn Giá Xưởng (VNĐ)": 3500,
      "Ghi Chú": "Máy dán cạnh tự động lăn keo PUR",
    },
    {
      "Mã Vật Tư": "BAN_LE_GIAM_CHAN",
      "Tên Vật Liệu / Quy Cách": "Bản lề bật Inox 304 giảm chấn tháo lắp nhanh",
      "Danh Mục": "hardware",
      "Đơn Vị": "cái",
      "Khổ Dài (mm)": 0,
      "Khổ Rộng (mm)": 0,
      "Độ Dày (mm)": 0,
      "Hệ Số Hao Hụt": 1.0,
      "Đơn Giá Xưởng (VNĐ)": 25000,
      "Ghi Chú": "Hệ chén phi 35mm",
    },
    {
      "Mã Vật Tư": "RAY_TRUOT_AM",
      "Tên Vật Liệu / Quy Cách": "Ray trượt âm giảm chấn mở toàn phần 450mm",
      "Danh Mục": "hardware",
      "Đơn Vị": "bộ",
      "Khổ Dài (mm)": 450,
      "Khổ Rộng (mm)": 0,
      "Độ Dày (mm)": 0,
      "Hệ Số Hao Hụt": 1.0,
      "Đơn Giá Xưởng (VNĐ)": 135000,
      "Ghi Chú": "Tải trọng 35kg hộc kéo",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  XLSX.utils.book_append_sheet(wb, ws, "Mau_Don_Gia_Vat_Tu");
  XLSX.writeFile(wb, "Mau_Bang_Gia_Vat_Tu_Xuong.xlsx");
}

/**
 * Xuất file Excel Costing Sheet V2 chuẩn PTC
 */
export function exportCostingSheetExcel(
  projectName: string,
  versionNo: number = 1,
  clientName: string = "",
  costing: GeneratedCostingResult
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Tổng Hợp Chi Phí (Cost Summary)
  const summaryRows = [
    { "Hạng Mục Chi Phí": "Tên Dự Án", "Giá Trị": projectName },
    { "Hạng Mục Chi Phí": "Khách Hàng", "Giá Trị": clientName || "Khách Hàng" },
    { "Hạng Mục Chi Phí": "Phiên Bản", "Giá Trị": `v${versionNo}` },
    { "Hạng Mục Chi Phí": "Độ Tin Cậy", "Giá Trị": `${costing.confidence.stars} Sao (${costing.confidence.label})` },
    { "Hạng Mục Chi Phí": "----------------------------------------", "Giá Trị": "--------------------" },
    { "Hạng Mục Chi Phí": "1. Mặt đá tự nhiên / nhân tạo (Stone) [no OH 0%]", "Giá Trị": costing.summary.stone },
    { "Hạng Mục Chi Phí": "2. Bọc nệm / Da / Vải / Đan mây (Upholstery)", "Giá Trị": costing.summary.upholstery },
    { "Hạng Mục Chi Phí": "3. Khung kim loại gia công ngoài (Metal-S)", "Giá Trị": costing.summary.metalFrameS },
    { "Hạng Mục Chi Phí": "4. Gia công ngoài / Thầu phụ (Sub.Con)", "Giá Trị": costing.summary.subContract },
    { "Hạng Mục Chi Phí": "5. Gỗ & Ván công nghiệp (Wood/Board)", "Giá Trị": costing.summary.wood },
    { "Hạng Mục Chi Phí": "6. Khung kim loại tự sản xuất (Metal-P)", "Giá Trị": costing.summary.metalFrameP },
    { "Hạng Mục Chi Phí": "7. Kính / Gương / Cánh kính (Glass)", "Giá Trị": costing.summary.glass },
    { "Hạng Mục Chi Phí": "8. Sơn / Hóa chất / Hoàn thiện (Chemical)", "Giá Trị": costing.summary.chemical },
    { "Hạng Mục Chi Phí": "9. Phụ kiện kim khí: Bản lề, ray, LED (Hardware)", "Giá Trị": costing.summary.hardware },
    { "Hạng Mục Chi Phí": "10. Chỉ dán cạnh & Vật tư tiêu hao (Consumables)", "Giá Trị": costing.summary.consumables },
    { "Hạng Mục Chi Phí": "11. Đóng gói & Vận chuyển (Packing & Delivery)", "Giá Trị": costing.summary.packingDelivery },
    { "Hạng Mục Chi Phí": "12. Chi phí nhân công trực tiếp (Labour Total)", "Giá Trị": costing.summary.laborCostTotal },
    ...(costing.summary.customGroups
      ? Object.entries(costing.summary.customGroups).map(([k, v]) => ({
          "Hạng Mục Chi Phí": `+ Nhóm Tự Do (Adhoc): ${k.toUpperCase()}`,
          "Giá Trị": v,
        }))
      : []),
    { "Hạng Mục Chi Phí": "========================================", "Giá Trị": "====================" },
    { "Hạng Mục Chi Phí": "TỔNG VẬT TƯ & NHÂN CÔNG TRỰC TIẾP (L&M)", "Giá Trị": costing.summary.totalDirectLM },
    { "Hạng Mục Chi Phí": `• OH Xưởng sản xuất (${(costing.summary.ohWorkshopRate * 100).toFixed(0)}%)`, "Giá Trị": costing.summary.ohWorkshopAmount },
    { "Hạng Mục Chi Phí": `• OH Gia công kết hợp (${(costing.summary.ohSubcontractRate * 100).toFixed(0)}%)`, "Giá Trị": costing.summary.ohSubcontractAmount },
    { "Hạng Mục Chi Phí": "• Đá mặt bếp/bàn (no OH 0%)", "Giá Trị": 0 },
    { "Hạng Mục Chi Phí": "TỔNG CHI PHÍ CHUNG (OH)", "Giá Trị": costing.summary.totalOH },
    { "Hạng Mục Chi Phí": "========================================", "Giá Trị": "====================" },
    { "Hạng Mục Chi Phí": "GIÁ VỐN TOÀN DIỆN (COGS = L&M + OH)", "Giá Trị": costing.summary.cogs },
    { "Hạng Mục Chi Phí": `Lợi Nhuận Mục Tiêu (${(costing.summary.profitRate * 100).toFixed(0)}%)`, "Giá Trị": costing.summary.profitAmount },
    { "Hạng Mục Chi Phí": "========================================", "Giá Trị": "====================" },
    { "Hạng Mục Chi Phí": "GIÁ BÁN ĐỀ XUẤT (SALES PRICE)", "Giá Trị": costing.summary.calculateSalesPrice },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Cost_Summary");

  // 2. Sheet Bậc Số Lượng MOQ (MOQ Tiers)
  const moqRows = Object.entries(costing.summary.moqPrices || {}).map(([qty, price]) => ({
    "Số Lượng (MOQ)": Number(qty),
    "Đơn Giá Bán Đề Xuất (VNĐ)": price,
    "Tổng Thành Tiền (VNĐ)": price * Number(qty),
  }));
  const wsMoq = XLSX.utils.json_to_sheet(moqRows);
  XLSX.utils.book_append_sheet(wb, wsMoq, "MOQ_Tiers");

  // 3. Sheet Nhân Công Theo Bộ Phận (Labour)
  const labourRows = costing.labourDepts.map((l) => ({
    "Công Đoạn": l.name,
    "Bộ Phận": l.department,
    "Số Giờ Công (Hours)": l.hours,
    "Đơn Giá Giờ (VNĐ/h)": l.hourlyRate,
    "Thành Tiền Nhân Công (VNĐ)": l.totalAmount,
  }));
  const wsLabour = XLSX.utils.json_to_sheet(labourRows);
  XLSX.utils.book_append_sheet(wb, wsLabour, "Labour_Depts");

  // 4. Sheet Chi Tiết MaterialLabor
  const mlRows = costing.materialsLabor.map((m, idx) => ({
    "STT": idx + 1,
    "Khối": m.block,
    "Tên Chi Tiết / Vật Tư": m.name,
    "Mô Tả / Quy Cách": m.description,
    "Dài (mm)": m.lengthMm || 0,
    "Rộng (mm)": m.widthMm || 0,
    "Dày (mm)": m.thicknessMm || 0,
    "Số Lượng": m.qty,
    "Đơn Vị": m.unit,
    "Đơn Giá (VNĐ)": m.unitPrice,
    "Hệ Số Hao Hụt": m.wasteFactor,
    "Thành Tiền (VNĐ)": m.totalAmount,
  }));
  const wsML = XLSX.utils.json_to_sheet(mlRows);
  XLSX.utils.book_append_sheet(wb, wsML, "MaterialLabor_Detail");

  const safeName = projectName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, "_");
  XLSX.writeFile(wb, `Costing_Sheet_${safeName}_v${versionNo}.xlsx`);
}
