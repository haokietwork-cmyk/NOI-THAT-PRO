import fs from "fs";

// Đọc file CSV xuất từ CADCraft
const csvContent = fs.readFileSync("public/plugins/autocad/test-drawings/production_cutlist_output.csv", "utf8");
const cleanContent = csvContent.replace(/^\uFEFF/, ""); // Xóa BOM khi đọc
const lines = cleanContent.trim().split(/\r?\n/);
const headers = lines[0].split(",");

console.log("=================================================================");
console.log("   KIỂM TRA TÍNH TOÁN DỰ TOÁN TỪ FILE CSV XUẤT RA TỪ CADCRAFT   ");
console.log("=================================================================");
console.log(`Số dòng trong CSV: ${lines.length - 1} dòng`);

const parts = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(",");
  if (cols.length >= 7) {
    parts.push({
      moduleName: cols[0],
      partName: cols[1],
      length: Number(cols[2]),
      width: Number(cols[3]),
      thickness: Number(cols[4]),
      qty: Number(cols[5]),
      materialCode: cols[6],
      edges: cols[7] || "4_CANH",
    });
  }
}

// Tính diện tích Net và Gross chuẩn theo công thức GEMINI.md
const STANDARD_SHEET_M2 = 2.9768; // 1220 x 2440 mm
const BOARD_WASTE_FACTOR = 1.15;  // 15% hao hụt ván
const EDGE_WASTE_FACTOR = 1.08;   // 8% hao hụt chỉ dán cạnh

let totalNetAreaM2 = 0;
let totalEdgeMeters = 0;

console.log("\nDANH SÁCH CHI TIẾT TẤM:");
parts.forEach((p, idx) => {
  const netArea = (p.length * p.width * p.qty) / 1_000_000;
  totalNetAreaM2 += netArea;

  // Tính mét dài chỉ dán cạnh (D1 + D2 + R1 + R2) * Qty
  let edgePerPart = 0;
  if (p.edges === "4_CANH") {
    edgePerPart = 2 * (p.length + p.width) / 1000;
  } else if (p.edges === "1_DAI") {
    edgePerPart = p.length / 1000;
  } else if (p.edges === "2_DAI") {
    edgePerPart = 2 * p.length / 1000;
  }
  const partEdgeTotal = edgePerPart * p.qty * EDGE_WASTE_FACTOR;
  totalEdgeMeters += partEdgeTotal;

  console.log(`  ${idx + 1}. [${p.moduleName}] ${p.partName}: ${p.length}x${p.width}x${p.thickness}mm | SL: ${p.qty} | Net: ${netArea.toFixed(3)} m2 | Chỉ: ${partEdgeTotal.toFixed(1)} md`);
});

const totalGrossAreaM2 = totalNetAreaM2 * BOARD_WASTE_FACTOR;
const sheetsNeededExact = totalGrossAreaM2 / STANDARD_SHEET_M2;
const sheetsToOrder = Math.ceil(sheetsNeededExact);

// Giả định đơn giá thị trường xưởng mộc
const BOARD_UNIT_PRICE = 450_000; // 450.000 đ / tấm MDF 17mm chống ẩm
const EDGE_UNIT_PRICE = 3_500;    // 3.500 đ / mét dài chỉ PVC 21x1mm
const LABOR_PER_M2 = 250_000;     // 250.000 đ / m2 nhân công cắt dán đóng gói
const PROFIT_MARGIN = 1.65;       // Hệ số lợi nhuận 65%

const boardCost = sheetsToOrder * BOARD_UNIT_PRICE;
const edgeCost = Math.round(totalEdgeMeters * EDGE_UNIT_PRICE);
const laborCost = Math.round(totalNetAreaM2 * LABOR_PER_M2);
const totalCost = boardCost + edgeCost + laborCost;
const totalQuote = Math.round(totalCost * PROFIT_MARGIN);

console.log("\n-----------------------------------------------------------------");
console.log("KẾT QUẢ QUY ĐỔI VẬT TƯ NỘI BỘ (GÓC NHÌN XƯỞNG):");
console.log(`- Tổng diện tích ván thực tế (Net): ${totalNetAreaM2.toFixed(3)} m2`);
console.log(`- Tổng diện tích cộng hao hụt (Gross 15%): ${totalGrossAreaM2.toFixed(3)} m2`);
console.log(`- Số tấm ván tiêu chuẩn (1220x2440): ${sheetsNeededExact.toFixed(2)} tấm -> ĐẶT MUA: ${sheetsToOrder} TẤM`);
console.log(`- Tổng mét dài chỉ dán cạnh (Hao hụt 8%): ${totalEdgeMeters.toFixed(1)} md`);
console.log(`- Chi phí ván MDF: ${boardCost.toLocaleString("vi-VN")} đ`);
console.log(`- Chi phí chỉ dán cạnh: ${edgeCost.toLocaleString("vi-VN")} đ`);
console.log(`- Chi phí nhân công sản xuất: ${laborCost.toLocaleString("vi-VN")} đ`);
console.log(`- TỔNG GIÁ VỐN SẢN XUẤT: ${totalCost.toLocaleString("vi-VN")} đ`);

console.log("\n-----------------------------------------------------------------");
console.log("KẾT QUẢ BÁO GIÁ KHÁCH HÀNG (GÓC NHÌN KHÁCH):");
console.log(`- Hệ số Markup lợi nhuận xưởng: ${PROFIT_MARGIN}x`);
console.log(`- TỔNG GIÁ TRỊ HỢP ĐỒNG BÁO GIÁ: ${totalQuote.toLocaleString("vi-VN")} đ`);
console.log("=================================================================\n");
