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
