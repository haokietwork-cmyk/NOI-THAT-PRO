/**
 * THƯ VIỆN DANH MỤC VẬT TƯ & CÔNG ĐOẠN NHÂN CÔNG MẪU (THAM KHẢO)
 * Trích xuất từ Sheet1, Quy trình (cột M-Q) và Material (dòng 723: 105.000 đ/hr = 4.2 USD/hr)
 * LƯU Ý QUAN TRỌNG: Mọi số liệu trong file này chỉ là THAM KHẢO BAN ĐẦU,
 * KHÔNG GÁN CỨNG. Người dùng / xưởng có thể tự do chỉnh sửa, ghi đè hoặc bổ sung.
 */

export interface LaborProcessDefinition {
  stt: number;
  group: string;
  code: string;
  nameEn: string;
  nameVi: string;
  defaultRateUSD: number;
  defaultRateVND: number;
}

export interface ExportMaterialItem {
  rmCode: string | null;
  name: string;
  category: string;
  subCategory: string | null;
  unit: string;
  waste: number;
  priceVND: number;
  priceUSD: number;
}

export interface MoqConfigTier {
  moq: number;
  surchargePercent: number; // Tỷ lệ %, VD: 0, 5, 10, 25, 120, 200
}

/**
 * 37 Công đoạn sản xuất thực tế chuẩn ngành nội thất gỗ khối & xuất khẩu
 * Nguồn: Sheet Quy trình (Cột M-Q), đơn giá tham khảo 4.2 USD/h (Dòng 723 Sheet Material)
 */
export const LABOR_PROCESSES: LaborProcessDefinition[] = [
  {
    "stt": 1,
    "group": "RAW",
    "code": "RAW",
    "nameEn": "Raw Material",
    "nameVi": "Nguyên vật liệu đầu vào",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 2,
    "group": "MDF",
    "code": "CNC-MDF",
    "nameEn": "CNC MDF",
    "nameVi": "Gia công CNC trên ván MDF",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 3,
    "group": "VEN",
    "code": "VN",
    "nameEn": "Veneer",
    "nameVi": "Phủ veneer (gỗ mỏng tự nhiên)",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 4,
    "group": "VEN",
    "code": "BRASS",
    "nameEn": "Brass Work",
    "nameVi": "Gia công chi tiết bằng đồng",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 5,
    "group": "MAC",
    "code": "MAC",
    "nameEn": "Machining",
    "nameVi": "Gia công cơ khí",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 6,
    "group": "MAC",
    "code": "TUR",
    "nameEn": "Turning",
    "nameVi": "Tiện (gia công tròn)",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 7,
    "group": "MAC",
    "code": "BRUSH",
    "nameEn": "Brushing",
    "nameVi": "Chải bề mặt (tạo vân/texture)",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 8,
    "group": "MAC",
    "code": "CAR",
    "nameEn": "Carving",
    "nameVi": "Chạm khắc",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 9,
    "group": "CNC",
    "code": "CNC",
    "nameEn": "CNC Machining",
    "nameVi": "Gia công CNC tổng quát",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 10,
    "group": "ASSE",
    "code": "ASSE",
    "nameEn": "Assembly",
    "nameVi": "Lắp ráp",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 11,
    "group": "SUB",
    "code": "SUB",
    "nameEn": "Sub-Assembly",
    "nameVi": "Lắp ráp bán thành phẩm",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 12,
    "group": "CMF",
    "code": "CMF",
    "nameEn": "Color Material Finish",
    "nameVi": "Xử lý màu sắc – vật liệu – hoàn thiện",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 13,
    "group": "SAS",
    "code": "SAND",
    "nameEn": "Sanding",
    "nameVi": "Chà nhám",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 14,
    "group": "MIX",
    "code": "MIX",
    "nameEn": "Mixing",
    "nameVi": "Pha trộn (sơn / hóa chất)",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 15,
    "group": "ATS",
    "code": "ANT-STN",
    "nameEn": "Anti-stain",
    "nameVi": "Chống thấm / chống bẩn",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 16,
    "group": "SAB",
    "code": "SBL",
    "nameEn": "Sandblast",
    "nameVi": "Phun cát xử lý bề mặt",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 17,
    "group": "SPD",
    "code": "SPR",
    "nameEn": "Spraying",
    "nameVi": "Phun sơn",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 18,
    "group": "DEM",
    "code": "MSP",
    "nameEn": "Mass Production",
    "nameVi": "Sản xuất hàng loạt",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 19,
    "group": "MEC",
    "code": "MEC",
    "nameEn": "Mechanical",
    "nameVi": "Gia công cơ khí ( bỏ bước này trong quy trình chuẩn",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 20,
    "group": "DEM",
    "code": "ANT-FIN",
    "nameEn": "Antique Finish",
    "nameVi": "Hoàn thiện giả cổ",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 21,
    "group": "DED",
    "code": "DECO",
    "nameEn": "Decoration",
    "nameVi": "Trang trí",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 22,
    "group": "DED",
    "code": "DED-BRASS",
    "nameEn": "Detailed Brass",
    "nameVi": "Gia công chi tiết đồng tinh xảo",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 23,
    "group": "DED",
    "code": "GES",
    "nameEn": "Gesso",
    "nameVi": "Sơn lót gesso (tạo nền)",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 24,
    "group": "DEG",
    "code": "ANT-MIR",
    "nameEn": "Antique Mirror",
    "nameVi": "Gương giả cổ",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 25,
    "group": "DED",
    "code": "LEA",
    "nameEn": "Leather",
    "nameVi": "Bọc da",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 26,
    "group": "DEG",
    "code": "EGL",
    "nameEn": "Electroplating",
    "nameVi": "Mạ điện",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 27,
    "group": "DER",
    "code": "RES",
    "nameEn": "Resin",
    "nameVi": "Đổ nhựa / phủ resin",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 28,
    "group": "ATD",
    "code": "ANT-FIN",
    "nameEn": "Antique Finish",
    "nameVi": "Hoàn thiện giả cổ (lặp)",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 29,
    "group": "ATD",
    "code": "ANT-BRASS",
    "nameEn": "Antique Brass",
    "nameVi": "Đồng giả cổ",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 30,
    "group": "ATD",
    "code": "ANT-FRA",
    "nameEn": "Antique Frame",
    "nameVi": "Khung giả cổ",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 31,
    "group": "ATC",
    "code": "ANTIQUE",
    "nameEn": "Antique",
    "nameVi": "Hiệu ứng tổng thể giả cổ",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 32,
    "group": "UPH",
    "code": "UPH",
    "nameEn": "Upholstery",
    "nameVi": "Bọc nệm / bọc vải",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 33,
    "group": "FTD",
    "code": "FITTING",
    "nameEn": "Fitting",
    "nameVi": "Gắn phụ kiện",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 34,
    "group": "FTD",
    "code": "FIT-BRASS",
    "nameEn": "Brass Fitting",
    "nameVi": "Gắn phụ kiện đồng",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 35,
    "group": "FTD",
    "code": "FIT-WASH",
    "nameEn": "Washer Fitting",
    "nameVi": "Gắn vòng đệm",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 36,
    "group": "WAD",
    "code": "WAS",
    "nameEn": "Washing",
    "nameVi": "Rửa / làm sạch",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  },
  {
    "stt": 37,
    "group": "PAK",
    "code": "PAK",
    "nameEn": "Packing",
    "nameVi": "Đóng gói",
    "defaultRateUSD": 4.2,
    "defaultRateVND": 105000
  }
];

/**
 * Cấu hình hằng số chiết tính mặc định (tham khảo, người dùng có thể tùy biến)
 */
export const DEFAULT_EXPORT_CONSTANTS = {
  fx: 25000,           // Tỷ giá quy đổi VND/USD
  ohGeneral: 0.35,     // Overhead chung 35%
  ohSubcon: 0.10,      // Overhead gia công ngoài 10%
  ohMarble: 0,         // Overhead đá 0%
  markup: 0.20,        // Tỷ suất lợi nhuận trên giá thành 20%
  defaultLaborRateUSD: 4.2, // Đơn giá nhân công theo giờ (105.000 VND / 25.000)
  defaultLaborRateVND: 105000,
};

/**
 * Bảng phụ phí MOQ linh hoạt mặc định (người dùng có thể thêm/xóa/sửa bậc)
 */
export const DEFAULT_MOQ_TIERS: MoqConfigTier[] = [
  { moq: 1, surchargePercent: 120 },
  { moq: 2, surchargePercent: 80 },
  { moq: 5, surchargePercent: 25 },
  { moq: 10, surchargePercent: 10 },
  { moq: 20, surchargePercent: 0 },
  { moq: 50, surchargePercent: -5 },
  { moq: 100, surchargePercent: -10 },
  { moq: 200, surchargePercent: -15 },
];

/**
 * Danh mục hơn 600 vật tư tham khảo chuẩn xưởng (Sheet1 ngày 28/08/2026)
 */
