/**
 * DANH MỤC CÁC LOẠI SẢN PHẨM NỘI THẤT ĐA DÒNG HÀNG & BỘ TỪ KHÓA ĐỒNG NGHĨA THÔNG MINH
 * Phục vụ tìm kiếm thông minh khi khách hàng mô tả tên sản phẩm không đúng từ khóa kỹ thuật.
 */

export interface ProductArchetypeItem {
  id: string;
  name: string;
  category: "cabinet" | "solid_wood" | "stone_metal" | "upholstery" | "aluminum_glass" | "artistic_resin" | "custom";
  categoryLabel: string;
  badge: string;
  badgeColor: string;
  iconName: string; // Tên icon Lucide
  description: string;
  aliases: string[]; // Mảng từ khóa đồng nghĩa, tên dân gian, tên gọi theo vùng miền
  defaultDimensions: {
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
  defaultFlags: {
    hasStone: boolean;
    stoneType?: string;
    hasGlass: boolean;
    hasMetal: boolean;
    hasUpholstery: boolean;
    hasLed: boolean;
  };
  defaultCoreCode: string;
  defaultSurfaceCode: string;
  typicalLabourHours: number;
  tags: string[];
}

export const ARCHETYPE_CATEGORIES = [
  { id: "all", label: "Tất cả sản phẩm" },
  { id: "cabinet", label: "Tủ Kệ & Ván", icon: "DoorClosed" },
  { id: "solid_wood", label: "Bàn Ghế Gỗ Thịt", icon: "Table" },
  { id: "stone_metal", label: "Mặt Đá & Kim Loại", icon: "Shield" },
  { id: "upholstery", label: "Sofa, Nệm & Da", icon: "Armchair" },
  { id: "aluminum_glass", label: "Cửa & Vách Nhôm Kính", icon: "Maximize" },
  { id: "artistic_resin", label: "Resin & Mỹ Thuật", icon: "Sparkles" },
  { id: "custom", label: "Tùy chỉnh tự do", icon: "Box" },
] as const;

export const PRODUCT_ARCHETYPES_CATALOG: ProductArchetypeItem[] = [
  // =========================================================================
  // 1. TỦ KỆ & GỖ CÔNG NGHIỆP (CABINETRY / CASEGOODS)
  // =========================================================================
  {
    id: "wardrobe_master",
    name: "Tủ Áo Master Kịch Trần",
    category: "cabinet",
    categoryLabel: "Tủ Kệ & Ván",
    badge: "Ván MDF / Plywood",
    badgeColor: "bg-zinc-100 text-zinc-800 border-zinc-200",
    iconName: "DoorClosed",
    description: "Thùng MDF chống ẩm 17mm, cánh Melamine kháng trầy, ray trượt & bản lề giảm chấn",
    aliases: [
      "tu ao", "tủ áo", "tủ quần áo", "tu quan ao", "tủ đồ", "tu do", "tủ áo kịch trần", 
      "tu ao kich tran", "tủ đụng đồ", "tủ âm tường", "tu am tuong", "wardrobe", "closet"
    ],
    defaultDimensions: { widthMm: 2200, depthMm: 600, heightMm: 2600 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Melamine",
    typicalLabourHours: 12.5,
    tags: ["phòng ngủ", "tủ áo", "lưu trữ", "led"],
  },
  {
    id: "wardrobe_glass_door",
    name: "Tủ Áo Cánh Kính Khung Nhôm",
    category: "cabinet",
    categoryLabel: "Tủ Kệ & Ván",
    badge: "Cánh Kính Slim + LED",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Maximize",
    description: "Khung nhôm anode slim màu đen/champagne, kính cường lực xám khói, ray âm và đèn led cảm ứng",
    aliases: [
      "tu ao canh kinh", "tủ áo cánh kính", "tủ kính áo", "tủ quần áo cánh kính", 
      "tủ áo khung nhôm", "tu ao nhom kinh", "tủ áo luxury", "glass wardrobe"
    ],
    defaultDimensions: { widthMm: 2400, depthMm: 600, heightMm: 2600 },
    defaultFlags: { hasStone: false, hasGlass: true, hasMetal: true, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Melamine",
    typicalLabourHours: 16.0,
    tags: ["luxury", "cánh kính", "led", "nhôm slim"],
  },
  {
    id: "kitchen_base",
    name: "Tủ Bếp Dưới (Thùng Chậu & Bếp)",
    category: "cabinet",
    categoryLabel: "Tủ Kệ & Ván",
    badge: "Chống Ẩm / WPB",
    badgeColor: "bg-zinc-100 text-zinc-800 border-zinc-200",
    iconName: "CookingPot",
    description: "Thùng MDF chống ẩm hoặc khoang chậu nhựa WPB, mặt đá bếp chống ngấm 0% OH, ray hộp giảm chấn",
    aliases: [
      "tu bep duoi", "tủ bếp dưới", "kệ bếp dưới", "ke bep duoi", "bếp dưới", "bep duoi", 
      "chạn bát", "chan bat", "tủ chén", "tu chen", "tủ bát đĩa", "tu bat dia", "base kitchen"
    ],
    defaultDimensions: { widthMm: 3000, depthMm: 600, heightMm: 810 },
    defaultFlags: { hasStone: true, stoneType: "Đá Vicostone thạch anh", hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Acrylic",
    typicalLabourHours: 14.0,
    tags: ["bếp", "mặt đá", "chống nước", "ngăn kéo"],
  },
  {
    id: "kitchen_upper",
    name: "Tủ Bếp Trên Treo Tường",
    category: "cabinet",
    categoryLabel: "Tủ Kệ & Ván",
    badge: "Treo Tường Kịch Trần",
    badgeColor: "bg-zinc-100 text-zinc-800 border-zinc-200",
    iconName: "Layers",
    description: "Thùng MDF 17mm nhẹ, cánh phủ Melamine hoặc Acrylic bóng gương, tay nâng Blum",
    aliases: [
      "tu bep tren", "tủ bếp trên", "kệ bếp treo", "ke bep treo", "tủ bếp lửng", 
      "tủ treo bếp", "tu treo bep", "upper cabinet"
    ],
    defaultDimensions: { widthMm: 3000, depthMm: 350, heightMm: 800 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Melamine",
    typicalLabourHours: 9.5,
    tags: ["bếp", "treo tường", "nhẹ"],
  },
  {
    id: "shoe_cabinet",
    name: "Tủ Giày Thông Minh / Tủ Giày Lớn",
    category: "cabinet",
    categoryLabel: "Tủ Kệ & Ván",
    badge: "Phụ Kiện Xoay",
    badgeColor: "bg-zinc-100 text-zinc-800 border-zinc-200",
    iconName: "Archive",
    description: "Tủ để giày dép sảnh vào, kết hợp ngăn để mũ bảo hiểm và ghế ngồi mang giày",
    aliases: [
      "tu giay", "tủ giày", "tu giay thong minh", "tủ giày thông minh", "ke de giay", 
      "kệ để giày", "kệ dép", "ke dep", "tủ để dép", "tủ giầy", "tu giay dep", "shoe rack"
    ],
    defaultDimensions: { widthMm: 1200, depthMm: 350, heightMm: 1200 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Melamine",
    typicalLabourHours: 7.0,
    tags: ["tiền sảnh", "lưu trữ", "thông minh"],
  },
  {
    id: "tv_shelf",
    name: "Kệ Tivi Treo / Kệ Tivi Bệt",
    category: "cabinet",
    categoryLabel: "Tủ Kệ & Ván",
    badge: "Tủ Thấp Phòng Khách",
    badgeColor: "bg-zinc-100 text-zinc-800 border-zinc-200",
    iconName: "Tv",
    description: "Kệ tivi phòng khách có ngăn kéo âm, hộc giấu dây điện và đường luồn ổ cắm",
    aliases: [
      "ke tivi", "kệ tivi", "ke ti vi", "kệ ti vi", "tu tivi", "tủ tivi", 
      "kệ tv", "ke tv", "kệ tivi treo", "ke tivi treo", "kệ để tivi", "tv stand", "tv shelf"
    ],
    defaultDimensions: { widthMm: 2000, depthMm: 350, heightMm: 450 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Melamine",
    typicalLabourHours: 5.5,
    tags: ["phòng khách", "kệ thấp", "ngăn kéo"],
  },
  {
    id: "vanity",
    name: "Tủ Lavabo Nhà Tắm Chống Nước",
    category: "cabinet",
    categoryLabel: "Tủ Kệ & Ván",
    badge: "Nhựa WPB Chống Nước 100%",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Bath",
    description: "Thùng nhựa đặc WPB chống nước 100%, mặt đá chống ố, gương soi led cảm ứng phôi bỉ",
    aliases: [
      "tu lavabo", "tủ lavabo", "tủ chậu rửa mặt", "tu chau rua mat", "bàn lavabo", 
      "ban lavabo", "tủ phòng tắm", "tu phong tam", "kệ lavabo", "vanity"
    ],
    defaultDimensions: { widthMm: 1000, depthMm: 500, heightMm: 500 },
    defaultFlags: { hasStone: true, stoneType: "Đá trắng sứ nhân tạo", hasGlass: true, hasMetal: false, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "WPB_17_CHONG_NUOC",
    defaultSurfaceCode: "Acrylic",
    typicalLabourHours: 6.0,
    tags: ["nhà tắm", "chống nước", "mặt đá", "gương"],
  },
  {
    id: "wine_cabinet",
    name: "Tủ Rượu & Quầy Bar Mini",
    category: "cabinet",
    categoryLabel: "Tủ Kệ & Ván",
    badge: "Cánh Kính & Đèn LED",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "DoorClosed",
    description: "Tủ trưng bày rượu cánh kính, giá treo ly inox, kệ zic-zac chai vang và đèn led hắt sáng",
    aliases: [
      "tu ruou", "tủ rượu", "kệ rượu", "ke ruou", "tủ quầy bar", "tu quay bar", 
      "tủ trưng bày rượu", "tủ rượu cánh kính", "wine cabinet", "bar cabinet"
    ],
    defaultDimensions: { widthMm: 1600, depthMm: 400, heightMm: 2400 },
    defaultFlags: { hasStone: false, hasGlass: true, hasMetal: true, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Melamine",
    typicalLabourHours: 15.0,
    tags: ["phòng ăn", "trưng bày", "rượu", "kính"],
  },

  // =========================================================================
  // 2. BÀN GHẾ & GỖ TỰ NHIÊN (SOLID WOOD & TABLES/CHAIRS)
  // =========================================================================
  {
    id: "solid_oak_dining",
    name: "Bàn Ăn Gỗ Sồi Bắc Mỹ (6-8 Chỗ)",
    category: "solid_wood",
    categoryLabel: "Bàn Ghế Gỗ Thịt",
    badge: "Gỗ Khối White Oak FAS",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-200",
    iconName: "Table",
    description: "Gỗ Sồi trắng tự nhiên sấy chuẩn 10-12%, mộng mòi âm dương truyền thống, sơn PU kháng nước",
    aliases: [
      "ban an", "bàn ăn", "bàn ăn gỗ sồi", "ban an go soi", "bàn ăn 6 ghế", "ban an 6 ghe", 
      "bàn ăn 8 ghế", "bàn gỗ thịt", "ban go thit", "bàn me tây", "bàn cơm", "ban com", "dining table"
    ],
    defaultDimensions: { widthMm: 2000, depthMm: 900, heightMm: 750 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "WO01_OAK_FAS",
    defaultSurfaceCode: "Son_PU",
    typicalLabourHours: 12.5,
    tags: ["phòng ăn", "gỗ khối", "mộng âm dương", "sồi"],
  },
  {
    id: "round_pedestal_table",
    name: "Bàn Tròn Chân Tiện Trụ Gỗ (Garcia Benchmark)",
    category: "solid_wood",
    categoryLabel: "Bàn Ghế Gỗ Thịt",
    badge: "Mẫu QOT-24169 Benchmark",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-200",
    iconName: "Table",
    description: "Bàn tròn chân trụ tiện tròn mộng âm, cốt chống lật cement board, mặt gỗ veneer kết hợp pát đồng",
    aliases: [
      "ban tron", "bàn tròn", "bàn ăn tròn", "ban an tron", "bàn tròn chân trụ", 
      "bàn tròn chân tiện", "garcia table", "breakfast table", "round table"
    ],
    defaultDimensions: { widthMm: 1065, depthMm: 1065, heightMm: 760 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: true, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "WO01_BEE_0003",
    defaultSurfaceCode: "Veneer_Ash",
    typicalLabourHours: 50.2, // 10 công đoạn theo QOT-24169
    tags: ["bàn tròn", "chân tiện", "pát đồng", "antique"],
  },
  {
    id: "executive_desk",
    name: "Bàn Làm Việc / Bàn Giám Đốc",
    category: "solid_wood",
    categoryLabel: "Bàn Ghế Gỗ Thịt",
    badge: "Gỗ Tự Nhiên / Veneer",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-200",
    iconName: "Table",
    description: "Bàn làm việc cao cấp có hộc tủ tài liệu di động, nắp luồn dây điện nhôm phay, hoàn thiện sơn PU mờ",
    aliases: [
      "ban lam viec", "bàn làm việc", "bàn giám đốc", "ban giam doc", "bàn văn phòng", 
      "ban van phong", "bàn học", "ban hoc", "bàn máy tính", "desk", "office desk"
    ],
    defaultDimensions: { widthMm: 1800, depthMm: 800, heightMm: 750 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Veneer_Walnut",
    typicalLabourHours: 11.0,
    tags: ["phòng làm việc", "bàn", "lưu trữ"],
  },
  {
    id: "dressing_table",
    name: "Bàn Trang Điểm / Bàn Console",
    category: "solid_wood",
    categoryLabel: "Bàn Ghế Gỗ Thịt",
    badge: "Gương Soi + Ngăn Kéo",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-200",
    iconName: "Table",
    description: "Bàn trang điểm phòng ngủ kết hợp gương tròn viền led, ngăn kéo đựng mỹ phẩm chia ô",
    aliases: [
      "ban phan", "bàn phấn", "bàn trang điểm", "ban trang diem", "bàn gương", 
      "bàn phấn trang điểm", "bàn console", "ban console", "bàn decor", "vanity desk", "dresser"
    ],
    defaultDimensions: { widthMm: 1100, depthMm: 450, heightMm: 750 },
    defaultFlags: { hasStone: false, hasGlass: true, hasMetal: true, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Son_2K",
    typicalLabourHours: 8.0,
    tags: ["phòng ngủ", "trang điểm", "gương"],
  },

  // =========================================================================
  // 3. MẶT ĐÁ & KIM LOẠI (STONE & METAL)
  // =========================================================================
  {
    id: "onyx_brass_coffee_table",
    name: "Bàn Trà Mặt Đá Onyx Chân Đồng",
    category: "stone_metal",
    categoryLabel: "Mặt Đá & Kim Loại",
    badge: "Đá 0% OH + Đồng PVD",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Shield",
    description: "Mặt đá Onyx tự nhiên xuyên sáng mài vát bo cạnh, chân đồng thau đặc phay xước mạ PVD chống oxy hóa",
    aliases: [
      "ban tra", "bàn trà", "bàn sofa", "ban sofa", "bàn trà mặt đá", "ban tra mat da", 
      "bàn cội", "ban coi", "bàn góc", "ban goc", "bàn trà tròn", "bàn trà đôi", "coffee table"
    ],
    defaultDimensions: { widthMm: 1200, depthMm: 700, heightMm: 450 },
    defaultFlags: { hasStone: true, stoneType: "Đá Onyx tự nhiên xuyên sáng", hasGlass: false, hasMetal: true, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "STONE_ONYX_NATURAL",
    defaultSurfaceCode: "Dong_Thau_PVD",
    typicalLabourHours: 10.5,
    tags: ["phòng khách", "đá 0% OH", "đồng thau", "bàn trà"],
  },
  {
    id: "island_marble_counter",
    name: "Bàn Đảo Bếp Mặt Đá Cẩm Thạch Marble",
    category: "stone_metal",
    categoryLabel: "Mặt Đá & Kim Loại",
    badge: "Đá Nguyên Khối No-OH",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "CookingPot",
    description: "Đảo bếp kết hợp bàn bar, mặt đá Marble ghép mòi thác nước tràn 2 bên, tủ dưới để xoong nồi",
    aliases: [
      "ban dao", "bàn đảo", "bàn đảo bếp", "ban dao bep", "đảo bếp", "dao bep", 
      "bàn bar", "ban bar", "đảo bếp mặt đá", "kitchen island"
    ],
    defaultDimensions: { widthMm: 2200, depthMm: 900, heightMm: 850 },
    defaultFlags: { hasStone: true, stoneType: "Đá Marble cẩm thạch tự nhiên", hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: true },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Melamine",
    typicalLabourHours: 18.0,
    tags: ["bếp", "đảo bếp", "đá marble", "thác nước"],
  },

  // =========================================================================
  // 4. SOFA, BỌC NỆM & GIƯỜNG (UPHOLSTERY & SOFTGOODS)
  // =========================================================================
  {
    id: "leather_lounge_chair",
    name: "Ghế Bành Lounge Thư Giãn Da Bò Ý",
    category: "upholstery",
    categoryLabel: "Sofa, Nệm & Da",
    badge: "Da Thật Full-Grain",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Armchair",
    description: "Khung gỗ sấy kết hợp lò xo túi độc lập, foam D40 đàn hồi cao, da bò nhập khẩu nguyên tấm",
    aliases: [
      "ghe banh", "ghế bành", "ghế thư giãn", "ghe thu gian", "ghế lounge", "ghe lounge", 
      "ghế lười", "ghe luoi", "ghế bọc da", "ghe boc da", "armchair", "lounge chair"
    ],
    defaultDimensions: { widthMm: 900, depthMm: 850, heightMm: 850 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: true, hasLed: false },
    defaultCoreCode: "WO01_ASH_SAY",
    defaultSurfaceCode: "Da_Bo_Y",
    typicalLabourHours: 14.0,
    tags: ["phòng khách", "da bò", "mút d40", "thủ công"],
  },
  {
    id: "sofa_sectional_l",
    name: "Bộ Sofa Góc Chữ L Bọc Nỉ / Da",
    category: "upholstery",
    categoryLabel: "Sofa, Nệm & Da",
    badge: "Khung Gỗ Sấy + Foam D40",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Armchair",
    description: "Khung xương gỗ tự nhiên đã qua xử lý mối mọt, hệ thống đai thun & lò xo, nệm mút D40 êm ái",
    aliases: [
      "sofa l", "sofa chữ l", "sofa chu l", "sofa góc", "sofa goc", "ghế sofa", 
      "ghe sofa", "bộ sa lông", "bo sa long", "bàn ghế sofa", "sectional sofa", "l-shape sofa"
    ],
    defaultDimensions: { widthMm: 2800, depthMm: 1600, heightMm: 850 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: true, hasLed: false },
    defaultCoreCode: "WO01_THONG_SAY",
    defaultSurfaceCode: "Vai_Ni_Cao_Cap",
    typicalLabourHours: 24.0,
    tags: ["phòng khách", "sofa góc", "foam", "vải nỉ"],
  },
  {
    id: "upholstered_bed",
    name: "Giường Ngủ Bọc Nệm Đầu Giường",
    category: "upholstery",
    categoryLabel: "Sofa, Nệm & Da",
    badge: "Bọc Nệm / Da Cao Cấp",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Bed",
    description: "Tựa đầu giường bọc mút tạo múi quả trám êm ái, khung dát giường chịu lực, có ngăn kéo gầm giường",
    aliases: [
      "giuong ngu", "giường ngủ", "giường bọc nệm", "giuong boc nem", "giường bọc da", 
      "giường hộp", "giuong hop", "giường phản", "giuong phan", "giuong ngu 1m8", "bed", "king bed"
    ],
    defaultDimensions: { widthMm: 1800, depthMm: 2000, heightMm: 1050 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: true, hasLed: false },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Vai_Ni_Boc_Nem",
    typicalLabourHours: 10.0,
    tags: ["phòng ngủ", "giường", "bọc đệm"],
  },

  // =========================================================================
  // 5. CỬA & VÁCH NHÔM KÍNH (ARCHITECTURAL GLAZING & SLIM)
  // =========================================================================
  {
    id: "slim_sliding_door",
    name: "Cửa Lùa Slim Nhôm Kính Kịch Trần",
    category: "aluminum_glass",
    categoryLabel: "Cửa & Vách Nhôm Kính",
    badge: "Khung Slim 16mm Siêu Mỏng",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Maximize",
    description: "Khung nhôm anode thanh mảnh 16mm, kính cường lực 8.38mm an toàn, ray treo âm sàn giảm chấn OPK",
    aliases: [
      "cua lua slim", "cửa lùa slim", "cửa slim", "cua slim", "cửa kính lùa", 
      "cua kinh lua", "cửa trượt kính", "cua truot kinh", "cửa nhôm slim", "cửa lùa ngăn phòng", "sliding door"
    ],
    defaultDimensions: { widthMm: 2400, depthMm: 80, heightMm: 2600 },
    defaultFlags: { hasStone: false, hasGlass: true, hasMetal: true, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "NHOM_SLIM_16MM",
    defaultSurfaceCode: "Kinh_838_An_Toan",
    typicalLabourHours: 6.0,
    tags: ["cửa kính", "nhôm slim", "cửa trượt"],
  },
  {
    id: "glass_partition_wall",
    name: "Vách Kính Ngăn Phòng Cường Lực",
    category: "aluminum_glass",
    categoryLabel: "Cửa & Vách Nhôm Kính",
    badge: "Kính 10-12mm Tempered",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Maximize",
    description: "Vách ngăn văn phòng hoặc phòng ngủ kính cường lực 10mm nẹp nhôm giấu viền cách âm",
    aliases: [
      "vach kinh", "vách kính", "vách ngăn kính", "vach ngan kinh", "vách kính cường lực", 
      "vách nhôm kính", "vach nhom kinh", "glass partition"
    ],
    defaultDimensions: { widthMm: 3000, depthMm: 50, heightMm: 2700 },
    defaultFlags: { hasStone: false, hasGlass: true, hasMetal: true, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "KINH_10MM_TEMPERED",
    defaultSurfaceCode: "Nep_Nhom_Anode",
    typicalLabourHours: 5.0,
    tags: ["vách kính", "ngăn phòng", "cường lực"],
  },

  // =========================================================================
  // 6. RESIN, MỸ THUẬT & ĐỒ RỜI (RESIN & ARTISTIC)
  // =========================================================================
  {
    id: "epoxy_resin_table",
    name: "Bàn Gỗ Tự Nhiên Đổ Keo Epoxy Resin",
    category: "artistic_resin",
    categoryLabel: "Resin & Mỹ Thuật",
    badge: "Keo Resin Đúc Khuôn",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Sparkles",
    description: "Mặt bàn gỗ lũa me tây kết hợp keo epoxy resin trong suốt như dòng sông, mài bóng gương",
    aliases: [
      "ban resin", "bàn resin", "bàn epoxy", "ban epoxy", "bàn dòng sông", 
      "ban dong song", "bàn gỗ lũa", "bàn đổ keo", "epoxy table", "resin table"
    ],
    defaultDimensions: { widthMm: 1800, depthMm: 800, heightMm: 750 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: true, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "RESIN_EPOXY_DUC",
    defaultSurfaceCode: "Danh_Bong_Guong",
    typicalLabourHours: 28.0,
    tags: ["resin", "epoxy", "thủ công", "mỹ thuật"],
  },
  {
    id: "antique_leaf_mirror",
    name: "Gương Soi Tân Cổ Điển Dát Vàng Lá (Metal Leaf)",
    category: "artistic_resin",
    categoryLabel: "Resin & Mỹ Thuật",
    badge: "Dát Lá Vàng & Sơn Giả Cổ",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    iconName: "Sparkles",
    description: "Khung gương điêu khắc hoa văn đúc sợi thủy tinh composite, dát lá kim loại vàng/bạc phủ giả cổ antique",
    aliases: [
      "guong soi", "gương soi", "gương tân cổ điển", "guong tan co dien", "gương dát vàng", 
      "guong dat vang", "gương khung hoa văn", "khung tranh dát vàng", "metal leaf mirror"
    ],
    defaultDimensions: { widthMm: 900, depthMm: 60, heightMm: 1500 },
    defaultFlags: { hasStone: false, hasGlass: true, hasMetal: false, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "COMPOSITE_RESIN",
    defaultSurfaceCode: "Dat_La_Vang_Antique",
    typicalLabourHours: 18.5,
    tags: ["gương", "dát vàng", "antique", "tân cổ điển"],
  },

  // =========================================================================
  // 7. HẠNG MỤC TÙY CHỈNH TỰ DO (CUSTOM COMPOSITE)
  // =========================================================================
  {
    id: "custom_composite",
    name: "Hạng Mục Đặt Đóng Tùy Chỉnh (Custom)",
    category: "custom",
    categoryLabel: "Tùy chỉnh tự do",
    badge: "Mở Rộng Không Giới Hạn",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    iconName: "Box",
    description: "Sản phẩm đặt đóng theo yêu cầu riêng, cho phép tự do chọn vật liệu, kích thước và thêm dòng chi phí tự do (Adhoc lines)",
    aliases: [
      "tùy chỉnh", "tuy chinh", "tự do", "tu do", "khác", "khac", "đặt đóng", "dat dong", "custom"
    ],
    defaultDimensions: { widthMm: 1500, depthMm: 600, heightMm: 800 },
    defaultFlags: { hasStone: false, hasGlass: false, hasMetal: false, hasUpholstery: false, hasLed: false },
    defaultCoreCode: "MDF_17_CHONG_AM",
    defaultSurfaceCode: "Melamine",
    typicalLabourHours: 8.0,
    tags: ["tùy chỉnh", "tự do", "adhoc"],
  },
];

/**
 * Hàm chuẩn hóa chuỗi tiếng Việt bỏ dấu và chuyển chữ thường để so sánh thông minh
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Hàm tìm kiếm thông minh sản phẩm theo từ khóa (dù khách gõ sai chính tả, không dấu hay từ lóng)
 */
export function searchProductArchetypes(
  query: string,
  categoryFilter: string = "all"
): ProductArchetypeItem[] {
  const normQuery = normalizeVietnamese(query);

  let filtered = PRODUCT_ARCHETYPES_CATALOG;
  if (categoryFilter && categoryFilter !== "all") {
    filtered = filtered.filter((item) => item.category === categoryFilter);
  }

  if (!normQuery) {
    return filtered;
  }

  // Điểm số khớp thông minh (Relevance Scoring)
  const scored = filtered.map((item) => {
    let score = 0;
    const normName = normalizeVietnamese(item.name);
    const normDesc = normalizeVietnamese(item.description);

    // 1. Khớp chính xác tên sản phẩm
    if (normName === normQuery) {
      score += 100;
    } else if (normName.includes(normQuery)) {
      score += 50;
    }

    // 2. Khớp trong danh sách từ khóa đồng nghĩa (Aliases)
    for (const alias of item.aliases) {
      const normAlias = normalizeVietnamese(alias);
      if (normAlias === normQuery) {
        score += 80;
        break;
      } else if (normAlias.includes(normQuery) || normQuery.includes(normAlias)) {
        score += 40;
        break;
      }
    }

    // 3. Khớp từng từ khóa nhỏ (tokens)
    const tokens = normQuery.split(" ").filter((t) => t.length > 1);
    let matchedTokens = 0;
    for (const token of tokens) {
      if (normName.includes(token) || normDesc.includes(token) || item.tags.some((t) => normalizeVietnamese(t).includes(token))) {
        matchedTokens++;
      }
    }
    score += matchedTokens * 10;

    return { item, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
