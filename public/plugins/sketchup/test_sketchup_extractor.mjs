// ==============================================================================
// TEST HARNESS: KIỂM THỬ THUẬT TOÁN BÓC TÁCH SKETCHUP CUTLIST PRO V1.0
// ==============================================================================

import fs from 'fs';
import path from 'path';

console.log('=================================================================');
console.log('   KIỂM THỬ TOÀN DIỆN THUẬT TOÁN EXTENSION SKETCHUP (V1.0 PRO)   ');
console.log('=================================================================');

// 1. Mô phỏng mô hình 3D SketchUp với hệ thống phân cấp lồng nhau (Hierarchical Assembly)
const mockModel = [
  // Cụm Tủ Bếp Dưới (Base Cabinet Assembly)
  {
    type: 'ComponentInstance',
    name: 'Tu_Bep_Duoi_Module_800',
    trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 0, posY: 0, posZ: 0 },
    children: [
      // Hồi trái 17mm: 810 cao x 580 sâu x 17 dày
      {
        type: 'ComponentInstance',
        name: 'Hoi_Trai',
        bounds: { width: 17, height: 580, depth: 810 },
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 0, posY: 0, posZ: 0 }
      },
      // Hồi phải 17mm (Thợ lỡ copy đè 2 lần -> Test Overkill)
      {
        type: 'ComponentInstance',
        name: 'Hoi_Phai',
        bounds: { width: 17, height: 580, depth: 810 },
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 783, posY: 0, posZ: 0 }
      },
      {
        type: 'ComponentInstance',
        name: 'Hoi_Phai', // Duplicate trùng khít vị trí
        bounds: { width: 17, height: 580, depth: 810 },
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 783, posY: 0, posZ: 0 }
      },
      // Đáy tủ 17mm: 766 x 580 x 17
      {
        type: 'ComponentInstance',
        name: 'Day_Tu',
        bounds: { width: 766, height: 580, depth: 17 },
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 17, posY: 0, posZ: 80 }
      },
      // Đợt tủ 17mm có tag ghi đè dán cạnh: Dot_Tu#2D1R
      {
        type: 'ComponentInstance',
        name: 'Dot_Tu#2D1R',
        bounds: { width: 766, height: 560, depth: 17 },
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 17, posY: 10, posZ: 400 }
      },
      // Ván hậu 6mm: 790 x 750 x 6
      {
        type: 'ComponentInstance',
        name: 'Van_Hau_6mm',
        bounds: { width: 790, height: 6, depth: 750 },
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 5, posY: 574, posZ: 70 }
      },
      // Cụm Hộc Kéo Lồng Sâu (Sub-Assembly Drawer)
      {
        type: 'Group',
        name: 'Cum_Hoc_Keo',
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 20, posY: 0, posZ: 500 },
        children: [
          // Mặt ngăn kéo 17mm: Ngang 794 x Cao 250 x Dày 17 (Vân ngang)
          {
            type: 'ComponentInstance',
            name: 'Mat_Ngan_Keo',
            bounds: { width: 794, height: 17, depth: 250 },
            trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 0, posY: 0, posZ: 0 }
          }
        ]
      },
      // Cánh tủ dưới 17mm: Rộng 396 x Cao 520 (Vân dọc) x 2 cánh
      {
        type: 'ComponentInstance',
        name: 'Canh_Tu_Trai',
        bounds: { width: 396, height: 17, depth: 520 },
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 2, posY: 0, posZ: 80 }
      },
      {
        type: 'ComponentInstance',
        name: 'Canh_Tu_Phai',
        bounds: { width: 396, height: 17, depth: 520 },
        trans: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0, posX: 402, posY: 0, posZ: 80 }
      }
    ]
  },
  // Mặt bàn quầy Bar có bo góc lượn cong (Curved Countertop) bị Scale kéo dài x1.25
  {
    type: 'ComponentInstance',
    name: 'Mat_Ban_Bar_Bo_Cong',
    hasCurve: true,
    bounds: { width: 1200, height: 600, depth: 25 },
    trans: { scaleX: 1.25, scaleY: 1.0, scaleZ: 1.0, posX: 1000, posY: 0, posZ: 850 } // Real width = 1500mm
  }
];

// 2. Triển khai thuật toán Extractor như trong extractor.rb
const seenFingerprints = new Set();
let duplicateCount = 0;
const rawParts = [];

