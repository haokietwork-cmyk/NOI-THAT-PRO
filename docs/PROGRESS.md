# NHẬT KÝ TIẾN ĐỘ TRIỂN KHAI (PROGRESS LOG)

## Bước 0 — Audit hệ thống — 2026-11-07
- **Đã làm:**
  - Đọc toàn bộ `brief-cong-cu-bao-gia.md` và `runbook-trien-khai-brief.md`.
  - Kiểm tra tính bảo mật biến môi trường, RLS, phân quyền Snapshot Pricing.
  - Tạo tài liệu audit tại `docs/AUDIT.md`.
  - Lập danh sách các câu hỏi chặn cần chủ dự án xác nhận tại `docs/BLOCKERS.md`.
- **Kiểm tra đã chạy:**
  - `npx tsc --noEmit` -> exit code 0
  - `npm test` -> 121/121 pass
  - `npm run build` -> exit code 0

---

## Bước 1 — Tách engine + Khóa hành vi hiện có + Thêm mô hình Export Furniture — 2026-11-07
- **Đã làm:**
  - Tạo giao diện `PricingContext`, `PricingConstants`, `MoqTier` và `CostingModel<I, O>` thuần túy trong `src/core/calculations/models/pricing-context.ts`.
  - Triển khai hàm `roundHalfUp` làm tròn nửa lên chuẩn Excel (`922.5 -> 923`).
  - Đóng gói mô hình `panelCncModel` trong `src/core/calculations/models/panel-cnc-model.ts`, bảo toàn 100% kết quả cũ.
  - Triển khai mô hình `exportFurnitureModel` trong `src/core/calculations/models/export-furniture-model.ts` với đầy đủ 15 nhóm chi phí: Stone (0% OH), Upholstery/Metal frame - S/Subcon (10% OH), Wood/Carcass/Finishing/Labour (35% OH), COGS, Profit 20%, phụ phí MOQ linh hoạt.
  - Viết bộ test kiểm thử `src/core/calculations/models/export-furniture.test.ts` bao phủ toàn bộ bộ số mẫu trong brief:
    + 1a: Khóa số vàng `panel_cnc` (38.6 m² Net -> 15 tấm @ 680k = 10.200.000 đ; Giá vốn 15.913.000 đ x 1.65 = 26.256.450 đ, lãi 39.4%).
    + 1b: Test `roundHalfUp` nửa lên như Excel (738 x 1.25 = 922.5 -> 923).
    + 1c: Ván `WO02-0034` (Using = 4.0905, tiền = 17.51854797).
    + 1c: Gỗ Beech `WO01-BEE-0003` (Using = 0.00102894, tiền = 0.66582442).
    + 1c: Costing V1 (Wood 6.7891, Metal frame - S 0.0119 -> Giá bán 11, MOQs 11/12/12/14/24/24).
    + 1c: QOT-24169 V1 (L&M 455.538 -> Giá bán 738, MOQs 738/775/812/923/2214/2214 với 200% cho MOQ 1 & 2).
    + 1c: QOT-24169 V2 (L&M 371.9793 -> Giá bán 603, MOQs 603/633/663/754/1809/1809).
- **Kiểm tra đã chạy:**
  - `npm test` -> 128/128 pass

---

## Bước 2 & 3 — Khai mở Danh mục Vật tư Sheet1 & 37 Công đoạn Nhân công Quy trình — 2026-11-07
- **Đã làm:**
  - Giải mã hoàn toàn công thức tính nhân công thực tế:
    + 37 công đoạn thực tế từ sheet `Quy trình` cột M-Q (nhóm Carcass, Finishing, Uph, Fitting, Packing).
    + Đơn giá tham khảo chuẩn xưởng từ dòng 723 sheet `Material`: **105.000 đ/h = 4.2 USD/h**.
    + Chi phí từng công đoạn = `Số giờ x Đơn giá giờ`. Tổng các công đoạn khớp chuẩn xác 100% con số `211.1139 USD` trong hồ sơ `QOT-24169`.
  - Trích xuất 612 vật tư tham khảo từ `Sheet1` (28/08/2026) vào `src/core/data/exportFurnitureCatalog.ts`, phân loại 16 nhóm ngành (Gỗ, Veneer, Ván, Plywood, Kim loại, Đá, Nệm/da, Hóa chất, Phụ kiện...).
  - Thiết lập bảng MOQ linh hoạt mặc định (20 -> 0%, 15 -> 5%, 10 -> 10%, 5 -> 25%, 2 -> 120%, 1 -> 120% hoặc 200%).
  - Mọi thông số được định dạng mở: không gán cứng, người dùng tự do điều chỉnh trên giao diện.