export const SAMPLE_MATERIALS_CATALOG: ExportMaterialItem[] = [
  {
    "rmCode": "WO01-ASH-0007",
    "name": "Ash Wood 26 Com#1",
    "category": "WOOD",
    "subCategory": "Ash Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 20790000.0,
    "priceUSD": 831.6
  },
  {
    "rmCode": "WO01-ASH-0005",
    "name": "Ash Wood 32 Com#1",
    "category": "WOOD",
    "subCategory": "Ash Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 22788150.0,
    "priceUSD": 911.526
  },
  {
    "rmCode": "WO01-ASH-0010",
    "name": "Ash Wood 38 Com#1",
    "category": "WOOD",
    "subCategory": "Ash Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 24583650.0,
    "priceUSD": 983.346
  },
  {
    "rmCode": "WO01-ASH-0001",
    "name": "Ash Wood 50 Com#1",
    "category": "WOOD",
    "subCategory": "Ash Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 25385850.0,
    "priceUSD": 1015.434
  },
  {
    "rmCode": "WO01-ASH-0017",
    "name": "Ash Wood 4/4Com#2",
    "category": "WOOD",
    "subCategory": "Ash Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 17745000.0,
    "priceUSD": 709.8
  },
  {
    "rmCode": "WO01-ASH-0003",
    "name": "Ash Wood 5/4Com#2",
    "category": "WOOD",
    "subCategory": "Ash Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 18007500.0,
    "priceUSD": 720.3
  },
  {
    "rmCode": null,
    "name": "Ash Wood 6/4Com#2",
    "category": "WOOD",
    "subCategory": "Ash Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 18375000.0,
    "priceUSD": 735.0
  },
  {
    "rmCode": null,
    "name": "Ash Wood 8/4Com#2",
    "category": "WOOD",
    "subCategory": "Ash Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 18690000.0,
    "priceUSD": 747.6
  },
  {
    "rmCode": "WO01-BEE-0003",
    "name": "Beech Wood COM #1 26mm",
    "category": "WOOD",
    "subCategory": "Beech Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16177350.0,
    "priceUSD": 647.094
  },
  {
    "rmCode": "WO01-BEE-0002",
    "name": "Beech Wood COM #1 32mm",
    "category": "WOOD",
    "subCategory": "Beech Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16706550.0,
    "priceUSD": 668.262
  },
  {
    "rmCode": "WO01-BEE-0005",
    "name": "Beech Wood COM #1 38mm",
    "category": "WOOD",
    "subCategory": "Beech Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16873616.0,
    "priceUSD": 674.9446
  },
  {
    "rmCode": "WO01-BEE-0001",
    "name": "Beech Wood COM #1 50mm",
    "category": "WOOD",
    "subCategory": "Beech Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16960650.0,
    "priceUSD": 678.426
  },
  {
    "rmCode": "WO01-BEE-0011",
    "name": "Beech Wood COM #2 26mm",
    "category": "WOOD",
    "subCategory": "Beech Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 11106900.0,
    "priceUSD": 444.276
  },
  {
    "rmCode": "WO01-BEE-0010",
    "name": "Beech Wood COM #2 32mm",
    "category": "WOOD",
    "subCategory": "Beech Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 12311250.0,
    "priceUSD": 492.45
  },
  {
    "rmCode": "WO01-BEE-0009",
    "name": "Beech Wood COM #2 38mm",
    "category": "WOOD",
    "subCategory": "Beech Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 12579000.0,
    "priceUSD": 503.16
  },
  {
    "rmCode": "WO01-BEE-0007",
    "name": "Beech Wood COM #2 50mm",
    "category": "WOOD",
    "subCategory": "Beech Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 12713400.0,
    "priceUSD": 508.536
  },
  {
    "rmCode": "WO01-RBR-0006",
    "name": "Rubber wood  26",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 7140000.0,
    "priceUSD": 285.6
  },
  {
    "rmCode": "WO01-RBR-0007",
    "name": "Rubber wood  33",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 7770000.0,
    "priceUSD": 310.8
  },
  {
    "rmCode": "WO01-RBR-0008",
    "name": "Rubber wood  45",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 7770000.0,
    "priceUSD": 310.8
  },
  {
    "rmCode": "WO01-RBR-0009",
    "name": "Rubber wood  55",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 7875000.0,
    "priceUSD": 315.0
  },
  {
    "rmCode": "WO01-RBR-0010",
    "name": "Rubber wood  67",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 7770000.0,
    "priceUSD": 310.8
  },
  {
    "rmCode": "WO01-RBR-0011",
    "name": "Rubber wood  75",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 9450000.0,
    "priceUSD": 378.0
  },
  {
    "rmCode": "WO09-0022",
    "name": "Gỗ cao su ghép 12x1220x2400 mặt AB - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 210981.0,
    "priceUSD": 8.4392
  },
  {
    "rmCode": "WO09-0015",
    "name": "Gỗ cao su ghép 15x1220x2400 mặt AB - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 236250.0,
    "priceUSD": 9.45
  },
  {
    "rmCode": "WO09-0016",
    "name": "Gỗ cao su ghép 19x1220x2400 mặt AB - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 319619.0,
    "priceUSD": 12.7847
  },
  {
    "rmCode": "WO09-0017",
    "name": "Gỗ cao su ghép 25x1220x2400 mặt AB - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 401558.0,
    "priceUSD": 16.0623
  },
  {
    "rmCode": "WO09-0014",
    "name": "Gỗ cao su ghép 25x1220x2440 mặt BC - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 352534.0,
    "priceUSD": 14.1014
  },
  {
    "rmCode": "WO09-0013",
    "name": "Gỗ cao su ghép 19x1220x2440 mặt BC - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 215250.0,
    "priceUSD": 8.61
  },
  {
    "rmCode": "WO09-0012",
    "name": "Gỗ cao su ghép 15x1220x2440 mặt BC - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 197273.0,
    "priceUSD": 7.8909
  },
  {
    "rmCode": "W009-0011",
    "name": "Tấm cao su ghép 12x1220x2400 mặt BC - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 201600.0,
    "priceUSD": 8.064
  },
  {
    "rmCode": "WO09-0045",
    "name": "Gỗ cao su ghép 30x1220x2400 mặt CC - Finger joint panel CC Grade (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 309750.0,
    "priceUSD": 12.39
  },
  {
    "rmCode": "WO09-0044",
    "name": "Gỗ cao su ghép 20x1220x2400 mặt CC - Finger joint panel (rubber wood)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 189000.0,
    "priceUSD": 7.56
  },
  {
    "rmCode": "WO09-0002",
    "name": "Gỗ cao su ghép 18x1220x2440 ( CC Grade ) - Finger joint panel (rubber)",
    "category": "WOOD",
    "subCategory": "Rubber Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 173250.0,
    "priceUSD": 6.93
  },
  {
    "rmCode": "WO01-POP-0008",
    "name": "Poplar wood COM2   #4/4",
    "category": "WOOD",
    "subCategory": "Poplar Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 8610000.0,
    "priceUSD": 344.4
  },
  {
    "rmCode": "WO01-POP-0004",
    "name": "Poplar wood COM2   #5/4",
    "category": "WOOD",
    "subCategory": "Poplar Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 9360540.0,
    "priceUSD": 374.4216
  },
  {
    "rmCode": "WO01-POP-0009",
    "name": "Poplar wood COM2   #6/4",
    "category": "WOOD",
    "subCategory": "Poplar Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 10692412.0,
    "priceUSD": 427.6965
  },
  {
    "rmCode": "WO01-POP-0005",
    "name": "Poplar wood COM2   #8/4",
    "category": "WOOD",
    "subCategory": "Poplar Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 11227033.0,
    "priceUSD": 449.0813
  },
  {
    "rmCode": "WO01-OAK-0001",
    "name": "US Oak wood  #4/4 Com 1",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.4,
    "priceVND": 28817880.0,
    "priceUSD": 1152.7152
  },
  {
    "rmCode": "WO01-OAK-0003",
    "name": "US Oak wood  #5/4 Com 1",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.4,
    "priceVND": 34082685.0,
    "priceUSD": 1363.3074
  },
  {
    "rmCode": "WO01-OAK-0004",
    "name": "US Oak wood  #6/4 Com 1",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.4,
    "priceVND": 37602390.0,
    "priceUSD": 1504.0956
  },
  {
    "rmCode": "WO01-OAK-0002",
    "name": "US Oak wood  #8/4 Com 1",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.4,
    "priceVND": 44419200.0,
    "priceUSD": 1776.768
  },
  {
    "rmCode": null,
    "name": "US Oak wood  #4/4 Com 2",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 21611835.0,
    "priceUSD": 864.4734
  },
  {
    "rmCode": "WO01-OAK-0087",
    "name": "US Oak wood  #5/4 Com 2",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 21611835.0,
    "priceUSD": 864.4734
  },
  {
    "rmCode": null,
    "name": "US Oak wood  #6/4 Com 2",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 24853610.0,
    "priceUSD": 994.1444
  },
  {
    "rmCode": null,
    "name": "US Oak wood  #8/4 Com 2",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 28581652.0,
    "priceUSD": 1143.2661
  },
  {
    "rmCode": "WO01-OAK-0024",
    "name": "EU Oak Wood  # 26mm ABC unedged (chưa rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 17197677.0,
    "priceUSD": 687.9071
  },
  {
    "rmCode": "WO01-OAK-0014",
    "name": "EU Oak Wood  # 32mm ABC unedged (chưa rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 20091204.0,
    "priceUSD": 803.6482
  },
  {
    "rmCode": "WO01-OAK-0027",
    "name": "EU Oak Wood  # 38mm ABC unedged (chưa rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 26163569.0,
    "priceUSD": 1046.5428
  },
  {
    "rmCode": "WO01-OAK-0017",
    "name": "EU Oak Wood  # 50mm ABC unedged (chưa rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 28442757.0,
    "priceUSD": 1137.7103
  },
  {
    "rmCode": "WO01-OAK-0079",
    "name": "EU Oak Wood  # 82mm ABC unedged (chưa rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 37423260.0,
    "priceUSD": 1496.9304
  },
  {
    "rmCode": "WO01-OAK-0078",
    "name": "EU Oak Wood  # 85mm ABC unedged (chưa rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 37423260.0,
    "priceUSD": 1496.9304
  },
  {
    "rmCode": "WO01-OAK-0073",
    "name": "EU Oak Wood  # 26mm ABC edged (đã rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 24471720.0,
    "priceUSD": 978.8688
  },
  {
    "rmCode": "WO01-OAK-0076",
    "name": "EU Oak Wood  # 32mm ABC edged (đã rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 24795918.0,
    "priceUSD": 991.8367
  },
  {
    "rmCode": null,
    "name": "EU Oak Wood  # 38mm ABC edged (đã rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 27275510.0,
    "priceUSD": 1091.0204
  },
  {
    "rmCode": "WO01-OAK-0074",
    "name": "EU Oak Wood  # 50mm ABC edged (đã rong bìa)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 27929948.0,
    "priceUSD": 1117.1979
  },
  {
    "rmCode": "WO01-OAK-0034",
    "name": "EU Oak Wood  # 26mm AB chưa rong bìa",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 24497550.0,
    "priceUSD": 979.902
  },
  {
    "rmCode": "WO01-OAK-0070",
    "name": "EU Oak Wood  # 32mm AB chưa rong bìa",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 28040922.0,
    "priceUSD": 1121.6369
  },
  {
    "rmCode": "WO01-OAK-0071",
    "name": "EU Oak Wood  # 38mm AB chưa rong bìa",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 30845014.0,
    "priceUSD": 1233.8006
  },
  {
    "rmCode": null,
    "name": "EU Oak Wood  # 50mm AB chưa rong bìa",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 33442500.0,
    "priceUSD": 1337.7
  },
  {
    "rmCode": "WO01-OAK-0069",
    "name": "EU Oak Wood  # 75mm AB chưa rong bìa",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 34750170.0,
    "priceUSD": 1390.0068
  },
  {
    "rmCode": "WO01-OAK-0080",
    "name": "EU Oak Wood  # 82mm AB chưa rong bìa",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 34750170.0,
    "priceUSD": 1390.0068
  },
  {
    "rmCode": "WO01-OAK-0077",
    "name": "EU Oak Wood  # 85mm AB chưa rong bìa",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 34750170.0,
    "priceUSD": 1390.0068
  },
  {
    "rmCode": "WO01-OAK-0068",
    "name": "EU OAK65x185mm up x2000mm up (BC grade)",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 22464540.0,
    "priceUSD": 898.5816
  },
  {
    "rmCode": null,
    "name": "EU OAK Crack/140mm BC Grade ( Aspen )",
    "category": "WOOD",
    "subCategory": "Oak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 25376400.0,
    "priceUSD": 1015.056
  },
  {
    "rmCode": "WO01-ACA-0002",
    "name": "Acacia wood 25mm A grade",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 7875000.0,
    "priceUSD": 315.0
  },
  {
    "rmCode": "WO01-ACA-0005",
    "name": "Acacia wood 30mm A grade",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 8190000.0,
    "priceUSD": 327.6
  },
  {
    "rmCode": "WO01-ACA-0003",
    "name": "Acacia wood 45mm A grade",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 8400000.0,
    "priceUSD": 336.0
  },
  {
    "rmCode": "WO01-ACA-0004",
    "name": "Acacia wood 50mm A grade",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 8925000.0,
    "priceUSD": 357.0
  },
  {
    "rmCode": null,
    "name": "Gỗ Acacia  ghép 12mm - Finger joint panel",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m3",
    "waste": 0.15,
    "priceVND": 17135417.0,
    "priceUSD": 685.4167
  },
  {
    "rmCode": null,
    "name": "Gỗ Acacia  ghép 15mm - Finger joint panel",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m3",
    "waste": 0.15,
    "priceVND": 12483868.0,
    "priceUSD": 499.3547
  },
  {
    "rmCode": null,
    "name": "Gỗ Acacia  ghép 18mm - Finger joint panel",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m3",
    "waste": 0.15,
    "priceVND": 10836227.0,
    "priceUSD": 433.4491
  },
  {
    "rmCode": null,
    "name": "Gỗ Acacia  ghép 25mm - Finger joint panel",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m3",
    "waste": 0.15,
    "priceVND": 11439313.0,
    "priceUSD": 457.5725
  },
  {
    "rmCode": "WO09-0011",
    "name": "Gỗ Acacia  ghép 12x1220x2400 mặt CC - Finger joint panel",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 205771.0,
    "priceUSD": 8.2308
  },
  {
    "rmCode": "WO09-0043",
    "name": "Gỗ Acacia  ghép 15x1220x2400 mặt CC - Finger joint panel",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 187258.0,
    "priceUSD": 7.4903
  },
  {
    "rmCode": "WO09-0001",
    "name": "Gỗ Acacia  ghép 18x1220x2400 mặt CC - Finger joint panel",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 195382.0,
    "priceUSD": 7.8153
  },
  {
    "rmCode": "WO09-0010",
    "name": "Gỗ Acacia  ghép 25x1220x2400 mặt CC - Finger joint panel",
    "category": "WOOD",
    "subCategory": "Acacia Wood",
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 284889.0,
    "priceUSD": 11.3956
  },
  {
    "rmCode": "WO01-TEA-0063",
    "name": "Teak Wood    # 26mm",
    "category": "WOOD",
    "subCategory": "Teak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 39900000.0,
    "priceUSD": 1596.0
  },
  {
    "rmCode": "WO01-TEA-0058",
    "name": "Teak Wood    # 32mm FAS",
    "category": "WOOD",
    "subCategory": "Teak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 50400000.0,
    "priceUSD": 2016.0
  },
  {
    "rmCode": "WO01-TEA-0076",
    "name": "Teak Wood    # 38mm FAS",
    "category": "WOOD",
    "subCategory": "Teak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 51450000.0,
    "priceUSD": 2058.0
  },
  {
    "rmCode": "WO01-TEA-0094",
    "name": "Teak Wood    # 50mm FAS",
    "category": "WOOD",
    "subCategory": "Teak Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 52500000.0,
    "priceUSD": 2100.0
  },
  {
    "rmCode": "WO01-PIN-0001",
    "name": "Gỗ thông - Pine wood  25mm",
    "category": "WOOD",
    "subCategory": "Pine Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 11550000.0,
    "priceUSD": 462.0
  },
  {
    "rmCode": "WO01-PIN-0005",
    "name": "Gỗ thông - Pine wood  32mm",
    "category": "WOOD",
    "subCategory": "Pine Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 12070485.0,
    "priceUSD": 482.8194
  },
  {
    "rmCode": "WO01-PIN-0004",
    "name": "Gỗ thông - Pine wood  38mm",
    "category": "WOOD",
    "subCategory": "Pine Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 12685680.0,
    "priceUSD": 507.4272
  },
  {
    "rmCode": "WO01-PIN-0002",
    "name": "Gỗ thông - Pine wood  50mm",
    "category": "WOOD",
    "subCategory": "Pine Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 12875184.0,
    "priceUSD": 515.0074
  },
  {
    "rmCode": "WO01-PIN-0012",
    "name": "Gỗ Thông Phần Lan 38mm SF Grade - Findland Pine Wood 38mm SF Grade",
    "category": "WOOD",
    "subCategory": "Pine Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 9000000.0,
    "priceUSD": 360.0
  },
  {
    "rmCode": "WO01-WNU-0004",
    "name": "Walnut Wood  COM1  # 4/4",
    "category": "WOOD",
    "subCategory": "Walnut Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 44133600.0,
    "priceUSD": 1765.344
  },
  {
    "rmCode": "WO01-WNU-0005",
    "name": "Walnut Wood  COM1  # 5/4",
    "category": "WOOD",
    "subCategory": "Walnut Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 47443200.0,
    "priceUSD": 1897.728
  },
  {
    "rmCode": "WO01-WNU-0007",
    "name": "Walnut Wood  COM1  # 6/4",
    "category": "WOOD",
    "subCategory": "Walnut Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 52959900.0,
    "priceUSD": 2118.396
  },
  {
    "rmCode": "WO01-WNU-0002",
    "name": "Walnut Wood  COM1  # 8/4",
    "category": "WOOD",
    "subCategory": "Walnut Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 55718250.0,
    "priceUSD": 2228.73
  },
  {
    "rmCode": "WO01-WNU-0003",
    "name": "Walnut Wood  COM2  # 4/4",
    "category": "WOOD",
    "subCategory": "Walnut Wood",
    "unit": "m3",
    "waste": 0.55,
    "priceVND": 40755750.0,
    "priceUSD": 1630.23
  },
  {
    "rmCode": "WO01-WNU-0018",
    "name": "Walnut Wood  COM2  # 5/4",
    "category": "WOOD",
    "subCategory": "Walnut Wood",
    "unit": "m3",
    "waste": 0.55,
    "priceVND": 43465800.0,
    "priceUSD": 1738.632
  },
  {
    "rmCode": "WO01-WNU-0014",
    "name": "Walnut Wood  COM2  # 6/4",
    "category": "WOOD",
    "subCategory": "Walnut Wood",
    "unit": "m3",
    "waste": 0.55,
    "priceVND": 45848250.0,
    "priceUSD": 1833.93
  },
  {
    "rmCode": "WO01-WNU-0015",
    "name": "Walnut Wood  COM2  # 8/4",
    "category": "WOOD",
    "subCategory": "Walnut Wood",
    "unit": "m3",
    "waste": 0.55,
    "priceVND": 48926850.0,
    "priceUSD": 1957.074
  },
  {
    "rmCode": "WO01-MPL-0002",
    "name": "Maple wood 4/4 (26mm) com#1",
    "category": "WOOD",
    "subCategory": "Mapler Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 22918140.0,
    "priceUSD": 916.7256
  },
  {
    "rmCode": "WO01-MPL-0001",
    "name": "Maple wood 5/4 (32mm) com#1 – US Maple wood",
    "category": "WOOD",
    "subCategory": "Mapler Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 21326970.0,
    "priceUSD": 853.0788
  },
  {
    "rmCode": "WO01-MPL-0003",
    "name": "Maple wood 6/4 (38mm) com#1",
    "category": "WOOD",
    "subCategory": "Mapler Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 25226775.0,
    "priceUSD": 1009.071
  },
  {
    "rmCode": "WO01-MPL-0004",
    "name": "Maple wood 8/4 (52mm) com#1",
    "category": "WOOD",
    "subCategory": "Mapler Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 26671575.0,
    "priceUSD": 1066.863
  },
  {
    "rmCode": "WO01-LIM-0011",
    "name": "Gỗ Lime xẻ sấy rong bìa 26mm (AB)",
    "category": "WOOD",
    "subCategory": "Lime Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 10602522.0,
    "priceUSD": 424.1009
  },
  {
    "rmCode": "WO01-LIM-0012",
    "name": "Gỗ Lime xẻ sấy rong bìa 32mm (AB)",
    "category": "WOOD",
    "subCategory": "Lime Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 11026623.0,
    "priceUSD": 441.0649
  },
  {
    "rmCode": "WO01-LIM-0013",
    "name": "Gỗ Lime xẻ sấy rong bìa 38mm (AB)",
    "category": "WOOD",
    "subCategory": "Lime Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 11044294.0,
    "priceUSD": 441.7717
  },
  {
    "rmCode": "WO01-LIM-0014",
    "name": "Gỗ Lime xẻ sấy rong bìa 50mm (AB)",
    "category": "WOOD",
    "subCategory": "Lime Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 11322675.0,
    "priceUSD": 452.907
  },
  {
    "rmCode": "WO01-REG-0002",
    "name": "Red Grandis 25.4mm  FAS rong bìa  – gỗ hồng đàn",
    "category": "WOOD",
    "subCategory": "Red Grandis Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16887360.0,
    "priceUSD": 675.4944
  },
  {
    "rmCode": "WO01-REG-0004",
    "name": "Red Grandis 38mm FAS rong bìa  – gỗ hồng đàn",
    "category": "WOOD",
    "subCategory": "Red Grandis Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 23257080.0,
    "priceUSD": 930.2832
  },
  {
    "rmCode": "WO01-REG-0005",
    "name": "Red Grandis 50.8mm Com#1 rong bìa  – gỗ hồng đàn",
    "category": "WOOD",
    "subCategory": "Red Grandis Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 21803250.0,
    "priceUSD": 872.13
  },
  {
    "rmCode": "WO01-CHE-0002",
    "name": "Cherry wood ABC",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16086724.0,
    "priceUSD": 643.469
  },
  {
    "rmCode": null,
    "name": "Cherry wood 38mm AB",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 14439621.0,
    "priceUSD": 577.5848
  },
  {
    "rmCode": null,
    "name": "Cherry wood 50mm AB",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 14586521.0,
    "priceUSD": 583.4609
  },
  {
    "rmCode": "WO01-CHE-0006",
    "name": "Gỗ Unedged Cherry K.D 26mm Com1 - All FSC 100% ( SGSHK-COC-370375 )",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 11550000.0,
    "priceUSD": 462.0
  },
  {
    "rmCode": "WO01-CHE-0005",
    "name": "Gỗ Unedged Cherry K.D 32mm Com1 - All FSC 100% ( SGSHK-COC-370375 )",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 12075000.0,
    "priceUSD": 483.0
  },
  {
    "rmCode": "WO01-CHE-0003",
    "name": "Gỗ Unedged Cherry K.D 38mm Com1 - All FSC 100% ( SGSHK-COC-370375 )",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 12232500.0,
    "priceUSD": 489.3
  },
  {
    "rmCode": "WO01-CHE-0004",
    "name": "Gỗ Unedged Cherry K.D 50mm Com1 - All FSC 100% ( SGSHK-COC-370375 )",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 12390000.0,
    "priceUSD": 495.6
  },
  {
    "rmCode": "WO01-CHE-0007",
    "name": "Gỗ Unedged Cherry K.D 38mm ABC+ - All FSC 100% ( SGSHK-COC-370375 )",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 11737425.0,
    "priceUSD": 469.497
  },
  {
    "rmCode": "WO01-CHE-0008",
    "name": "Gỗ Unedged Cherry K.D 50mm ABC+ - All FSC 100% ( SGSHK-COC-370375 )",
    "category": "WOOD",
    "subCategory": "Cherry Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 11886000.0,
    "priceUSD": 475.44
  },
  {
    "rmCode": "WO01-PIN-0010",
    "name": "Pine Thermo - D RW 50mm, Finland - Gỗ Thông biến tính 50mm",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 29744387.0,
    "priceUSD": 1189.7755
  },
  {
    "rmCode": "Chua mua",
    "name": "Ash Thermo Edged 26 mm AB Grade - Gỗ Ash Biến Tính rong bìa",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "pcs",
    "waste": 0.5,
    "priceVND": 29400000.0,
    "priceUSD": 1176.0
  },
  {
    "rmCode": "Chua mua",
    "name": "Ash Thermo Edged 32 mm AB Grade - Gỗ Ash Biến Tính rong bìa",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 33075000.0,
    "priceUSD": 1323.0
  },
  {
    "rmCode": "WO01-ASH-0024",
    "name": "Ash Thermo Edged 35mm A Grade - Gỗ Ash Biến Tính 35mm Rong bìa",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 33075000.0,
    "priceUSD": 1323.0
  },
  {
    "rmCode": "WO01-ASH-0023",
    "name": "Ash Thermo Edged 50mm AB Grade - Gỗ Ash Biến Tính 50mm Rong bìa",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 36750000.0,
    "priceUSD": 1470.0
  },
  {
    "rmCode": null,
    "name": "Ash Plato 50-55mm - Gỗ tần bì biến tính",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 38430000.0,
    "priceUSD": 1537.2
  },
  {
    "rmCode": "WO01-ALD-0001",
    "name": "Alder ABC 26mm",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 14717850.0,
    "priceUSD": 588.714
  },
  {
    "rmCode": "WO01-ALD-0002",
    "name": "Alder ABC 35mm",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 14992950.0,
    "priceUSD": 599.718
  },
  {
    "rmCode": "WO01-ALD-0003",
    "name": "Alder ABC 50mm",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16643550.0,
    "priceUSD": 665.742
  },
  {
    "rmCode": "WO01-ALD-0004",
    "name": "Alder ABC 80-100mm",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 17193750.0,
    "priceUSD": 687.75
  },
  {
    "rmCode": "WO01-ALD-0005",
    "name": "Alder AB 50-54mm",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 17193750.0,
    "priceUSD": 687.75
  },
  {
    "rmCode": "WO01-CED-0002",
    "name": "Red Cedar wood   8/4",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16800000.0,
    "priceUSD": 672.0
  },
  {
    "rmCode": "WO01-CED-0001",
    "name": "Yellow Cedar wood   8/4",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 16800000.0,
    "priceUSD": 672.0
  },
  {
    "rmCode": "WO01-COT-0002",
    "name": "Gỗ Cotton 50 com#2 – Cotton wood",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.5,
    "priceVND": 7875000.0,
    "priceUSD": 315.0
  },
  {
    "rmCode": "WO01-KER-0004",
    "name": "Gỗ dầu - Keruing wood",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 11824050.0,
    "priceUSD": 472.962
  },
  {
    "rmCode": null,
    "name": "Eucalyptus wood POLE",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 11916450.0,
    "priceUSD": 476.658
  },
  {
    "rmCode": "WO01-GUA-0001",
    "name": "Gỗ Guanacaste 25mm (ABC)",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 17136000.0,
    "priceUSD": 685.44
  },
  {
    "rmCode": "WO01-KIA-0001",
    "name": "Gỗ Kiaat dày 50mm ( Loại AIC )",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 18900000.0,
    "priceUSD": 756.0
  },
  {
    "rmCode": null,
    "name": "Gỗ muồng 38/32mm - Senna wood",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 20563200.0,
    "priceUSD": 822.528
  },
  {
    "rmCode": "WO01-OKM-0001",
    "name": "Gỗ Okume 50mm",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 21000000.0,
    "priceUSD": 840.0
  },
  {
    "rmCode": null,
    "name": "Santa Maria  (FAS AD)",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 22848000.0,
    "priceUSD": 913.92
  },
  {
    "rmCode": null,
    "name": "US Pine Wood 38mm 6/4",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 11823742.0,
    "priceUSD": 472.9497
  },
  {
    "rmCode": null,
    "name": "Gỗ ván sàn D3033 - Flooring board",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 12566296.0,
    "priceUSD": 502.6518
  },
  {
    "rmCode": "WO01-HKR-0001",
    "name": "Hickory wood 26mm",
    "category": "WOOD",
    "subCategory": "Thermo Wood",
    "unit": "m3",
    "waste": 0.45,
    "priceVND": 17325000.0,
    "priceUSD": 693.0
  },
  {
    "rmCode": "WO04-0194",
    "name": "Veneer gỗ thằn lằn 0.6mm (Amara Veneer)",
    "category": "VENNER",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 535185.0,
    "priceUSD": 21.4074
  },
  {
    "rmCode": "WO04-0174",
    "name": "Veneer óc chó châu phi bông 0.55mm ( Amazakque crwon cut )",
    "category": "VENNER",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 229372.0,
    "priceUSD": 9.1749
  },
  {
    "rmCode": "WO04-0006",
    "name": "Veneer Ash sọc 0.6",
    "category": "VENNER",
    "subCategory": "Ash veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 55671.0,
    "priceUSD": 2.2268
  },
  {
    "rmCode": "WO04-0033.A",
    "name": "Veneer Ash bông 0.6mm - Ash veneer",
    "category": "VENNER",
    "subCategory": "Ash veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 60375.0,
    "priceUSD": 2.415
  },
  {
    "rmCode": "WO04-0033.B",
    "name": "Veneer Ash bông 0.6mm - Ash veneer",
    "category": "VENNER",
    "subCategory": "Ash veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 53550.0,
    "priceUSD": 2.142
  },
  {
    "rmCode": "WO04-0213",
    "name": "Veneer Ash rough cut bông 0.7mm  -Rough cut Crowned cut ash veneer",
    "category": "VENNER",
    "subCategory": "Ash veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 205128.0,
    "priceUSD": 8.2051
  },
  {
    "rmCode": null,
    "name": "Ash Figured veneer  0.6mm",
    "category": "VENNER",
    "subCategory": "Ash veneer",
    "unit": "m2",
    "waste": 0.45,
    "priceVND": 118650.0,
    "priceUSD": 4.746
  },
  {
    "rmCode": "WO04-0178",
    "name": "Ash veneer sọc 1mm",
    "category": "VENNER",
    "subCategory": "Ash veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 136500.0,
    "priceUSD": 5.46
  },
  {
    "rmCode": "WO04-0214",
    "name": "Ash veneer bông 1mm",
    "category": "VENNER",
    "subCategory": "Ash veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 154350.0,
    "priceUSD": 6.174
  },
  {
    "rmCode": "WO04-0246",
    "name": "Veneer Ash bông 2mm - Crown Ash 2mm Veneer",
    "category": "VENNER",
    "subCategory": "Ash veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 325500.0,
    "priceUSD": 13.02
  },
  {
    "rmCode": null,
    "name": "Veneer Walnut Burl 0.6mm (Grade A)",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 720300.0,
    "priceUSD": 28.812
  },
  {
    "rmCode": null,
    "name": "Veneer Walnut Burl 0.6mm Botra",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 656875.0,
    "priceUSD": 26.275
  },
  {
    "rmCode": "WO04-0078",
    "name": "Veneer Walnut Burl 0.6mm",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 758000.0,
    "priceUSD": 30.32
  },
  {
    "rmCode": "WO04-0164",
    "name": "Veneer Oak Burl Cluster 0.55mm ( Grade A )",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 649688.0,
    "priceUSD": 25.9875
  },
  {
    "rmCode": "WO04-0165",
    "name": "Veneer Oak Burl 0.55mm",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 601062.0,
    "priceUSD": 24.0425
  },
  {
    "rmCode": "WO04-0108",
    "name": "Veneer Oak Burl",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 578050.0,
    "priceUSD": 23.122
  },
  {
    "rmCode": "WO04-0055",
    "name": "Veneer Ash burl 0.6mm",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 184852.0,
    "priceUSD": 7.3941
  },
  {
    "rmCode": "WO04-0196",
    "name": "Veneer Olive Ash burl 0.6mm Botra",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 656875.0,
    "priceUSD": 26.275
  },
  {
    "rmCode": "WO04-0212",
    "name": "Veneer Olive Ash burl 0.6mm Grade B",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 525500.0,
    "priceUSD": 21.02
  },
  {
    "rmCode": null,
    "name": "Veneer Cherry burl",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 131375.0,
    "priceUSD": 5.255
  },
  {
    "rmCode": "WO04-0163",
    "name": "Veneer Mappa burl 0.6mm  A -RH/AS",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 249962.0,
    "priceUSD": 9.9985
  },
  {
    "rmCode": "WO04-0205",
    "name": "Veneer Mappa burl 0.6mm  B - SH",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 194250.0,
    "priceUSD": 7.77
  },
  {
    "rmCode": null,
    "name": "Veneer Mesquite burl 0.6mm",
    "category": "VENNER",
    "subCategory": "Burl veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 525500.0,
    "priceUSD": 21.02
  },
  {
    "rmCode": "WO04-0140",
    "name": "Rift Cut American Oak 0.6mm Veneer (<=1.8m)",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 101745.0,
    "priceUSD": 4.0698
  },
  {
    "rmCode": null,
    "name": "Rift Cut American Oak 0.6mm Veneer (1.8<=2.5m)",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 125842.0,
    "priceUSD": 5.0337
  },
  {
    "rmCode": null,
    "name": "Rift Cut American Oak 0.6mm Veneer (>2.5m)",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 147262.0,
    "priceUSD": 5.8905
  },
  {
    "rmCode": null,
    "name": "Rift Cut American Oak 0.9mm Veneer Botra",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 394125.0,
    "priceUSD": 15.765
  },
  {
    "rmCode": "WO04-0106",
    "name": "Rustic Flaky Oak 3mm Veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 299250.0,
    "priceUSD": 11.97
  },
  {
    "rmCode": null,
    "name": "Rustic Flaky Oak 2mm Veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 262750.0,
    "priceUSD": 10.51
  },
  {
    "rmCode": null,
    "name": "Veneer EU small knots, no crack 1.2mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 118125.0,
    "priceUSD": 4.725
  },
  {
    "rmCode": "WO04-0234",
    "name": "Veneer EU knotty oak 2mm ( Use for FH Items ) - Veneer Sồi Âu mắt ( dùng cho FH )",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 45000.0,
    "priceUSD": 1.8
  },
  {
    "rmCode": "WO04-0233",
    "name": "Veneer EU cracked, knotty oak 1.2mm ( Use for FH Items ) - Veneer Sồi Âu mắt nứt ( dùng cho FH )",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 29000.0,
    "priceUSD": 1.16
  },
  {
    "rmCode": "WO04-0232",
    "name": "Veneer EU cracked, knotty oak 0.6mm ( Use for FH Items ) - Veneer Sồi Âu mắt nứt ( dùng cho FH )",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 18496.0,
    "priceUSD": 0.7398
  },
  {
    "rmCode": "WO04-0233",
    "name": "Veneer EU cracked, knotty oak 1.2mm ( Use for FH Items ) Grade A",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 95000.0,
    "priceUSD": 3.8
  },
  {
    "rmCode": "WO04-0271",
    "name": "EU OAK 1mm flaky for Margot ( RH ) - Sồi châu âu 1mm cườm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 152250.0,
    "priceUSD": 6.09
  },
  {
    "rmCode": "WO04-0270",
    "name": "EU OAK 1mm Knot veneer for Serpentine ( RH ) - Veneer sồi châu âu 1mm cườm, mắt",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 78750.0,
    "priceUSD": 3.15
  },
  {
    "rmCode": "WO04-0005.A",
    "name": "Veneer US crown OAK 0.6mm - sồi Mỹ 0.6mm (bông)",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 61088.0,
    "priceUSD": 2.4435
  },
  {
    "rmCode": "WO04-0043",
    "name": "Veneer US quarter OAK 0.6mm - sồi Mỹ 0.6 (sọc)",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 73500.0,
    "priceUSD": 2.94
  },
  {
    "rmCode": "WO04-0012.A",
    "name": "Veneer OAK 1mm -  sồi Mỹ bông 1mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 171343.0,
    "priceUSD": 6.8537
  },
  {
    "rmCode": "WO04-0091",
    "name": "Veneer Quartered cut US Oak veneer sồi Mỹ sọc 1mm (Không cườm)",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 194250.0,
    "priceUSD": 7.77
  },
  {
    "rmCode": "WO04-0035",
    "name": "Veneer Sồi Mỹ 2mm (bông) - Crown American oak veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 417186.0,
    "priceUSD": 16.6874
  },
  {
    "rmCode": null,
    "name": "Veneer Sồi Mỹ 2mm (bông) nứt, mắt  - crack, knoty Crown American oak veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 166950.0,
    "priceUSD": 6.678
  },
  {
    "rmCode": "WO04-0168",
    "name": "FSC Certificate Veneer Sồi Mỹ 2mm (bông) - Crown American oak veneer -",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 455175.0,
    "priceUSD": 18.207
  },
  {
    "rmCode": "WO04-0037",
    "name": "Veneer sồi Châu Âu 0.6mm (bông) - European crown oak veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 97708.0,
    "priceUSD": 3.9083
  },
  {
    "rmCode": "WO04-0203",
    "name": "Veneer sồi Châu Âu (sọc) - European quarter cut oak veneer 0.6mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 98562.0,
    "priceUSD": 3.9425
  },
  {
    "rmCode": "WO04-0210",
    "name": "EU Quarter  cut OAK 0.6mm veneer (Veneer Sồi Sọc Châu Âu ) for JCD special",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 341465.0,
    "priceUSD": 13.6586
  },
  {
    "rmCode": "WO04-0038",
    "name": "Veneer sồi châu Âu 1mm (bông) - European crown oak veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 189000.0,
    "priceUSD": 7.56
  },
  {
    "rmCode": "WO04-0185",
    "name": "Veneer sồi châu Âu 1mm (sọc) - European quarter oak veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 194250.0,
    "priceUSD": 7.77
  },
  {
    "rmCode": "WO04-0093",
    "name": "Veneer sồi châu Âu 1mm (rustic) - European oak veneer (rustic)",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 119411.0,
    "priceUSD": 4.7764
  },
  {
    "rmCode": "WO04-0052",
    "name": "Veneer sồi Châu Âu 2mm (bông) - Crown European Oak Veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 395561.0,
    "priceUSD": 15.8224
  },
  {
    "rmCode": "WO04-0045",
    "name": "Veneer sồi Châu Âu 2mm (sọc) - Quarter European Oak Veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 427350.0,
    "priceUSD": 17.094
  },
  {
    "rmCode": "3052",
    "name": "US Quarter Sawn Oak vnr 1mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 183925.0,
    "priceUSD": 7.357
  },
  {
    "rmCode": "3095",
    "name": "EU Oak vnr 3mm Grade C",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 193041.0,
    "priceUSD": 7.7216
  },
  {
    "rmCode": "3047",
    "name": "Cracked Oak VN 2mm Grade C",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 59850.0,
    "priceUSD": 2.394
  },
  {
    "rmCode": null,
    "name": "EU Cracked Oak 5mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 362250.0,
    "priceUSD": 14.49
  },
  {
    "rmCode": null,
    "name": "EU Cracked Oak 3mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 294000.0,
    "priceUSD": 11.76
  },
  {
    "rmCode": null,
    "name": "EU Cracked Oak 2mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 187425.0,
    "priceUSD": 7.497
  },
  {
    "rmCode": "WO04-0139",
    "name": "Veneer sồi Mỹ 2mm (sọc) - Quarter oak veneer",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 427350.0,
    "priceUSD": 17.094
  },
  {
    "rmCode": "WO04-0099",
    "name": "US Oak 1.2mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 222600.0,
    "priceUSD": 8.904
  },
  {
    "rmCode": "WO04-0176",
    "name": "Rustic Flaky Oak 2mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 261450.0,
    "priceUSD": 10.458
  },
  {
    "rmCode": "WO04-0177",
    "name": "EU OAK Cracked Knotty 2mm veneer (Veneer Sồi Châu Âu nứt, mắt )",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 117629.0,
    "priceUSD": 4.7052
  },
  {
    "rmCode": null,
    "name": "Veneer Cracked Knotty Oak 3mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 259350.0,
    "priceUSD": 10.374
  },
  {
    "rmCode": null,
    "name": "Veneer Cracked Knotty Oak 3mm grade C ( Lót )",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 201600.0,
    "priceUSD": 8.064
  },
  {
    "rmCode": "WO04-0179",
    "name": "European crown Oak 3mm Veneer  ( Cracked, knotty )",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 329831.0,
    "priceUSD": 13.1933
  },
  {
    "rmCode": "WO04-0179.C",
    "name": "European crown Oak 3mm Veneer  ( Cracked, knotty ) - Grade C",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 93636.0,
    "priceUSD": 3.7454
  },
  {
    "rmCode": "WO04-0199",
    "name": "European crown Oak 4mm Veneer  ( Cracked, knotty ) - Grade C",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 315000.0,
    "priceUSD": 12.6
  },
  {
    "rmCode": "WO04-0199.C",
    "name": "Veneer Cracked Knotty Oak 4mm grade C ( Lót )",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 105000.0,
    "priceUSD": 4.2
  },
  {
    "rmCode": null,
    "name": "Veneer Cracked Knotty Oak 6mm",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 371700.0,
    "priceUSD": 14.868
  },
  {
    "rmCode": null,
    "name": "Veneer Cracked Knotty Oak 6mm grade C ( Lót )",
    "category": "VENNER",
    "subCategory": "Oak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 269850.0,
    "priceUSD": 10.794
  },
  {
    "rmCode": "WO04-00216",
    "name": "Arctic White Birds Eye 0.6mm Maple",
    "category": "VENNER",
    "subCategory": "Maple veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 658000.0,
    "priceUSD": 26.32
  },
  {
    "rmCode": null,
    "name": "Veneer Crown Maple Figured 0.6mm",
    "category": "VENNER",
    "subCategory": "Maple veneer",
    "unit": "m2",
    "waste": 0.45,
    "priceVND": 112982.0,
    "priceUSD": 4.5193
  },
  {
    "rmCode": null,
    "name": "Veneer Maple 0.6mm",
    "category": "VENNER",
    "subCategory": "Maple veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 51499.0,
    "priceUSD": 2.06
  },
  {
    "rmCode": "WO04-0025",
    "name": "Veneer Maple 0.6mm Crown",
    "category": "VENNER",
    "subCategory": "Maple veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 58374.0,
    "priceUSD": 2.3349
  },
  {
    "rmCode": "WO04-0267",
    "name": "Veneer Maple 0.6mm Quarter",
    "category": "VENNER",
    "subCategory": "Maple veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 63000.0,
    "priceUSD": 2.52
  },
  {
    "rmCode": "WO04-0147",
    "name": "Hickory veneer 0.6mm",
    "category": "VENNER",
    "subCategory": "Hickory veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 40320.0,
    "priceUSD": 1.6128
  },
  {
    "rmCode": "WO04-0146",
    "name": "Hickory veneer 2.3mm",
    "category": "VENNER",
    "subCategory": "Hickory veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 131911.0,
    "priceUSD": 5.2764
  },
  {
    "rmCode": "WO04-0126",
    "name": "Teak veneer 0.6mm",
    "category": "VENNER",
    "subCategory": "Teak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 182280.0,
    "priceUSD": 7.2912
  },
  {
    "rmCode": null,
    "name": "Teak veneer 1mm",
    "category": "VENNER",
    "subCategory": "Teak veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 205733.0,
    "priceUSD": 8.2293
  },
  {
    "rmCode": "WO04-0031",
    "name": "Veneer Beech bông 0.6mm - Crown",
    "category": "VENNER",
    "subCategory": "Beech veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 48497.0,
    "priceUSD": 1.9399
  },
  {
    "rmCode": "WO04-0162",
    "name": "Veneer Beech sọc 1.2mm",
    "category": "VENNER",
    "subCategory": "Beech veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 101883.0,
    "priceUSD": 4.0753
  },
  {
    "rmCode": null,
    "name": "Veneer Beech bông 1.2mm",
    "category": "VENNER",
    "subCategory": "Beech veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 94500.0,
    "priceUSD": 3.78
  },
  {
    "rmCode": "WO04-0010.A",
    "name": "Veneer Thông 0.6mm (bông)-Crown pine veneer - Grade A",
    "category": "VENNER",
    "subCategory": "Pine veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 31261.0,
    "priceUSD": 1.2504
  },
  {
    "rmCode": "WO04-0020.A",
    "name": "Veneer Thông 1mm vân bông - Crown pine veneer - Grade A",
    "category": "VENNER",
    "subCategory": "Pine veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 63000.0,
    "priceUSD": 2.52
  },
  {
    "rmCode": "WO04-0018.A",
    "name": "Veneer Thông 2mm bông- Pine Veneer - Grade A",
    "category": "VENNER",
    "subCategory": "Pine veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 110250.0,
    "priceUSD": 4.41
  },
  {
    "rmCode": "WO04-0281",
    "name": "Veneer Thông mắt 2mm - Pine Knot 2mm Veneer",
    "category": "VENNER",
    "subCategory": "Pine veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 135000.0,
    "priceUSD": 5.4
  },
  {
    "rmCode": null,
    "name": "Pine 5mm",
    "category": "VENNER",
    "subCategory": "Pine veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 183750.0,
    "priceUSD": 7.35
  },
  {
    "rmCode": null,
    "name": "Pine 3mm",
    "category": "VENNER",
    "subCategory": "Pine veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 144375.0,
    "priceUSD": 5.775
  },
  {
    "rmCode": "WO04-0001",
    "name": "Veneer Walnut bông 0.6mm-Crowned cut walnut veneer",
    "category": "VENNER",
    "subCategory": "Walnut Veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 165900.0,
    "priceUSD": 6.636
  },
  {
    "rmCode": "WO04-0026",
    "name": "Veneer Walnut sọc 0.6mm -Walnut quarter veneer",
    "category": "VENNER",
    "subCategory": "Walnut Veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 165900.0,
    "priceUSD": 6.636
  },
  {
    "rmCode": "WO04-0004",
    "name": "Veneer Tràm bông 0.6mm - Acacia veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 42000.0,
    "priceUSD": 1.68
  },
  {
    "rmCode": "WO04-0013",
    "name": "Veneer Tràm bông 1mm - Acacia veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 84000.0,
    "priceUSD": 3.36
  },
  {
    "rmCode": "WO04-0011",
    "name": "Veneer Tràm bông 2mm - Acacia Veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 126000.0,
    "priceUSD": 5.04
  },
  {
    "rmCode": null,
    "name": "Ebony Amara Quater 0.6mm Veneer ( Ebony Macasar ) Grade ABC",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 655150.0,
    "priceUSD": 26.206
  },
  {
    "rmCode": null,
    "name": "Ebony Amara Quater 0.6mm Veneer ( Ebony Macasar ) Grade AB",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 913500.0,
    "priceUSD": 36.54
  },
  {
    "rmCode": "WO04-0245",
    "name": "Crown Bocote 0.6mm Veneer  - Cẩm Thị Bông Nam Mỹ 0.6mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 655150.0,
    "priceUSD": 26.206
  },
  {
    "rmCode": "WO04-0050",
    "name": "Crown mahogany veneer 0.6mm (vân bông)",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 41328.0,
    "priceUSD": 1.6531
  },
  {
    "rmCode": "WO04-0123",
    "name": "Rubber veneer  0.6mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 31500.0,
    "priceUSD": 1.26
  },
  {
    "rmCode": "WO04-0100",
    "name": "Poplar veneer  0.6mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 46200.0,
    "priceUSD": 1.848
  },
  {
    "rmCode": "WO04-0029",
    "name": "Veneer Eucalyptus Figured",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.45,
    "priceVND": 91875.0,
    "priceUSD": 3.675
  },
  {
    "rmCode": "WO04-0056",
    "name": "Veneer khaya 0.6mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 118503.0,
    "priceUSD": 4.7401
  },
  {
    "rmCode": null,
    "name": "Veneer Okume 0.4mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 52550.0,
    "priceUSD": 2.102
  },
  {
    "rmCode": "WO04-0008",
    "name": "Veneer Sycamore Figured",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.45,
    "priceVND": 137377.0,
    "priceUSD": 5.4951
  },
  {
    "rmCode": null,
    "name": "Veneer Dyed Sycamore",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 487115.0,
    "priceUSD": 19.4846
  },
  {
    "rmCode": "WO04-0002",
    "name": "Santos veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 409500.0,
    "priceUSD": 16.38
  },
  {
    "rmCode": "WO04-0092",
    "name": "Veneer Tamo Crown/ Quarter 0.6mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 79876.0,
    "priceUSD": 3.195
  },
  {
    "rmCode": "WO04-0242",
    "name": "Veneer gỗ Sấu Xoài Bông 0.6mm ( Crown Paldao )",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 287500.0,
    "priceUSD": 11.5
  },
  {
    "rmCode": "WO04-0198",
    "name": "Veneer gỗ Sấu Xoài Sọc 0.6mm ( Paldao Quarter )",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 539688.0,
    "priceUSD": 21.5875
  },
  {
    "rmCode": "WO04-0003",
    "name": "Veneer Cherry bông 0,6mm- Crown cut Cherry veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 76650.0,
    "priceUSD": 3.066
  },
  {
    "rmCode": null,
    "name": "Venner Brown chestnut burl Botra",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 525500.0,
    "priceUSD": 21.02
  },
  {
    "rmCode": "WO04-0058",
    "name": "Zebra veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 63000.0,
    "priceUSD": 2.52
  },
  {
    "rmCode": null,
    "name": "Tamo Ash vnr",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 919624.0,
    "priceUSD": 36.785
  },
  {
    "rmCode": null,
    "name": "Macasar engineered veneer 0.6mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 74358.0,
    "priceUSD": 2.9743
  },
  {
    "rmCode": "WO04-0009",
    "name": "Birch veneer 0.6mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 38850.0,
    "priceUSD": 1.554
  },
  {
    "rmCode": null,
    "name": "Engineered Veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 74358.0,
    "priceUSD": 2.9743
  },
  {
    "rmCode": null,
    "name": "Yellow Cedar vnr 3mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 222080.0,
    "priceUSD": 8.8832
  },
  {
    "rmCode": null,
    "name": "Quilted Mapple veneer Botra",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 656875.0,
    "priceUSD": 26.275
  },
  {
    "rmCode": null,
    "name": "Pomele Veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 210200.0,
    "priceUSD": 8.408
  },
  {
    "rmCode": null,
    "name": "Dyed Eucalyptus veneer Botra",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 197062.0,
    "priceUSD": 7.8825
  },
  {
    "rmCode": null,
    "name": "Silver Madrona Burl veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.7,
    "priceVND": 803250.0,
    "priceUSD": 32.13
  },
  {
    "rmCode": "WO04-00215",
    "name": "Cherry burl Engineered 0.6mm Veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.4,
    "priceVND": 147000.0,
    "priceUSD": 5.88
  },
  {
    "rmCode": null,
    "name": "Dyed Madrona burl veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.4,
    "priceVND": 771750.0,
    "priceUSD": 30.87
  },
  {
    "rmCode": null,
    "name": "Red cedar 5mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 262500.0,
    "priceUSD": 10.5
  },
  {
    "rmCode": null,
    "name": "Red cedar 3mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 169312.0,
    "priceUSD": 6.7725
  },
  {
    "rmCode": "WO04-0244",
    "name": "Red Cedar Veneer 0.6mm  - Tuyết tùng 0.6mm veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 60900.0,
    "priceUSD": 2.436
  },
  {
    "rmCode": "WO04-0229",
    "name": "Light Fume Aspen 0.6mm veneer",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 268170.0,
    "priceUSD": 10.7268
  },
  {
    "rmCode": "WO04-0228",
    "name": "Veneer Anigre Quarter figured 0.6mm",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.45,
    "priceVND": 233100.0,
    "priceUSD": 9.324
  },
  {
    "rmCode": "WO04-0231",
    "name": "Engineered Veneer 10.06 ALPI California Burl SGSCH-COC-004194 FSC 100% ( 2500x680x0.58 mm )",
    "category": "VENNER",
    "subCategory": "Acacia veneer",
    "unit": "m2",
    "waste": 0.4,
    "priceVND": 783977.0,
    "priceUSD": 31.3591
  },
  {
    "rmCode": "WO04-0102",
    "name": "END GRAIN Acacia Veneer 0.6mm (Ф200) - Tràm Veneer",
    "category": "END GRAIN",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.3,
    "priceVND": 23100.0,
    "priceUSD": 0.924
  },
  {
    "rmCode": "WO04-0101",
    "name": "Oak End Grain Veneer 0.6mm (600 - 650mm)",
    "category": "END GRAIN",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.3,
    "priceVND": 230160.0,
    "priceUSD": 9.2064
  },
  {
    "rmCode": "WO05-0014",
    "name": "Oak End Grain Veneer 0.6mm (500mm up)",
    "category": "END GRAIN",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.3,
    "priceVND": 199500.0,
    "priceUSD": 7.98
  },
  {
    "rmCode": "WO04-0102",
    "name": "END GRAIN Acacia Veneer 0.6mm (Ф200) - Tràm Veneer",
    "category": "Woven",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.3,
    "priceVND": 23100.0,
    "priceUSD": 0.924
  },
  {
    "rmCode": "WO04-0101",
    "name": "Oak End Grain Veneer 0.6mm (600 - 650mm)",
    "category": "Woven",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.3,
    "priceVND": 230160.0,
    "priceUSD": 9.2064
  },
  {
    "rmCode": "WO05-0014",
    "name": "Oak End Grain Veneer 0.6mm (500mm up)",
    "category": "Woven",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.3,
    "priceVND": 199500.0,
    "priceUSD": 7.98
  },
  {
    "rmCode": "WO04-0269",
    "name": "Veneer lót kĩ thuật 0.4x1220x2440mm - Backing Engineered veneer 0.4x1220x2440 mm",
    "category": "VENEER Lót",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 6666.0,
    "priceUSD": 0.2666
  },
  {
    "rmCode": "WO04-0024",
    "name": "Veneer lót 0.6mm - Backing veneer",
    "category": "VENEER Lót",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 14175.0,
    "priceUSD": 0.567
  },
  {
    "rmCode": "WO04-0086",
    "name": "Veneer lót 1mm – Backing veneer",
    "category": "VENEER Lót",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 41265.0,
    "priceUSD": 1.6506
  },
  {
    "rmCode": "WO04-0138",
    "name": "Veneer lót 2mm - Backing veneer Okume",
    "category": "VENEER Lót",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 44415.0,
    "priceUSD": 1.7766
  },
  {
    "rmCode": "WO04-0057",
    "name": "Veneer lót 2mm - Backing veneer",
    "category": "VENEER Lót",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 58330.0,
    "priceUSD": 2.3332
  },
  {
    "rmCode": "WO04-0191",
    "name": "Veneer LÓT  Oak - Oak Backing vnr 0.6mm",
    "category": "VENEER Lót",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 46962.0,
    "priceUSD": 1.8785
  },
  {
    "rmCode": "WO04-0190",
    "name": "Veneer lót Ash 0.6mm",
    "category": "VENEER Lót",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 40012.0,
    "priceUSD": 1.6005
  },
  {
    "rmCode": "WO04-0269",
    "name": "Veneer lót kĩ thuật 0.4x1220x2440mm - Backing Engineered veneer 0.4x1220x2440 mm",
    "category": "VENEER Lót",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 6999.0,
    "priceUSD": 0.28
  },
  {
    "rmCode": "WO09-0038",
    "name": "Tấm Cemboard Hải Dương 1220x2440x06mm (nặng 38kg)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 72450.0,
    "priceUSD": 2.898
  },
  {
    "rmCode": "WO09-0039",
    "name": "Tấm Cemboard Hải Dương 1220x2440x10mm (nặng 53kg)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 113400.0,
    "priceUSD": 4.536
  },
  {
    "rmCode": "WO09-0037",
    "name": "Tấm Cemboard Hải Dương 1220x2440x12mm (nặng 64kg)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 126000.0,
    "priceUSD": 5.04
  },
  {
    "rmCode": "WO09-0040",
    "name": "Tấm Cemboard Hải Dương 1220x2440x14mm (nặng 83kg)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 144010.0,
    "priceUSD": 5.7604
  },
  {
    "rmCode": "WO09-0041",
    "name": "Tấm Cemboard Hải Dương 1220x2440x15mm (nặng 90kg)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 151200.0,
    "priceUSD": 6.048
  },
  {
    "rmCode": "WO09-0042",
    "name": "Tấm Cemboard Hải Dương 1220x2440x16mm (nặng 94kg)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 163800.0,
    "priceUSD": 6.552
  },
  {
    "rmCode": "WO09-0036",
    "name": "Tấm Cemboard Hải Dương 1220x2440x18mm (nặng 101kg)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 170100.0,
    "priceUSD": 6.804
  },
  {
    "rmCode": "WO02-0039",
    "name": "MDF 3",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 22712.0,
    "priceUSD": 0.9085
  },
  {
    "rmCode": "WO02-0040",
    "name": "MDF 6",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 41097.0,
    "priceUSD": 1.6439
  },
  {
    "rmCode": "WO02-0035",
    "name": "MDF 9",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 56238.0,
    "priceUSD": 2.2495
  },
  {
    "rmCode": "WO02-0041",
    "name": "MDF 12",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 72460.0,
    "priceUSD": 2.8984
  },
  {
    "rmCode": "WO02-0042",
    "name": "MDF 15",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 89764.0,
    "priceUSD": 3.5906
  },
  {
    "rmCode": "WO02-0034",
    "name": "MDF 18",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 107068.0,
    "priceUSD": 4.2827
  },
  {
    "rmCode": "WO02-0052",
    "name": "MDF 21",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 138432.0,
    "priceUSD": 5.5373
  },
  {
    "rmCode": "WO02-0043",
    "name": "MDF 25",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 165470.0,
    "priceUSD": 6.6188
  },
  {
    "rmCode": "WO02-0039E",
    "name": "MDF 3 E05 Kiên Giang ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 30570.0,
    "priceUSD": 1.2228
  },
  {
    "rmCode": "WO02-0040E",
    "name": "MDF 6 E05 Kiên Giang ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 50476.0,
    "priceUSD": 2.019
  },
  {
    "rmCode": "WO02-0035E",
    "name": "MDF 9 E05 Kiên Giang ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 74116.0,
    "priceUSD": 2.9646
  },
  {
    "rmCode": "WO02-0041E",
    "name": "MDF 12 E05 Kiên Giang ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 93841.0,
    "priceUSD": 3.7536
  },
  {
    "rmCode": "WO02-0042E",
    "name": "MDF 15 E05 Kiên Giang ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 116903.0,
    "priceUSD": 4.6761
  },
  {
    "rmCode": "WO02-0034E",
    "name": "MDF 18 E05 Kiên Giang ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 137662.0,
    "priceUSD": 5.5065
  },
  {
    "rmCode": "WO02-0052E",
    "name": "MDF 21 E05 Kiên Giang ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 173135.0,
    "priceUSD": 6.9254
  },
  {
    "rmCode": "WO02-0043E",
    "name": "MDF 25 E05 Kiên Giang ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 206113.0,
    "priceUSD": 8.2445
  },
  {
    "rmCode": "WO06-0006",
    "name": "Ván Okal 9mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 50440.0,
    "priceUSD": 2.0176
  },
  {
    "rmCode": null,
    "name": "Ván Okal 12mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 61022.0,
    "priceUSD": 2.4409
  },
  {
    "rmCode": null,
    "name": "Ván Okal 14mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 67724.0,
    "priceUSD": 2.7089
  },
  {
    "rmCode": "WO06-0005",
    "name": "Ván Okal 15mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 70193.0,
    "priceUSD": 2.8077
  },
  {
    "rmCode": null,
    "name": "Ván Okal 16mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 74778.0,
    "priceUSD": 2.9911
  },
  {
    "rmCode": null,
    "name": "Ván Okal 17mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 79716.0,
    "priceUSD": 3.1887
  },
  {
    "rmCode": "WO06-0003",
    "name": "Ván Okal 18mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 84302.0,
    "priceUSD": 3.3721
  },
  {
    "rmCode": null,
    "name": "Ván Okal 21mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 101586.0,
    "priceUSD": 4.0634
  },
  {
    "rmCode": "WO06-0002",
    "name": "Ván Okal 25mm",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 124160.0,
    "priceUSD": 4.9664
  },
  {
    "rmCode": "WO02-0093",
    "name": "MDF chống ẩm Kiên Giang 3x1220x2440 - TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 36771.0,
    "priceUSD": 1.4708
  },
  {
    "rmCode": "WO02-0087",
    "name": "MDF chống ẩm Kiên Giang 6x1220x2440 - TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 58401.0,
    "priceUSD": 2.336
  },
  {
    "rmCode": "WO02-0088",
    "name": "MDF chống ẩm Kiên Giang 9x1220x2440 - TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 84357.0,
    "priceUSD": 3.3743
  },
  {
    "rmCode": "WO02-0089",
    "name": "MDF chống ẩm Kiên Giang 12x1220x2440 - TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 112476.0,
    "priceUSD": 4.499
  },
  {
    "rmCode": "WO02-0090",
    "name": "MDF chống ẩm Kiên Giang 15x1220x2440 - TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 136269.0,
    "priceUSD": 5.4508
  },
  {
    "rmCode": "WO02-0119",
    "name": "MDF chống ẩm Kiên Giang 17x1220x2440 – TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 148166.0,
    "priceUSD": 5.9266
  },
  {
    "rmCode": "WO02-0084",
    "name": "MDF chống ẩm Kiên Giang 18x1220x2440 - TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 157899.0,
    "priceUSD": 6.316
  },
  {
    "rmCode": "WO02-0130",
    "name": "MDF chống ẩm Kiên Giang 21x1220x2440 - TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 205485.0,
    "priceUSD": 8.2194
  },
  {
    "rmCode": "WO02-0091",
    "name": "MDF chống ẩm Kiên Giang 25x1220x2440 - TSCA (Carb P2)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 237930.0,
    "priceUSD": 9.5172
  },
  {
    "rmCode": "WO02-0093E",
    "name": "MDF chống ẩm Kiên Giang 3x1220x2440 - E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 36952.0,
    "priceUSD": 1.4781
  },
  {
    "rmCode": "WO02-0087E",
    "name": "MDF chống ẩm Kiên Giang 6x1220x2440 - E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 61493.0,
    "priceUSD": 2.4597
  },
  {
    "rmCode": "WO02-0088E",
    "name": "MDF chống ẩm Kiên Giang 9x1220x2440 - E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 88228.0,
    "priceUSD": 3.5291
  },
  {
    "rmCode": "WO02-0089E",
    "name": "MDF chống ẩm Kiên Giang 12x1220x2440 - E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 115313.0,
    "priceUSD": 4.6125
  },
  {
    "rmCode": "WO02-0090E",
    "name": "MDF chống ẩm Kiên Giang 15x1220x2440 - E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 144141.0,
    "priceUSD": 5.7657
  },
  {
    "rmCode": "WO02-0119E",
    "name": "MDF chống ẩm Kiên Giang 17x1220x2440 – E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 156450.0,
    "priceUSD": 6.258
  },
  {
    "rmCode": "WO02-0084E",
    "name": "MDF chống ẩm Kiên Giang 18x1220x2440 - E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 211415.0,
    "priceUSD": 8.4566
  },
  {
    "rmCode": "WO02-0130E",
    "name": "MDF chống ẩm Kiên Giang 21x1220x2440 - E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 251685.0,
    "priceUSD": 10.0674
  },
  {
    "rmCode": "WO02-0091E",
    "name": "MDF chống ẩm Kiên Giang 25x1220x2440 - E05 ( EU Market)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 237930.0,
    "priceUSD": 9.5172
  },
  {
    "rmCode": "WO02-0131",
    "name": "MDF 3x1220x2440mm Phủ Melamine White Smooth ( White 1520 ) - 1 mặt",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 72460.0,
    "priceUSD": 2.8984
  },
  {
    "rmCode": "WO02-0132",
    "name": "MDF 6x1220x2440mm Phủ Melamine White Smooth ( White 1520 ) - 1 mặt",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 91928.0,
    "priceUSD": 3.6771
  },
  {
    "rmCode": null,
    "name": "MDF 9x1245x2465mm MBR EPA Kim Tín Phủ Melamin (1 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 90857.0,
    "priceUSD": 3.6343
  },
  {
    "rmCode": null,
    "name": "MDF 12x1245x2467mm MBR EPA Kim Tín Phủ Melamin (1 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 105766.0,
    "priceUSD": 4.2307
  },
  {
    "rmCode": null,
    "name": "MDF 15x1245x2469mm MBR EPA Kim Tín Phủ Melamin (1 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 119932.0,
    "priceUSD": 4.7973
  },
  {
    "rmCode": "WO02-0135",
    "name": "MDF 18x1220x2440mm Phủ Melamine 1 mặt Code # VT-6054",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 143840.0,
    "priceUSD": 5.7536
  },
  {
    "rmCode": null,
    "name": "MDF 21x1245x2470mm MBR EPA Kim Tín Phủ Melamin (1 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 163952.0,
    "priceUSD": 6.5581
  },
  {
    "rmCode": null,
    "name": "MDF 25x1245x2470mm MBR EPA Kim Tín Phủ Melamin  (1 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 187504.0,
    "priceUSD": 7.5002
  },
  {
    "rmCode": null,
    "name": "MDF 9x1245x2465mm MBR EPA Kim Tín Phủ Melamin (2 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 109232.0,
    "priceUSD": 4.3693
  },
  {
    "rmCode": "WO02-0133",
    "name": "MDF 12x1220x2440mm Phủ Melamine White Smooth ( White 1520 ) - 2 mặt",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 138432.0,
    "priceUSD": 5.5373
  },
  {
    "rmCode": null,
    "name": "MDF 15x1245x2469mm MBR EPA Kim Tín Phủ Melamin (2 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 140595.0,
    "priceUSD": 5.6238
  },
  {
    "rmCode": null,
    "name": "MDF 18x1245x2470mm MBR EPA Kim Tín Phủ Melamin (2 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 156818.0,
    "priceUSD": 6.2727
  },
  {
    "rmCode": null,
    "name": "MDF 21x1245x2470mm MBR EPA Kim Tín Phủ Melamin (2 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 187100.0,
    "priceUSD": 7.484
  },
  {
    "rmCode": null,
    "name": "MDF 25x1245x2470mm MBR EPA Kim Tín Phủ Melamin (2 mặt)",
    "category": "BOARD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 211974.0,
    "priceUSD": 8.479
  },
  {
    "rmCode": "WO03-0052",
    "name": "Okoume Plywood 3 TQ (P2-CARB)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 39900.0,
    "priceUSD": 1.596
  },
  {
    "rmCode": "WO03-0053",
    "name": "Okoume Plywood 6 TQ (P2-CARB)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 71400.0,
    "priceUSD": 2.856
  },
  {
    "rmCode": "WO03-0054",
    "name": "Okoume Plywood 9 TQ (P2-CARB)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 96600.0,
    "priceUSD": 3.864
  },
  {
    "rmCode": "WO03-0055",
    "name": "Okoume Plywood 12 TQ (P2-CARB)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 118650.0,
    "priceUSD": 4.746
  },
  {
    "rmCode": "WO03-0057",
    "name": "Okoume Plywood 15 TQ (P2-CARB)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 150150.0,
    "priceUSD": 6.006
  },
  {
    "rmCode": "WO03-0056",
    "name": "Okoume Plywood 18 TQ (P2-CARB)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 177975.0,
    "priceUSD": 7.119
  },
  {
    "rmCode": "WO03-0090",
    "name": "Curved plywood 2.5mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 67200.0,
    "priceUSD": 2.688
  },
  {
    "rmCode": "WO03-0001",
    "name": "Plywood 3 (Carb P2)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 46666.0,
    "priceUSD": 1.8666
  },
  {
    "rmCode": "WO03-0002",
    "name": "Plywood 6 (Carb P2)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 86100.0,
    "priceUSD": 3.444
  },
  {
    "rmCode": "WO03-0003",
    "name": "Plywood 9 (Carb P2)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 101850.0,
    "priceUSD": 4.074
  },
  {
    "rmCode": "WO03-0004",
    "name": "Plywood 12 (Carb P2)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 126000.0,
    "priceUSD": 5.04
  },
  {
    "rmCode": "WO03-0005",
    "name": "Plywood 15 (Carb P2)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 150150.0,
    "priceUSD": 6.006
  },
  {
    "rmCode": "WO03-0006",
    "name": "Plywood 18 (Carb P2)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 208950.0,
    "priceUSD": 8.358
  },
  {
    "rmCode": "WO03-0012",
    "name": "Plywood 21 (Carb P2)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 244965.0,
    "priceUSD": 9.7986
  },
  {
    "rmCode": "WO03-0008",
    "name": "Plywood 25 (Carb P2)",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 309750.0,
    "priceUSD": 12.39
  },
  {
    "rmCode": "WO03-0088",
    "name": "Plywood 2.5x1220x2440mm- 2 Mặt B/C TSCA certificate",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 45938.0,
    "priceUSD": 1.8375
  },
  {
    "rmCode": "WO03-0034",
    "name": "Plywood 3 B/C",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 49350.0,
    "priceUSD": 1.974
  },
  {
    "rmCode": "WO03-0035",
    "name": "Plywood 6 B/C",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 84525.0,
    "priceUSD": 3.381
  },
  {
    "rmCode": "WO03-0036",
    "name": "Plywood 9 B/C",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 106050.0,
    "priceUSD": 4.242
  },
  {
    "rmCode": "WO03-0037",
    "name": "Plywood 12 B/C",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 133350.0,
    "priceUSD": 5.334
  },
  {
    "rmCode": "WO03-0038",
    "name": "Plywood 15 B/C",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 150150.0,
    "priceUSD": 6.006
  },
  {
    "rmCode": "WO03-0033",
    "name": "Plywood 18 B/C",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 178500.0,
    "priceUSD": 7.14
  },
  {
    "rmCode": "WO03-0040",
    "name": "Plywood 21 B/C",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 226041.0,
    "priceUSD": 9.0416
  },
  {
    "rmCode": "WO03-0041",
    "name": "Plywood 25 B/C",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 267968.0,
    "priceUSD": 10.7187
  },
  {
    "rmCode": "WO03-0027",
    "name": "Marine plywood 3mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 64050.0,
    "priceUSD": 2.562
  },
  {
    "rmCode": "WO03-0019",
    "name": "Marine plywood 6mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 105000.0,
    "priceUSD": 4.2
  },
  {
    "rmCode": "WO03-0021",
    "name": "Marine plywood 9mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 158550.0,
    "priceUSD": 6.342
  },
  {
    "rmCode": "WO03-0023",
    "name": "Marine plywood 12mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 181650.0,
    "priceUSD": 7.266
  },
  {
    "rmCode": "WO03-0024",
    "name": "Marine plywood 15mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 216562.0,
    "priceUSD": 8.6625
  },
  {
    "rmCode": "WO03-0025",
    "name": "Marine plywood 17mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 226041.0,
    "priceUSD": 9.0416
  },
  {
    "rmCode": "WO03-0028",
    "name": "Marine plywood 18mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 249010.0,
    "priceUSD": 9.9604
  },
  {
    "rmCode": "WO03-0050",
    "name": "Marine plywood 21mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 262500.0,
    "priceUSD": 10.5
  },
  {
    "rmCode": "WO03-0016",
    "name": "Marine Plywood 25mm",
    "category": "PLYWOOD",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 333229.0,
    "priceUSD": 13.3292
  },
  {
    "rmCode": null,
    "name": "Aluminum Honeycomb 6mm",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 661685.0,
    "priceUSD": 26.4674
  },
  {
    "rmCode": null,
    "name": "Aluminum Honeycomb 10mm",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 679813.0,
    "priceUSD": 27.1925
  },
  {
    "rmCode": null,
    "name": "Aluminum Honeycomb 15mm",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 707006.0,
    "priceUSD": 28.2802
  },
  {
    "rmCode": null,
    "name": "Aluminum Honeycomb 20mm",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 725134.0,
    "priceUSD": 29.0054
  },
  {
    "rmCode": null,
    "name": "Aluminum Honeycomb 25mm",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 770455.0,
    "priceUSD": 30.8182
  },
  {
    "rmCode": null,
    "name": "Plastic Honeycomb 13mm",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 170185.0,
    "priceUSD": 6.8074
  },
  {
    "rmCode": null,
    "name": "Plastic Honeycomb 15mm",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 184983.0,
    "priceUSD": 7.3993
  },
  {
    "rmCode": null,
    "name": "Plastic Honeycomb 17mm",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.2,
    "priceVND": 221980.0,
    "priceUSD": 8.8792
  },
  {
    "rmCode": "PK03-0575",
    "name": "Giấy tổ ong 10x1200x2400 (175LBS, cell hold 12mm) – Honeycomb paper",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 79800.0,
    "priceUSD": 3.192
  },
  {
    "rmCode": "PK03-0651",
    "name": "Giấy tổ ong 15x1000x1600-Honeycomb paper, hole Þ12",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 54600.0,
    "priceUSD": 2.184
  },
  {
    "rmCode": "PK03-0427",
    "name": "Giấy tổ ong 20x1200x2400 (cell hole Ф12)-Honeycomb paper",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 101850.0,
    "priceUSD": 4.074
  },
  {
    "rmCode": "PK03-1967",
    "name": "Giấy tổ ong 25x1200x2400 (cell hole Ф13 – 175 LBS) - Honeycomb paper",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 105000.0,
    "priceUSD": 4.2
  },
  {
    "rmCode": "PK03-0187",
    "name": "Giấy tổ ong 30x1200x2400 (cell hole Ф15)-Honeycomb paper",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 107100.0,
    "priceUSD": 4.284
  },
  {
    "rmCode": "PK03-1969",
    "name": "Giấy tổ ong 35x1200x2400 (cell hole Ф19 – 150 LBS) - Honeycomb paper",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 99750.0,
    "priceUSD": 3.99
  },
  {
    "rmCode": "PK03-1970",
    "name": "Giấy tổ ong 50x1200x2400 (cell hole Ф13 – 175 LBS) - Honeycomb paper",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.3,
    "priceVND": 157500.0,
    "priceUSD": 6.3
  },
  {
    "rmCode": "PK03-1971",
    "name": "Giấy tổ ong thanh L 25x1200x120x120  (cell hole Ф19 – 175 LBS) - Honeycomb paper",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 14700.0,
    "priceUSD": 0.588
  },
  {
    "rmCode": "PK03-1972",
    "name": "Giấy tổ ong thanh L 50x1200x150x150  (cell hole Ф13 – 175 LBS) - Honeycomb paper",
    "category": "HONEYCOMB",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 19950.0,
    "priceUSD": 0.798
  },
  {
    "rmCode": "9001",
    "name": "Foam indoor",
    "category": "FOAM & FABRIC",
    "subCategory": null,
    "unit": "m3",
    "waste": 0.15,
    "priceVND": 4567500.0,
    "priceUSD": 182.7
  },
  {
    "rmCode": "9002",
    "name": "Foam outdoor",
    "category": "FOAM & FABRIC",
    "subCategory": null,
    "unit": "m3",
    "waste": 0.15,
    "priceVND": 8190000.0,
    "priceUSD": 327.6
  },
  {
    "rmCode": null,
    "name": "Dacron 100gr/Gòn chống cháy FRH 100GRM khổ 60\" - Polyester fire retardent padding",
    "category": "FOAM & FABRIC",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 8400.0,
    "priceUSD": 0.336
  },
  {
    "rmCode": null,
    "name": "Dacron 200gr/Gòn chống cháy FRH 200GRM khổ 60\" - Polyester fire retardent padding",
    "category": "FOAM & FABRIC",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 16800.0,
    "priceUSD": 0.672
  },
  {
    "rmCode": null,
    "name": "Feather  for cushion",
    "category": "FOAM & FABRIC",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 189000.0,
    "priceUSD": 7.56
  },
  {
    "rmCode": null,
    "name": "Down for cushion",
    "category": "FOAM & FABRIC",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 1386000.0,
    "priceUSD": 55.44
  },
  {
    "rmCode": "CS19-0004",
    "name": "Mây đan khổ 0.8m (15m/cuộn) - Rattan",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.15,
    "priceVND": 577500.0,
    "priceUSD": 23.1
  },
  {
    "rmCode": "CS19-0006",
    "name": "Mây đan khổ 0.6m (15m/cuộn) - Rattan",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 476000.0,
    "priceUSD": 19.04
  },
  {
    "rmCode": "CS09-0193",
    "name": "Raffia  khổ 0.95m",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 115500.0,
    "priceUSD": 4.62
  },
  {
    "rmCode": "CS19-0005",
    "name": "Mây tròn Ф6mm - Rattan",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 7350.0,
    "priceUSD": 0.294
  },
  {
    "rmCode": "CS19-0006",
    "name": "ABACA Ф4mm",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m",
    "waste": 0.2,
    "priceVND": 5250.0,
    "priceUSD": 0.21
  },
  {
    "rmCode": "RA03-0001",
    "name": "COW leather",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "sf",
    "waste": 0.7,
    "priceVND": 84000.0,
    "priceUSD": 3.36
  },
  {
    "rmCode": "RA03-0004",
    "name": "Simili  khổ 1.4m",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 105000.0,
    "priceUSD": 4.2
  },
  {
    "rmCode": "RA03-0005",
    "name": "Felt - nỉ  khổ 1.4m",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 105000.0,
    "priceUSD": 4.2
  },
  {
    "rmCode": "RA03-0046",
    "name": "Suede leather - giả da khổ 1.2m",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 162750.0,
    "priceUSD": 6.51
  },
  {
    "rmCode": "RA03-0029",
    "name": "Pakistan goat skin (810x1100) - da dê vellum",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 588000.0,
    "priceUSD": 23.52
  },
  {
    "rmCode": "RA03-0031",
    "name": "Turkish goat skin  W850mmxD1100mm - da dê vellum",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 1396500.0,
    "priceUSD": 55.86
  },
  {
    "rmCode": "RA03-0032",
    "name": "Da bò dày 3.5mm",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "sf",
    "waste": 0.5,
    "priceVND": 161700.0,
    "priceUSD": 6.468
  },
  {
    "rmCode": "RA03-0034",
    "name": "Da bò dày 4mm-cow leather",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "sf",
    "waste": 0.5,
    "priceVND": 167475.0,
    "priceUSD": 6.699
  },
  {
    "rmCode": "RA03-0154",
    "name": "Faux Grey Vellum - Da dê xám trắng giả (khổ 1.4m)",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "m",
    "waste": 0.15,
    "priceVND": 241500.0,
    "priceUSD": 9.66
  },
  {
    "rmCode": "RA04-0003",
    "name": "Silver Leaf ( rec 95x95)",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.2,
    "priceVND": 4725.0,
    "priceUSD": 0.189
  },
  {
    "rmCode": "RA04-0002",
    "name": "Brass Leaf ( rec 95x95)",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.2,
    "priceVND": 840.0,
    "priceUSD": 0.0336
  },
  {
    "rmCode": "RA04-0001",
    "name": "Aluminum Leaf  ( rec 95x95)",
    "category": "RATTAN/ LEATHER",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.2,
    "priceVND": 735.0,
    "priceUSD": 0.0294
  },
  {
    "rmCode": "brass",
    "name": "Brass frame",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 638000.0,
    "priceUSD": 25.52
  },
  {
    "rmCode": "SS",
    "name": "Stainless steel frame",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 420000.0,
    "priceUSD": 16.8
  },
  {
    "rmCode": "Alu",
    "name": "Aluminum frame",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 360000.0,
    "priceUSD": 14.4
  },
  {
    "rmCode": "Steel",
    "name": "Steel frame",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 125000.0,
    "priceUSD": 5.0
  },
  {
    "rmCode": "CW.Steel",
    "name": "Counterweight steel - Sắt chống lật",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 36000.0,
    "priceUSD": 1.44
  },
  {
    "rmCode": "P.C",
    "name": "Powder coat -Sơn tĩnh điện Fe",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 22000.0,
    "priceUSD": 0.88
  },
  {
    "rmCode": "C.brass",
    "name": "Phôi đúc đông",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 300000.0,
    "priceUSD": 12.0
  },
  {
    "rmCode": "S.brass",
    "name": "Brass sheet (kg)",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 333000.0,
    "priceUSD": 13.32
  },
  {
    "rmCode": "S.S",
    "name": "Stainless steel sheet (kg)",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 242000.0,
    "priceUSD": 9.68
  },
  {
    "rmCode": "A.lu",
    "name": "Aluminum sheet (kg)",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 120000.0,
    "priceUSD": 4.8
  },
  {
    "rmCode": "S.teel",
    "name": "Steel sheet (kg)",
    "category": "METAL",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 65000.0,
    "priceUSD": 2.6
  },
  {
    "rmCode": "CH12-0001",
    "name": "Zinc wire 1.6mm, 18kg/spool (code old: MT99-0236)",
    "category": "METAL SPRAY",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 130000.0,
    "priceUSD": 5.2
  },
  {
    "rmCode": "CH12-0002",
    "name": "51334MIG, Brass wire 1.6mm 13E 70/30 (cold: MT99-0240)",
    "category": "METAL SPRAY",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 498000.0,
    "priceUSD": 19.92
  },
  {
    "rmCode": "RDS300",
    "name": "DTC Soft closing 2/3 L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 134550.0,
    "priceUSD": 5.382
  },
  {
    "rmCode": "RDS350",
    "name": "DTC Soft closing 2/3 L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 148350.0,
    "priceUSD": 5.934
  },
  {
    "rmCode": "RDS400",
    "name": "DTC Soft closing 2/3 L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 161000.0,
    "priceUSD": 6.44
  },
  {
    "rmCode": "RDS450",
    "name": "DTC Soft closing 2/3 L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 173650.0,
    "priceUSD": 6.946
  },
  {
    "rmCode": "RDS500",
    "name": "DTC Soft closing 2/3 L500",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 182850.0,
    "priceUSD": 7.314
  },
  {
    "rmCode": "RDP300",
    "name": "DTC Soft closing 2/3, Push to open  L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 134550.0,
    "priceUSD": 5.382
  },
  {
    "rmCode": "RDP350",
    "name": "DTC Soft closing 2/3, Push to open  L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 140300.0,
    "priceUSD": 5.612
  },
  {
    "rmCode": "RDP400",
    "name": "DTC Soft closing 2/3, Push to open  L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 147200.0,
    "priceUSD": 5.888
  },
  {
    "rmCode": "RDP450",
    "name": "DTC Soft closing 2/3, Push to open  L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 155250.0,
    "priceUSD": 6.21
  },
  {
    "rmCode": "RK01",
    "name": "Kingstar Soft closing 3/4 L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 95306.0,
    "priceUSD": 3.8122
  },
  {
    "rmCode": "RK02",
    "name": "Kingstar Soft closing 3/4 L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 99216.0,
    "priceUSD": 3.9686
  },
  {
    "rmCode": "RK03",
    "name": "Kingstar Soft closing 3/4 L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 103126.0,
    "priceUSD": 4.125
  },
  {
    "rmCode": "RK04",
    "name": "Kingstar Soft closing 3/4 L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 106548.0,
    "priceUSD": 4.2619
  },
  {
    "rmCode": "RK05",
    "name": "Kingstar Soft closing 3/4, Full extension  L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 134406.0,
    "priceUSD": 5.3762
  },
  {
    "rmCode": "RK06",
    "name": "Kingstar Soft closing 3/4, Full extension  L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 145159.0,
    "priceUSD": 5.8064
  },
  {
    "rmCode": "RK07",
    "name": "Kingstar Soft closing 3/4, Full extension  L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 149069.0,
    "priceUSD": 5.9627
  },
  {
    "rmCode": "RK08",
    "name": "Kingstar single extension 3/4 Push to open  L250",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 90859.0,
    "priceUSD": 3.6343
  },
  {
    "rmCode": "RK09",
    "name": "Kingstar single extension 3/4 Push to open  L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 94524.0,
    "priceUSD": 3.781
  },
  {
    "rmCode": "RK10",
    "name": "Kingstar single extension 3/4 Push to open  L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 101807.0,
    "priceUSD": 4.0723
  },
  {
    "rmCode": "RK11",
    "name": "Kingstar single extension 3/4 Push to open  L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 105472.0,
    "priceUSD": 4.2189
  },
  {
    "rmCode": "RK12",
    "name": "Kingstar single extension 3/4 Push to open  L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 109138.0,
    "priceUSD": 4.3655
  },
  {
    "rmCode": "RK13",
    "name": "Kingstar single extension 3/4 Push to open  L500",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 116420.0,
    "priceUSD": 4.6568
  },
  {
    "rmCode": "RBS300",
    "name": "BLUM Soft closing 3/4 L300 ( Normal)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 218500.0,
    "priceUSD": 8.74
  },
  {
    "rmCode": "RBS350",
    "name": "BLUM Soft closing 3/4 L350 ( Normal)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 218500.0,
    "priceUSD": 8.74
  },
  {
    "rmCode": "RBS400",
    "name": "BLUM Soft closing 3/4 L400 ( Normal)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 221950.0,
    "priceUSD": 8.878
  },
  {
    "rmCode": "RBS450",
    "name": "BLUM Soft closing 3/4 L450 ( Normal)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 224250.0,
    "priceUSD": 8.97
  },
  {
    "rmCode": "RBS300.1",
    "name": "BLUM Soft closing 3/4 L300 ( Special W>=2*D)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 529000.0,
    "priceUSD": 21.16
  },
  {
    "rmCode": "RBS350.1",
    "name": "BLUM Soft closing 3/4 L350 ( Special W>=2*D)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 529000.0,
    "priceUSD": 21.16
  },
  {
    "rmCode": "RBS400.1",
    "name": "BLUM Soft closing 3/4 L400 ( Special W>=2*D)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 532450.0,
    "priceUSD": 21.298
  },
  {
    "rmCode": "RBS450.1",
    "name": "BLUM Soft closing 3/4 L450 ( Special W>=2*D)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 534750.0,
    "priceUSD": 21.39
  },
  {
    "rmCode": "RBP300",
    "name": "BLUM Push to open 3/4  L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 319700.0,
    "priceUSD": 12.788
  },
  {
    "rmCode": "RBP350",
    "name": "BLUM Push to open 3/4  L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 319700.0,
    "priceUSD": 12.788
  },
  {
    "rmCode": "RBP400",
    "name": "BLUM Push to open 3/4  L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 322610.0,
    "priceUSD": 12.9044
  },
  {
    "rmCode": "RBP450",
    "name": "BLUM Push to open 3/4  L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 325404.0,
    "priceUSD": 13.0162
  },
  {
    "rmCode": "RBP300.1",
    "name": "BLUM Push to open 7/8  L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 357075.0,
    "priceUSD": 14.283
  },
  {
    "rmCode": "RBP350.1",
    "name": "BLUM Push to open 7/8  L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 357075.0,
    "priceUSD": 14.283
  },
  {
    "rmCode": "RBP400.1",
    "name": "BLUM Push to open 7/8  L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 359870.0,
    "priceUSD": 14.3948
  },
  {
    "rmCode": "RBP450.1",
    "name": "BLUM Push to open 7/8  L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 362354.0,
    "priceUSD": 14.4941
  },
  {
    "rmCode": null,
    "name": "BLUM 7/8 extension L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 250154.0,
    "priceUSD": 10.0061
  },
  {
    "rmCode": null,
    "name": "BLUM 7/8 extension L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 250154.0,
    "priceUSD": 10.0061
  },
  {
    "rmCode": null,
    "name": "BLUM 7/8 extension L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 252684.0,
    "priceUSD": 10.1073
  },
  {
    "rmCode": null,
    "name": "BLUM 7/8 extension L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 254897.0,
    "priceUSD": 10.1959
  },
  {
    "rmCode": null,
    "name": "BLUM Full extension L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 455084.0,
    "priceUSD": 18.2033
  },
  {
    "rmCode": null,
    "name": "BLUM Full extension L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 455084.0,
    "priceUSD": 18.2033
  },
  {
    "rmCode": null,
    "name": "BLUM Full extension L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 461092.0,
    "priceUSD": 18.4437
  },
  {
    "rmCode": null,
    "name": "BLUM Full extension L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 466785.0,
    "priceUSD": 18.6714
  },
  {
    "rmCode": "RBP300.2",
    "name": "BLUM Push to open Full Extension  L300 (W<=600mm)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 458919.0,
    "priceUSD": 18.3568
  },
  {
    "rmCode": "RBP350.2",
    "name": "BLUM Push to open Full Extension  L350 (W<=600mm)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 458919.0,
    "priceUSD": 18.3568
  },
  {
    "rmCode": "RBP400.2",
    "name": "BLUM Push to open Full Extension  L400 (W<=600mm)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 464508.0,
    "priceUSD": 18.5803
  },
  {
    "rmCode": "RBP450.2",
    "name": "BLUM Push to open Full Extension  L450 (W<=600mm)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 470097.0,
    "priceUSD": 18.8039
  },
  {
    "rmCode": "RBP300.3",
    "name": "BLUM Push to open Full Extension  L300 (W>600mm)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 554863.0,
    "priceUSD": 22.1945
  },
  {
    "rmCode": "RBP350.3",
    "name": "BLUM Push to open Full Extension  L350 (W>600mm)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 554863.0,
    "priceUSD": 22.1945
  },
  {
    "rmCode": "RBP400.3",
    "name": "BLUM Push to open Full Extension  L400 (W>600mm)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 560452.0,
    "priceUSD": 22.4181
  },
  {
    "rmCode": "RBP450.3",
    "name": "BLUM Push to open Full Extension  L450 (W>600mm)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 566041.0,
    "priceUSD": 22.6417
  },
  {
    "rmCode": "RHS250",
    "name": "HETTICH Soft closing 3/4 L250",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 175812.0,
    "priceUSD": 7.0325
  },
  {
    "rmCode": "RHS300",
    "name": "HETTICH Soft closing 3/4 L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 182292.0,
    "priceUSD": 7.2917
  },
  {
    "rmCode": "RHS350",
    "name": "HETTICH Soft closing 3/4 L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 188209.0,
    "priceUSD": 7.5284
  },
  {
    "rmCode": "RHS400",
    "name": "HETTICH Soft closing 3/4 L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 194182.0,
    "priceUSD": 7.7673
  },
  {
    "rmCode": "RHS450",
    "name": "HETTICH Soft closing 3/4 L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 200324.0,
    "priceUSD": 8.013
  },
  {
    "rmCode": "RHS500",
    "name": "HETTICH Soft closing 3/4 L500",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 206523.0,
    "priceUSD": 8.2609
  },
  {
    "rmCode": "RHS550",
    "name": "HETTICH Soft closing 3/4 L550",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 212439.0,
    "priceUSD": 8.4976
  },
  {
    "rmCode": "RHF250",
    "name": "HETTICH Soft closing Full Extension L250",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 352751.0,
    "priceUSD": 14.11
  },
  {
    "rmCode": "RHF300",
    "name": "HETTICH Soft closing Full Extension L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 354160.0,
    "priceUSD": 14.1664
  },
  {
    "rmCode": "RHF350",
    "name": "HETTICH Soft closing Full Extension L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 361204.0,
    "priceUSD": 14.4481
  },
  {
    "rmCode": "RHF400",
    "name": "HETTICH Soft closing Full Extension L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 368529.0,
    "priceUSD": 14.7412
  },
  {
    "rmCode": "RHF450",
    "name": "HETTICH Soft closing Full Extension L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 375573.0,
    "priceUSD": 15.0229
  },
  {
    "rmCode": "RHF500",
    "name": "HETTICH Soft closing Full Extension L500",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 382898.0,
    "priceUSD": 15.3159
  },
  {
    "rmCode": "RHF550",
    "name": "HETTICH Soft closing Full Extension L550",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 395859.0,
    "priceUSD": 15.8343
  },
  {
    "rmCode": "RHP250.1",
    "name": "HETTICH Push to Open 3/4 L250 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 193844.0,
    "priceUSD": 7.7538
  },
  {
    "rmCode": "RHP300.1",
    "name": "HETTICH Push to Open 3/4 L300 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 199761.0,
    "priceUSD": 7.9904
  },
  {
    "rmCode": "RHP350.1",
    "name": "HETTICH Push to Open 3/4 L350 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 205959.0,
    "priceUSD": 8.2384
  },
  {
    "rmCode": "RHP400.1",
    "name": "HETTICH Push to Open 3/4 L400 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 212158.0,
    "priceUSD": 8.4863
  },
  {
    "rmCode": "RHP450.1",
    "name": "HETTICH Push to Open 3/4 L450 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 218356.0,
    "priceUSD": 8.7342
  },
  {
    "rmCode": "RHP500.1",
    "name": "HETTICH Push to Open 3/4 L500 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 224273.0,
    "priceUSD": 8.9709
  },
  {
    "rmCode": "RHP550.1",
    "name": "HETTICH Push to Open 3/4 L550 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 230190.0,
    "priceUSD": 9.2076
  },
  {
    "rmCode": "RHP250.2",
    "name": "HETTICH Push to Open 3/4 L250 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 401776.0,
    "priceUSD": 16.071
  },
  {
    "rmCode": "RHP300.2",
    "name": "HETTICH Push to Open 3/4 L300 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 407692.0,
    "priceUSD": 16.3077
  },
  {
    "rmCode": "RHP350.2",
    "name": "HETTICH Push to Open 3/4 L350 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 413891.0,
    "priceUSD": 16.5556
  },
  {
    "rmCode": "RHP400.2",
    "name": "HETTICH Push to Open 3/4 L400 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 420089.0,
    "priceUSD": 16.8036
  },
  {
    "rmCode": "RHP450.2",
    "name": "HETTICH Push to Open 3/4 L450 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 426288.0,
    "priceUSD": 17.0515
  },
  {
    "rmCode": "RHP500.2",
    "name": "HETTICH Push to Open 3/4 L500 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 432205.0,
    "priceUSD": 17.2882
  },
  {
    "rmCode": "RHP550.2",
    "name": "HETTICH Push to Open 3/4 L550 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 438121.0,
    "priceUSD": 17.5248
  },
  {
    "rmCode": "RHP250.3",
    "name": "HETTICH Push to Open Full Extension L250 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 395859.0,
    "priceUSD": 15.8343
  },
  {
    "rmCode": "RHP300.3",
    "name": "HETTICH Push to Open Full Extension L300 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 396986.0,
    "priceUSD": 15.8794
  },
  {
    "rmCode": "RHP350.3",
    "name": "HETTICH Push to Open Full Extension L350 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 404311.0,
    "priceUSD": 16.1724
  },
  {
    "rmCode": "RHP400.3",
    "name": "HETTICH Push to Open Full Extension L400 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 411637.0,
    "priceUSD": 16.4655
  },
  {
    "rmCode": "RHP450.3",
    "name": "HETTICH Push to Open Full Extension L450 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 418680.0,
    "priceUSD": 16.7472
  },
  {
    "rmCode": "RHP500.3",
    "name": "HETTICH Push to Open Full Extension L500 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 426006.0,
    "priceUSD": 17.0402
  },
  {
    "rmCode": "RHP550.3",
    "name": "HETTICH Push to Open Full Extension L550 W<600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 438966.0,
    "priceUSD": 17.5587
  },
  {
    "rmCode": "RHP250.4",
    "name": "HETTICH Push to Open Full Extension L250 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 603790.0,
    "priceUSD": 24.1516
  },
  {
    "rmCode": "RHP300.4",
    "name": "HETTICH Push to Open Full Extension L300 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 604917.0,
    "priceUSD": 24.1967
  },
  {
    "rmCode": "RHP350.4",
    "name": "HETTICH Push to Open Full Extension L350 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 612243.0,
    "priceUSD": 24.4897
  },
  {
    "rmCode": "RHP400.4",
    "name": "HETTICH Push to Open Full Extension L400 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 619568.0,
    "priceUSD": 24.7827
  },
  {
    "rmCode": "RHP450.4",
    "name": "HETTICH Push to Open Full Extension L450 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 626612.0,
    "priceUSD": 25.0645
  },
  {
    "rmCode": "RHP500.4",
    "name": "HETTICH Push to Open Full Extension L500 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 633938.0,
    "priceUSD": 25.3575
  },
  {
    "rmCode": "RHP550.4",
    "name": "HETTICH Push to Open Full Extension L550 W>=600mm",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 646898.0,
    "priceUSD": 25.8759
  },
  {
    "rmCode": "S-WR300",
    "name": "Wood runner L300",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 43700.0,
    "priceUSD": 1.748
  },
  {
    "rmCode": "S-WR350",
    "name": "Wood runner L350",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 48300.0,
    "priceUSD": 1.932
  },
  {
    "rmCode": "S-WR400",
    "name": "Wood runner L400",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 57500.0,
    "priceUSD": 2.3
  },
  {
    "rmCode": "S-WR450",
    "name": "Wood runner L450",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 69000.0,
    "priceUSD": 2.76
  },
  {
    "rmCode": "S-WR1320",
    "name": "Wood runner L>1000 for table have leafs",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 517500.0,
    "priceUSD": 20.7
  },
  {
    "rmCode": null,
    "name": "Hinge bản lề bật Hafele",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 80730.0,
    "priceUSD": 3.2292
  },
  {
    "rmCode": null,
    "name": "Hinge for Marble door",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 138000.0,
    "priceUSD": 5.52
  },
  {
    "rmCode": null,
    "name": "Brass Piano Hinge",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 408250.0,
    "priceUSD": 16.33
  },
  {
    "rmCode": null,
    "name": "Pivot hinge for thick door",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 230000.0,
    "priceUSD": 9.2
  },
  {
    "rmCode": null,
    "name": "Hinge 180 độ",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 109250.0,
    "priceUSD": 4.37
  },
  {
    "rmCode": null,
    "name": "Blum hinge for thick door 125 độ",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 230000.0,
    "priceUSD": 9.2
  },
  {
    "rmCode": null,
    "name": "Hinge bản lề bật  phi 35 mở 110 độ  DTC",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 31050.0,
    "priceUSD": 1.242
  },
  {
    "rmCode": null,
    "name": "Hinge bản lề bật  phi 35 mở 155 độ  DTC",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 88550.0,
    "priceUSD": 3.542
  },
  {
    "rmCode": null,
    "name": "Lighting system",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 1587000.0,
    "priceUSD": 63.48
  },
  {
    "rmCode": null,
    "name": "Lighting system- cảm ứng",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 4508000.0,
    "priceUSD": 180.32
  },
  {
    "rmCode": null,
    "name": "Brass Sliding door system( slide+wheels)",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "set",
    "waste": 0.0,
    "priceVND": 1454750.0,
    "priceUSD": 58.19
  },
  {
    "rmCode": "HW04-264",
    "name": "Tip-on for door",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 63250.0,
    "priceUSD": 2.53
  },
  {
    "rmCode": null,
    "name": "Tip-on for door",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 178250.0,
    "priceUSD": 7.13
  },
  {
    "rmCode": null,
    "name": "Magnet",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 299000.0,
    "priceUSD": 11.96
  },
  {
    "rmCode": null,
    "name": "SS Shelf pin",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 8050.0,
    "priceUSD": 0.322
  },
  {
    "rmCode": null,
    "name": "SS Shelf pin PVG/PVB",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 14950.0,
    "priceUSD": 0.598
  },
  {
    "rmCode": "HW99-2305",
    "name": "SS leveler",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 33350.0,
    "priceUSD": 1.334
  },
  {
    "rmCode": "HW99-2306",
    "name": "Brass leveler",
    "category": "HARDWARE",
    "subCategory": null,
    "unit": "pc",
    "waste": 0.0,
    "priceVND": 24150.0,
    "priceUSD": 0.966
  },
  {
    "rmCode": "RA09-000x",
    "name": "Resin tấm 1.1mm ( faux shargreen khổ 1.372m)",
    "category": "RESIN",
    "subCategory": null,
    "unit": "m",
    "waste": 0.2,
    "priceVND": 169338.0,
    "priceUSD": 6.7735
  },
  {
    "rmCode": "RA09-0001",
    "name": "Resin tấm 2mm",
    "category": "RESIN",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 281750.0,
    "priceUSD": 11.27
  },
  {
    "rmCode": "RA09-0002",
    "name": "Resin tấm 10mm",
    "category": "RESIN",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 704375.0,
    "priceUSD": 28.175
  },
  {
    "rmCode": "RA09-0003",
    "name": "Resin solid",
    "category": "RESIN",
    "subCategory": null,
    "unit": "m3",
    "waste": 0.35,
    "priceVND": 85100000.0,
    "priceUSD": 3404.0
  },
  {
    "rmCode": "CO13-CH-01",
    "name": "Chemical for exterior A1 ( Vellumn)",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 660000.0,
    "priceUSD": 26.4
  },
  {
    "rmCode": "CO13-CH-02",
    "name": "Chemical for exterior A2",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 450000.0,
    "priceUSD": 18.0
  },
  {
    "rmCode": "CO13-CH-03",
    "name": "Chemical for exterior A3",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 360000.0,
    "priceUSD": 14.4
  },
  {
    "rmCode": "CO13-CH-04",
    "name": "Chemical for exterior A4",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 300000.0,
    "priceUSD": 12.0
  },
  {
    "rmCode": "CO13-CH-05",
    "name": "Chemical for exterior A5",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 255000.0,
    "priceUSD": 10.2
  },
  {
    "rmCode": "CO13-CH-06",
    "name": "Chemical for exterior A6",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 195000.0,
    "priceUSD": 7.8
  },
  {
    "rmCode": "CO13-CH-07",
    "name": "Chemical for exterior A7",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 150000.0,
    "priceUSD": 6.0
  },
  {
    "rmCode": "CO13-CH-08",
    "name": "Chemical for STONE - MORE",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 480000.0,
    "priceUSD": 19.2
  },
  {
    "rmCode": "CO13-CH-09",
    "name": "Chemical for STONE - DTV",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 300000.0,
    "priceUSD": 12.0
  },
  {
    "rmCode": "CO13-CH-10",
    "name": "Chemical for interior B1",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 150000.0,
    "priceUSD": 6.0
  },
  {
    "rmCode": "CO13-CH-11",
    "name": "Chemical for interior B2",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 120000.0,
    "priceUSD": 4.8
  },
  {
    "rmCode": "CO13-CH-12",
    "name": "Chemical for underneath",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 60000.0,
    "priceUSD": 2.4
  },
  {
    "rmCode": "CO13-CH-13",
    "name": "Chemical for Resin",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 450000.0,
    "priceUSD": 18.0
  },
  {
    "rmCode": "CO13-CH-14",
    "name": "Chemical for Ant-mirror",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 360000.0,
    "priceUSD": 14.4
  },
  {
    "rmCode": "CO13-CH-15",
    "name": "Chemical for Lacquer",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 420000.0,
    "priceUSD": 16.8
  },
  {
    "rmCode": "CO13-CH-16",
    "name": "Chemical for FAB/ Metal",
    "category": "CHEMICAL",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.35,
    "priceVND": 360000.0,
    "priceUSD": 14.4
  },
  {
    "rmCode": "MB01",
    "name": "Wowo Quartzite Marble Honed",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 16000000.0,
    "priceUSD": 640.0
  },
  {
    "rmCode": "MB02",
    "name": "Honey Onyx",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 5600000.0,
    "priceUSD": 224.0
  },
  {
    "rmCode": "MB03",
    "name": "Chocolate Onyx",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 5600000.0,
    "priceUSD": 224.0
  },
  {
    "rmCode": "MB04",
    "name": "Ivory onyx",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 6400000.0,
    "priceUSD": 256.0
  },
  {
    "rmCode": "MB05",
    "name": "Honey Onyx",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 7226298.0,
    "priceUSD": 289.0519
  },
  {
    "rmCode": "MB06",
    "name": "Chocolate Onyx",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 7226298.0,
    "priceUSD": 289.0519
  },
  {
    "rmCode": "MB07",
    "name": "Ivory onyx",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 7948927.0,
    "priceUSD": 317.9571
  },
  {
    "rmCode": "MB08",
    "name": "Classico Travertine",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 5000000.0,
    "priceUSD": 200.0
  },
  {
    "rmCode": "MB09",
    "name": "Carrara",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 2800000.0,
    "priceUSD": 112.0
  },
  {
    "rmCode": "MB10",
    "name": "Carrara",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 4500000.0,
    "priceUSD": 180.0
  },
  {
    "rmCode": "MB11",
    "name": "Dark Emperador Marble honed",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 2800000.0,
    "priceUSD": 112.0
  },
  {
    "rmCode": "MB12",
    "name": "Dark Emperador Marble honed",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 2800000.0,
    "priceUSD": 112.0
  },
  {
    "rmCode": "MB13",
    "name": "Light Emperador Marble honed",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 2800000.0,
    "priceUSD": 112.0
  },
  {
    "rmCode": "MB14",
    "name": "Black Nero Maquina",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 2800000.0,
    "priceUSD": 112.0
  },
  {
    "rmCode": "MB15",
    "name": "Red Travertine",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 2800000.0,
    "priceUSD": 112.0
  },
  {
    "rmCode": "MB16",
    "name": "Calacata gold",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 18000000.0,
    "priceUSD": 720.0
  },
  {
    "rmCode": "MB18",
    "name": "ARABESCATO FANIELLO",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 6920000.0,
    "priceUSD": 276.8
  },
  {
    "rmCode": "MB19",
    "name": "White Emperador",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 2600000.0,
    "priceUSD": 104.0
  },
  {
    "rmCode": "MB20",
    "name": "Vietnam White Marble",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 2500000.0,
    "priceUSD": 100.0
  },
  {
    "rmCode": "MB21",
    "name": "White Onyx",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 22000000.0,
    "priceUSD": 880.0
  },
  {
    "rmCode": "MB21",
    "name": "China White Marble",
    "category": "STONE",
    "subCategory": null,
    "unit": "m2",
    "waste": 0.0,
    "priceVND": 5670000.0,
    "priceUSD": 227.0
  },
  {
    "rmCode": "Labor",
    "name": "Labour",
    "category": "STONE",
    "subCategory": null,
    "unit": "hrs",
    "waste": 0.0,
    "priceVND": 105000.0,
    "priceUSD": 4.2
  },
  {
    "rmCode": "No.",
    "name": "Material Name",
    "category": "STONE",
    "subCategory": null,
    "unit": "unit",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 0.0
  },
  {
    "rmCode": null,
    "name": "Chỉ may 210D/3 màu TU651 (B1)",
    "category": "STONE",
    "subCategory": null,
    "unit": "roll",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 45000.0
  },
  {
    "rmCode": null,
    "name": "Lông vũ 80/20 JIS for OA client",
    "category": "STONE",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 1315000.0
  },
  {
    "rmCode": null,
    "name": "Dây sắt bọc giấy 2mm (500m/cuộn)",
    "category": "STONE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 3500.0
  },
  {
    "rmCode": null,
    "name": "Gòn bi BF-03S – Ball Fiber",
    "category": "STONE",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 62400.0
  },
  {
    "rmCode": null,
    "name": "Chỉ nylon 210D/3 (chỉ màu) - Nylon thread",
    "category": "STONE",
    "subCategory": null,
    "unit": "roll",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 45000.0
  },
  {
    "rmCode": null,
    "name": "Dây dù trắng 5mm (loại cứng) - Rope for upholstery",
    "category": "STONE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 7200.0
  },
  {
    "rmCode": null,
    "name": "Dây kéo răng coil #3 (color 086) - Zipper",
    "category": "STONE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 3026.0
  },
  {
    "rmCode": null,
    "name": "Lò xo zig zag 3.8mm, dài 580mm - zig zag spring",
    "category": "STONE",
    "subCategory": null,
    "unit": "pcs",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 7000.0
  },
  {
    "rmCode": null,
    "name": "Chỉ sáp nâu - Wax thread (brown)",
    "category": "STONE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 470.0
  },
  {
    "rmCode": null,
    "name": "Lông vũ DD10 - Feather",
    "category": "STONE",
    "subCategory": null,
    "unit": "kg",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 140000.0
  },
  {
    "rmCode": null,
    "name": "Đinh U 71/10 - Nail for upholstery",
    "category": "STONE",
    "subCategory": null,
    "unit": "box",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 32000.0
  },
  {
    "rmCode": null,
    "name": "Móc kẹp lò xo - Spring holder",
    "category": "STONE",
    "subCategory": null,
    "unit": "pcs",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 1000.0
  },
  {
    "rmCode": null,
    "name": "Đầu kéo #3 (color 501) - Slider",
    "category": "STONE",
    "subCategory": null,
    "unit": "pcs",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 782.0
  },
  {
    "rmCode": null,
    "name": "Dây kéo răng coil #3 (color 501) - Zipper",
    "category": "STONE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 3630.0
  },
  {
    "rmCode": null,
    "name": "Gòn chống cháy FRH 100GRM khổ 60\" (100Yard/roll) - Polyester fire retardent padding",
    "category": "STONE",
    "subCategory": null,
    "unit": "yard",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 10364.0
  },
  {
    "rmCode": null,
    "name": "Dây đai FV350 - Webbing",
    "category": "STONE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 6000.0
  },
  {
    "rmCode": null,
    "name": "PU foam F4050G 80x1600x2000mm",
    "category": "STONE",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 1120400.0
  },
  {
    "rmCode": null,
    "name": "PU foam F3550G 5x1600x2000mm",
    "category": "STONE",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 63158.0
  },
  {
    "rmCode": null,
    "name": "PU foam F6090G 20x1600x1000mm",
    "category": "STONE",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 273520.0
  },
  {
    "rmCode": null,
    "name": "Vải cotton lót gối (khổ 1.6m) - Cotton fabric",
    "category": "STONE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 42000.0
  },
  {
    "rmCode": null,
    "name": "Vải không dệt đen 100g/m2 (khổ 1.6m) - Non-woven fabric",
    "category": "STONE",
    "subCategory": null,
    "unit": "m",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 7700.0
  },
  {
    "rmCode": null,
    "name": "PU foam F6090G 10x1600x1000mm",
    "category": "STONE",
    "subCategory": null,
    "unit": "sheet",
    "waste": 0.0,
    "priceVND": 0.0,
    "priceUSD": 126630.0
  }
];