function detectSmartEdge(partName, thk) {
  const str = partName.toUpperCase();
  if (str.includes('#4C') || str.includes('4_CANH')) return '4_CANH';
  if (str.includes('#2D1R') || str.includes('2_DAI_1_RONG')) return '2_DAI_1_RONG';
  if (str.includes('#2D') || str.includes('2_DAI')) return '2_DAI';
  if (str.includes('#1D') || str.includes('1_DAI')) return '1_DAI';
  if (str.includes('#0C') || str.includes('KHONG_DAN')) return 'KHONG_DAN';

  if (thk <= 9 || str.includes('HAU') || str.includes('BACK')) return 'KHONG_DAN';
  if (str.includes('CANH') || str.includes('DOOR') || str.includes('NGAN_KEO') || str.includes('DRAWER')) return '4_CANH';
  if (str.includes('HOI') || str.includes('VACH') || str.includes('DAY') || str.includes('NOC') || str.includes('DOT') || str.includes('KE')) return '1_DAI';
  return '1_DAI';
}

function processEntity(entity, parentTrans, curModule) {
  const accumTrans = {
    scaleX: parentTrans.scaleX * entity.trans.scaleX,
    scaleY: parentTrans.scaleY * entity.trans.scaleY,
    scaleZ: parentTrans.scaleZ * entity.trans.scaleZ,
    posX: parentTrans.posX + entity.trans.posX,
    posY: parentTrans.posY + entity.trans.posY,
    posZ: parentTrans.posZ + entity.trans.posZ
  };

  const name = entity.name || 'Component';
  const nextModule = (name.startsWith('Tu_') || name.startsWith('Bep_') || name.startsWith('Mat_')) ? name : curModule;

  if (entity.children && entity.children.length > 0) {
    for (const child of entity.children) {
      processEntity(child, accumTrans, nextModule);
    }
  } else if (entity.bounds) {
    // Leaf sheet part: Tính kích thước thực sau ma trận biến đổi
    const dx = Math.round(entity.bounds.width * accumTrans.scaleX);
    const dy = Math.round(entity.bounds.height * accumTrans.scaleY);
    const dz = Math.round(entity.bounds.depth * accumTrans.scaleZ);

    const dims = [dx, dy, dz].sort((a, b) => a - b);
    let thk = dims[0];
    const dimA = dims[1];
    const dimB = dims[2];

    // Chuẩn hóa độ dày danh định xưởng
    if (thk <= 7 || name.toUpperCase().includes('HAU')) thk = 6;
    else if (thk >= 22) thk = 25;
    else thk = 17;

    // Chiều vân gỗ (Grain Direction)
    let len = dimB;
    let wid = dimA;
    if (name.toUpperCase().includes('CANH')) {
      // Cánh tủ: Chiều cao tủ (Z) là chiều vân đứng
      len = dz;
      wid = (dx === thk) ? dy : dx;
    } else if (name.toUpperCase().includes('NGAN_KEO')) {
      // Ngăn kéo: Chiều ngang (X) là chiều vân ngang
      len = dx;
      wid = (dz === thk) ? dy : dz;
    }

    const edge = detectSmartEdge(name, thk);

    // Lọc trùng lặp Overkill
    const cX = Math.round(accumTrans.posX + dx / 2);
    const cY = Math.round(accumTrans.posY + dy / 2);
    const cZ = Math.round(accumTrans.posZ + dz / 2);
    const fp = `${name}|${thk}|${len}|${wid}|${cX}|${cY}|${cZ}`;

    if (seenFingerprints.has(fp)) {
      duplicateCount++;
      return;
    }
    seenFingerprints.add(fp);

    let mat = 'MDF_CHONG_AM_17';
    if (thk === 6) mat = 'MDF_VAN_HAU_6';
    else if (thk === 25) mat = 'MDF_CHONG_AM_25';

    rawParts.push({
      moduleName: nextModule,
      partName: name.replace(/#[0-9A-Z_]+/, ''),
      len,
      wid,
      thk,
      mat,
      edge,
      hasCurve: !!entity.hasCurve
    });
  }
}

// Bắt đầu duyệt mô hình
for (const ent of mockModel) {
  processEntity(ent, { scaleX: 1, scaleY: 1, scaleZ: 1, posX: 0, posY: 0, posZ: 0 }, 'Noi_That_Chung');
}

console.log(`>>> 1. DUYỆT CÂY PHÂN CẤP: Bóc tách thành công ${rawParts.length} tấm ván đơn lẻ.`);
console.log(`>>> 2. [LỌC VẼ ĐÈ OVERKILL]: Phát hiện và loại bỏ ${duplicateCount} đối tượng vẽ trùng!`);

// Gom nhóm số lượng thông minh (Smart Aggregation)
const aggMap = new Map();
for (const p of rawParts) {
  const key = `${p.moduleName}|${p.partName}|${p.len}|${p.wid}|${p.thk}|${p.mat}|${p.edge}`;
  if (aggMap.has(key)) {
    aggMap.get(key).qty += 1;
  } else {
    aggMap.set(key, { ...p, qty: 1 });
  }
}
const aggParts = Array.from(aggMap.values());

console.log(`>>> 3. [GOM NHÓM QUY CÁCH]: Tự động gom thành ${aggParts.length} dòng quy cách.`);

console.log('\n--- BẢNG DANH MỤC CHI TIẾT BÓC TÁCH TỪ SKETCHUP ---');
aggParts.forEach((p, idx) => {
  console.log(`[${idx+1}] [${p.moduleName.padEnd(24)}] ${p.partName.padEnd(20)} | ${String(p.len).padStart(4)}x${String(p.wid).padStart(4)}x${p.thk}mm | SL: ${p.qty} | Dán chỉ: ${p.edge.padEnd(12)} | ${p.hasCurve ? 'BO CONG R' : 'Chuẩn'}`);
});

// Tính toán định mức vật tư
const SHEET_M2 = 2.9768;
let net17 = 0;
let net6 = 0;
let net25 = 0;
let totalEdgeM = 0;

aggParts.forEach(p => {
  const area = (p.len * p.wid * p.qty) / 1_000_000;
  if (p.thk === 6) net6 += area;
  else if (p.thk === 25) net25 += area;
  else net17 += area;

  let edgeMm = 0;
  if (p.edge === '4_CANH') edgeMm = 2 * (p.len + p.wid);
  else if (p.edge === '1_DAI') edgeMm = p.len;
  else if (p.edge === '2_DAI_1_RONG') edgeMm = 2 * p.len + p.wid;
  totalEdgeM += (edgeMm * p.qty * 1.08) / 1000;
});

const sheets17 = Math.ceil((net17 * 1.15) / SHEET_M2);
const sheets6 = Math.ceil((net6 * 1.15) / SHEET_M2);
const sheets25 = Math.ceil((net25 * 1.15) / SHEET_M2);
const edgeRolls = Math.ceil(totalEdgeM / 100);

console.log('\n=================================================================');
console.log('              TỔNG HỢP VẬT TƯ ĐẶT HÀNG CHO XƯỞNG                ');
console.log('=================================================================');
console.log(`1. Ván MDF 17mm chống ẩm : ${net17.toFixed(2)} m² Net -> Đặt mua: ${sheets17} tấm khổ 1220x2440`);
console.log(`2. Ván hậu MDF 6mm       : ${net6.toFixed(2)} m² Net -> Đặt mua: ${sheets6} tấm`);
console.log(`3. Ván mặt bàn 25mm      : ${net25.toFixed(2)} m² Net -> Đặt mua: ${sheets25} tấm (Kéo dài x1.25 -> 1500x600mm)`);
console.log(`4. Chỉ dán cạnh PVC      : ${totalEdgeM.toFixed(1)} md -> Đặt mua: ${edgeRolls} cuộn (100m)`);
console.log('=================================================================');

// Xuất file CSV UTF-8 có BOM
const csvRows = ['Hang_Muc,Ten_Chi_Tiet,Dai,Rong,Day,So_Luong,Ma_Vat_Lieu,Dan_Canh'];
aggParts.forEach(p => {
  csvRows.push(`${p.moduleName},${p.partName},${p.len},${p.wid},${p.thk},${p.qty},${p.mat},${p.edge}`);
});
const outCsvPath = path.resolve('public/plugins/sketchup/sample_sketchup_cutlist.csv');
fs.writeFileSync(outCsvPath, '\uFEFF' + csvRows.join('\n'), 'utf8');
console.log(`>>> Đã xuất file mẫu CSV chuẩn web: ${outCsvPath}`);