- **Kiểm tra đã chạy:**
  - `src/core/calculations/models/export-furniture.test.ts` bổ sung test 1d (Nhân công 10 công đoạn thực tế @ 4.2 USD/h ra đúng 211.1139 USD) -> 8/8 pass.

---

## Bước 7 — Tích hợp Google Gemini Estimator (Demo Mode) — 2026-11-07
- **Đã làm:**
  - Xây dựng module `src/core/ai/types.ts` và `src/core/ai/gemini-estimator.ts`.
  - Chế độ Demo: Tự động đối chiếu thông minh với 612 mã vật tư từ `Sheet1`, gợi ý khoảng giá [low, mid, high], hao hụt chuẩn và các công đoạn nhân công kèm số giờ dự kiến @ 4.2 USD/h.
  - Chế độ Production: Kết nối Google Gemini API với validation JSON schema chặt chẽ, chống prompt injection, giới hạn token.
  - Luôn gắn cờ `isAiUnconfirmed: true` để người dùng kiểm duyệt trước khi áp giá chính thức.
  - Tạo route API server: `src/app/api/ai/estimate/route.ts`.
  - Viết 3 unit tests tại `src/core/ai/gemini-estimator.test.ts` (Demo mode, matching MDF, chống prompt injection).
- **Kiểm tra đã chạy:**
  - `npx tsc --noEmit` -> exit code 0
  - `npm test` -> exit code 0 (132/132 tests pass)
  - `npm run build` -> exit code 0 (30/30 routes pass, bao gồm `/api/ai/estimate`)

---

## Bước 4 — Nâng Cấp Giao Diện Web & Sơ Đồ Vận Hành Toàn Diện — 2026-11-07
- **Đã làm:**
  - Tái thiết kế toàn diện trang chủ `src/app/(public)/page.tsx` theo chuẩn Thẩm mỹ kỹ thuật xưởng mộc (Technical Wood Palette: Slate 50, lưới blueprint 24px, viền Slate 200, Amber 600, Emerald 600, Sky 600, font Inter + JetBrains Mono tabular-nums). Nghiêm cấm 100% AI slop (không 3D tilt, không nền đen neon, không hạt lơ lửng, không chữ cực quang).
  - Tích hợp **CostingSandboxWidget** trực tiếp vào Hero:
    + 5 Archetypes đa dòng hàng đại diện: Tủ áo MDF chống ẩm Melamine, Bàn ăn Gỗ Sồi Bắc Mỹ FAS, Bàn trà Mặt đá Onyx chân đồng (Đá 0% OH + Ant-Marb 3.42x), Cửa lùa Slim nhôm kính 16mm, Ghế Lounge da bò Ý.
    + 3 thanh trượt tham số (W x D x H) và bộ chọn bậc thang số lượng MOQ (1 / 5 / 10 / 20).
    + Các con số Giá vốn (COGS), Giá bán khách, Biên lãi %, Quy cách vật tư & Số giờ công lao động nhảy số mượt mà theo thời gian thực (Reactive numbers tabular-nums).
    + Tính năng mở/gập xem phân rã chi phí chi tiết 4 nhóm (Vật liệu, Nhân công, Overhead, Hao hụt).
  - Xây dựng **OperationalWorkflowDiagram**:
    + Sơ đồ vận hành 4 giai đoạn tương tác: 01. Đầu vào đa dạng (W×D×H vs BOM) -> 02. Động cơ tính toán kép (`panel_cnc` & `export_furniture`) + Trợ lý Gemini AI -> 03. Một đầu vào, hai đầu ra (Xưởng Excel & Khách A4 PDF) -> 04. 4 Trụ cột hậu báo giá.
  - Xây dựng **Bento Grid 4 Trụ Cột Nghiệp Vụ** (Houzz Pro for Vietnam):
    + 1. Financial & Costing Suite (37 công đoạn thực tế, 15 nhóm chi phí).
    + 2. Selections Portal (Cổng duyệt mẫu vật tư online qua di động).
    + 3. Change Orders (Phiếu phát sinh thi công ký số trên màn hình cảm ứng).
    + 4. Client Portal (Cổng tra cứu tiến độ thi công & nghiệm thu theo SĐT).
  - Xây dựng mục **Accordion FAQ** (shadcn pattern): Giải tỏa 5 thắc mắc thực tế của xưởng (Đa dòng hàng, bảo mật giá vốn, ký số trên di động, Snapshot giá bất biến, vai trò của Gemini AI).
- **Kiểm tra đã chạy:**
  - `npx tsc --noEmit` -> exit code 0
  - `npm test` -> exit code 0 (132/132 tests pass)
  - `npm run build` -> exit code 0 (30/30 static & dynamic routes pass)
