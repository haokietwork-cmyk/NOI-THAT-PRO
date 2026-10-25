import fs from "fs";

const csvPath = "public/plugins/autocad/test-drawings/kitchen_island_cutlist.csv";
const csvContent = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const lines = csvContent.trim().split(/\r?\n/);

console.log("=================================================================");
console.log("   DỰ TOÁN VẬT TƯ & BÁO GIÁ HỆ BẾP CHỮ L & ĐẢO BẾP (CADCRAFT)  ");
console.log("=================================================================");
console.log(`Số dòng sau khi gom nhóm trong CSV: ${lines.length - 1} dòng chi tiết`);

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

const STANDARD_SHEET_M2 = 2.9768; // 1220 x 2440
const BOARD_WASTE_FACTOR = 1.15;  // 15% hao hụt
const EDGE_WASTE_FACTOR = 1.08;   // 8% hao hụt chỉ

let netArea17 = 0;
let netArea25 = 0;
let netArea6 = 0;
let totalEdgeMeters = 0;

console.log("\nDANH MỤC CHI TIẾT TẤM:");
parts.forEach((p, idx) => {
  const area = (p.length * p.width * p.qty) / 1_000_000;
  if (p.thickness === 6) {
    netArea6 += area;
  } else if (p.thickness === 25) {
    netArea25 += area;
  } else {
    netArea17 += area;
  }

  let edgePerPart = 0;
  if (p.edges === "4_CANH") {
    edgePerPart = 2 * (p.length + p.width) / 1000;
  }
  const edgeTotal = edgePerPart * p.qty * EDGE_WASTE_FACTOR;
  totalEdgeMeters += edgeTotal;

  console.log(`  ${idx + 1}. [${p.moduleName}] ${p.partName}: ${p.length}x${p.width}x${p.thickness}mm | SL: ${p.qty} | S: ${area.toFixed(3)} m2 | Chỉ: ${edgeTotal.toFixed(1)} md`);
});

const gross17 = netArea17 * BOARD_WASTE_FACTOR;
const sheets17ToBuy = Math.ceil(gross17 / STANDARD_SHEET_M2);

const gross25 = netArea25 * BOARD_WASTE_FACTOR;
const sheets25ToBuy = Math.ceil(gross25 / STANDARD_SHEET_M2);

const gross6 = netArea6 * BOARD_WASTE_FACTOR;
const sheets6ToBuy = Math.ceil(gross6 / STANDARD_SHEET_M2);

// Bảng đơn giá
const PRICE_MDF_17 = 450_000; // 450.000 đ/tấm
const PRICE_MDF_25 = 620_000; // 620.000 đ/tấm mặt bàn dày
const PRICE_MDF_6 = 180_000;  // 180.000 đ/tấm hậu
const PRICE_EDGE = 3_500;     // 3.500 đ/md
const LABOR_RATE = 250_000;   // 250.000 đ/m2
const PROFIT_MARGIN = 1.65;   // 65% lợi nhuận

const cost17 = sheets17ToBuy * PRICE_MDF_17;
const cost25 = sheets25ToBuy * PRICE_MDF_25;
const cost6 = sheets6ToBuy * PRICE_MDF_6;
const costEdge = Math.round(totalEdgeMeters * PRICE_EDGE);
const totalNetArea = netArea17 + netArea25 + netArea6;
const costLabor = Math.round(totalNetArea * LABOR_RATE);
const totalCost = cost17 + cost25 + cost6 + costEdge + costLabor;
const quoteTotal = Math.round(totalCost * PROFIT_MARGIN);

console.log("\n-----------------------------------------------------------------");
console.log("KẾT QUẢ ĐẶT VẬT TƯ (BẢNG BOM GỬI ĐẠI LÝ):");
console.log(`- Ván MDF 17mm chống ẩm: ${netArea17.toFixed(3)} m2 Net (Gross: ${gross17.toFixed(3)} m2) -> CẦN MUA: ${sheets17ToBuy} TẤM`);
console.log(`- Ván MDF 25mm mặt đảo:  ${netArea25.toFixed(3)} m2 Net (Gross: ${gross25.toFixed(3)} m2) -> CẦN MUA: ${sheets25ToBuy} TẤM`);
console.log(`- Ván hậu MDF 6mm:       ${netArea6.toFixed(3)} m2 Net (Gross: ${gross6.toFixed(3)} m2) -> CẦN MUA: ${sheets6ToBuy} TẤM`);
console.log(`- Chỉ dán cạnh PVC 21x1mm: ${totalEdgeMeters.toFixed(1)} mét dài (khoảng ${Math.ceil(totalEdgeMeters / 100)} cuộn 100m)`);

console.log("\n-----------------------------------------------------------------");
console.log("TỔNG HỢP DỰ TOÁN TÀI CHÍNH:");
console.log(`- Tiền ván MDF 17mm (${sheets17ToBuy} tấm): ${cost17.toLocaleString("vi-VN")} đ`);
console.log(`- Tiền ván MDF 25mm (${sheets25ToBuy} tấm): ${cost25.toLocaleString("vi-VN")} đ`);
console.log(`- Tiền ván hậu 6mm (${sheets6ToBuy} tấm): ${cost6.toLocaleString("vi-VN")} đ`);
console.log(`- Tiền chỉ dán cạnh (${totalEdgeMeters.toFixed(1)} md): ${costEdge.toLocaleString("vi-VN")} đ`);
console.log(`- Tiền nhân công sản xuất (${totalNetArea.toFixed(2)} m2): ${costLabor.toLocaleString("vi-VN")} đ`);
console.log(`- TỔNG GIÁ VỐN XƯỞNG: ${totalCost.toLocaleString("vi-VN")} đ`);
console.log(`- BÁO GIÁ GỬI KHÁCH HÀNG (Markup 1.65x): ${quoteTotal.toLocaleString("vi-VN")} đ`);
console.log("=================================================================\n");
