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
- **Còn tồn / BLOCKERS:** 8 câu hỏi tại `docs/BLOCKERS.md`.

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
  - `npx tsc --noEmit` -> exit code 0
  - `npm test` -> exit code 0 (128/128 pass, tăng 7 test mới)
  - `npm run build` -> exit code 0 (29/29 routes pass)
- **Bộ số kiểm thử:** 7/7 ca pass 100%.
- **Còn tồn / BLOCKERS:** Chuẩn bị Bước 2 (Schema DB & Migration mở rộng) và Bước 4 (UI nhập liệu).
