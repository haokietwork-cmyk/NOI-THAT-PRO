/**
 * MODULE XUẤT FILE EXCEL (.xlsx) CHUẨN XƯỞNG NỘI THẤT
 * Sử dụng thư viện xlsx (SheetJS)
 */

import * as XLSX from "xlsx";
import { WorkshopBOMBoard, WorkshopBOMEdge, CutlistItem } from "@/core/calculations/quote-engine";

/**
 * Xuất file Excel Bảng Tổng Hợp Vật Tư Xưởng (BOM)
 */
export function exportWorkshopBOMExcel(
  projectName: string,
  boards: any[],
  edges: any,
  laborCost: number,
  totalCost: number
) {
  const wb = XLSX.utils.book_new();

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
      "Đơn Vị": "Cái",
      "Ghi Chú": "Theo quy mô số cánh mở",
    },
    {
      "Hạng Mục Phụ Kiện": "Ray trượt âm giảm chấn 450mm mở toàn phần",
      "Quy Cách": "Độ sâu lọt lòng hộc ≥ 460mm, tải trọng 35kg",
      "Đơn Vị": "Bộ",
      "Ghi Chú": "Theo số lượng ngăn kéo",
    },
    {
      "Hạng Mục Phụ Kiện": "Ốc cam chốt liên kết, ke định vị",
      "Quy Cách": "Khoan mộng liên kết máy CNC",
      "Đơn Vị": "Bộ",
      "Ghi Chú": "Đầy đủ cho toàn bộ công trình",
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
      "Thành Phần Giá Vốn": "3. Phụ kiện kim khí (Bản lề, ray, ốc cam)",
      "Chi Tiết": "Ước tính theo khối lượng tủ",
      "Thành Tiền (VNĐ)": Math.max(0, totalCost - boardData.reduce((s, b) => s + (b["Thành Tiền (VNĐ)"] || 0), 0) - edgeCost - laborCost),
    },
    {
      "Thành Phần Giá Vốn": "4. Nhân công gia công xưởng & lắp ráp công trình",
      "Chi Tiết": "Định mức cắt CNC, dán cạnh & thợ lắp đặt",
      "Thành Tiền (VNĐ)": laborCost,
    },
    {
      "Thành Phần Giá Vốn": "TỔNG GIÁ VỐN NỘI BỘ XƯỞNG",
      "Chi Tiết": "Bao gồm đủ 4 thành phần giá vốn",
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
