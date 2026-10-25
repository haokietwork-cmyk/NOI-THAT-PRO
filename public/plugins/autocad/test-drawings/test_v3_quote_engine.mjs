import fs from 'fs';

const csvPath = 'public/plugins/autocad/test-drawings/v3_verified_cutlist.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const lines = csvContent.trim().split(/\r?\n/);

console.log('=================================================================');
console.log('   TÍNH TOÁN DỰ TOÁN BÁO GIÁ XƯỞNG MỘC - DỮ LIỆU CUTLIST V3.0   ');
console.log('=================================================================');

const parts = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  if (cols.length >= 7) {
    parts.push({
      module: cols[0],
      partName: cols[1],
      length: Number(cols[2]),
      width: Number(cols[3]),
      thickness: Number(cols[4]),
      qty: Number(cols[5]),
      material: cols[6],
      edges: cols[7] || '4_CANH'
    });
  }
}

const SHEET_M2 = 2.9768; // 1220x2440
const BOARD_WASTE = 1.15; // 15% hao hụt ván
const EDGE_WASTE = 1.08;  // 8% hao hụt chỉ

let netArea17 = 0;
let netArea6 = 0;
let totalEdgeMeters = 0;

console.log('\nDANH MỤC VẬT TƯ BÓC TÁCH TỪ CAD:');
parts.forEach((p, idx) => {
  const area = (p.length * p.width * p.qty) / 1_000_000;
  if (p.thickness === 6) {
    netArea6 += area;
  } else {
    netArea17 += area;
  }

  // Tính mét dài chỉ dán cạnh theo đúng quy cách
  let edgeMm = 0;
  if (p.edges === '4_CANH') {
    edgeMm = 2 * (p.length + p.width);
  } else if (p.edges === '1_DAI') {
    edgeMm = p.length;
  } else if (p.edges === '2_DAI') {
    edgeMm = 2 * p.length;
  } else if (p.edges === '2_DAI_1_RONG') {
    edgeMm = 2 * p.length + p.width;
  } else if (p.edges === 'KHONG_DAN') {
    edgeMm = 0;
  }
  const edgeM = (edgeMm * p.qty * EDGE_WASTE) / 1000;
  totalEdgeMeters += edgeM;

  console.log(`  ${idx+1}. [${p.partName.padEnd(16)}] ${String(p.length).padStart(4)}x${String(p.width).padStart(4)}x${p.thickness}mm | Dán: ${p.edges.padEnd(12)} | S: ${area.toFixed(3)}m2 | Chỉ: ${edgeM.toFixed(2)}m`);
});

const sheets17 = Math.ceil((netArea17 * BOARD_WASTE) / SHEET_M2);
const sheets6 = Math.ceil((netArea6 * BOARD_WASTE) / SHEET_M2);
const totalEdgeRolls = Math.ceil(totalEdgeMeters / 100); // Cuộn 100m

// Đơn giá vật tư thị trường xưởng mộc Việt Nam
const PRICE_MDF_17 = 420000; // 420k/tấm MDF lõi xanh
const PRICE_MDF_6 = 220000;  // 220k/tấm Hậu 6mm
const PRICE_EDGE_ROLL = 180000; // 180k/cuộn chỉ PVC 100m
const PRICE_LABOR_M2 = 350000; // 350k/m2 công thợ sản xuất + lắp ráp

const cost17 = sheets17 * PRICE_MDF_17;
const cost6 = sheets6 * PRICE_MDF_6;
const costEdge = totalEdgeRolls * PRICE_EDGE_ROLL;
const costLabor = Math.round((netArea17 + netArea6) * PRICE_LABOR_M2);
const totalFactoryCost = cost17 + cost6 + costEdge + costLabor;

const PROFIT_MARGIN = 0.35; // 35% biên lợi nhuận xưởng
const clientQuote = Math.round(totalFactoryCost * (1 + PROFIT_MARGIN));

console.log('\n=================================================================');
console.log('              BẢNG TỔNG HỢP VẬT TƯ & GIÁ THÀNH XƯỞNG             ');
console.log('=================================================================');
console.log(`1. Ván MDF 17mm chống ẩm : ${netArea17.toFixed(2)} m2 -> Đặt mua: ${sheets17} tấm (${cost17.toLocaleString('vi-VN')} đ)`);
console.log(`2. Ván hậu MDF 6mm       : ${netArea6.toFixed(2)} m2 -> Đặt mua: ${sheets6} tấm (${cost6.toLocaleString('vi-VN')} đ)`);
console.log(`3. Chỉ dán cạnh PVC      : ${totalEdgeMeters.toFixed(1)} md -> Đặt mua: ${totalEdgeRolls} cuộn (${costEdge.toLocaleString('vi-VN')} đ)`);
console.log(`4. Chi phí nhân công xưởng: ${(netArea17 + netArea6).toFixed(2)} m2 -> ${costLabor.toLocaleString('vi-VN')} đ`);
console.log('-----------------------------------------------------------------');
console.log(`TỔNG GIÁ VỐN SẢN XUẤT XƯỞNG (COST): ${totalFactoryCost.toLocaleString('vi-VN')} VNĐ`);
console.log(`BÁO GIÁ GỬI KHÁCH HÀNG (MARKUP 35%): ${clientQuote.toLocaleString('vi-VN')} VNĐ`);
console.log('=================================================================');
