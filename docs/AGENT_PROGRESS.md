# AutoCutlist: Tiến Độ Thực Hiện (AGENT_PROGRESS.md)

Theo dõi tiến độ thực hiện theo `docs/AGENT_RUNBOOK.md` (bản v3).  
Quy tắc: Cập nhật sau MỖI commit. Dừng tại các cổng quy định.

---

## BẢNG THEO DÕI TIẾN ĐỘ

### GIAI ĐOẠN A: NỀN TẢNG TÍNH GIÁ & HOÀN TẤT ĐỢT SỬA DỞ
- [x] **A1.** `saveProfile` / `saveProject`: kiểm tra trúng 0 dòng với `.select('id')`, không nuốt lỗi, UI phân biệt thông báo Cloud vs Offline, test mô phỏng. (Commit: `bb255e6`)
- [x] **A2.** Migration hợp nhất `20261025131700_add_cost_config_and_calc_version.sql` (v3: không thêm khóa riêng cho keo/bản lề vào CHECK, hàm `_cc_num_ok` + `is_valid_cost_config`, trigger `handle_new_user`, backfill, GRANT thẳng, bộ ca SQL test trong `supabase/tests/`).
- [x] **A3.** Cấu hình xưởng (v3: ẩn khỏi UI mọi ô chưa có tác dụng thật, giữ số vàng không đổi).
- [x] **A4.** Hao hụt mặc định theo tài liệu sản phẩm (17mm: 1.15, 6mm: 1.12, Jumbo: 1.18), chạy lại engine trên seed, đối soát số liệu.
- [x] **A5.** CI cùng phiên bản Node 24 với máy dev, biến môi trường build placeholder.
- [x] **A6.** Đồng bộ `docs/BACKLOG.md` (P0-10 migration nền và P1-4).
- [x] **A7.** Cập nhật Rules 11-16 vào `GEMINI.md` / rules.
- [x] **A8.** Bộ test lõi tính toán (golden + ca biên cho board, edge, quote-engine, đo coverage).
- [x] **A9.** Tổng kiểm Giai đoạn A (chạy VERIFY đầy đủ, xác nhận số vàng: 33 tests pass, base cost 16.281.950 đ, quote 26.865.218 đ, boards 11.140.000 đ, 18.5 sheets).

---

### GIAI ĐOẠN A+: TỔNG QUÁT HÓA MÔ HÌNH CHI PHÍ
- [x] **AX1.** Kiểm kê chỗ "cục bộ" (CHỈ ĐỌC, ghi `docs/reports/AX1.md`). (Commit: `73d377a`)
- [x] **AX2.** Kế hoạch PLAN mô hình chi phí tổng quát (`docs/PLAN_COST_MODEL.md`) 🛑 **CỔNG G4: DỪNG CHỜ DUYỆT**.
- [x] **AX3.** Lõi engine tổng quát (sau G4): thư mục `cost-lines/` hàm thuần, adapter `legacyConfigToLines`, bộ test đối chiếu và 6 kind quy tắc, 44 tests pass.
- [x] **AX4.** Đưa bản lề, ray, keo, vật tư phụ vào mô hình chung: tạo mẫu xưởng `createIndustrialWorkshopPreset`, `createTurnkeyContractorPreset`, kiểm thử ca biên `tiers` và tắt mở theo Rule 14, 15 (48 tests pass).
- [x] **AX5.** Danh mục vật tư tổng quát: mở rộng `MaterialCategory` 11 loại, `GeneralCatalogItem`, chuẩn hóa từ điển `terms.ts`.
- [x] **AX6.** Nhiều cách nhập và nhiều hạng mục: `section-calculator.ts` hỗ trợ Cutlist chi tiết, báo nhanh m²/md, dòng nhập tay và xuất cảnh báo BOM xưởng rõ ràng.
- [x] **AX7.** Bộ 7 golden đa dạng (seed 48 tấm, tủ bếp có đá, tủ áo, vách m², dòng nhập tay, VAT/giảm giá, cấu hình rỗng) và test tính chất toán học (59 tests pass).
- [x] **AX8.** Tổng kiểm A+: toàn bộ 59 unit tests pass, số vàng seed 16.281.950 đ / 26.865.218 đ bất biến, cập nhật migration A2 CHECK chung an toàn (tối đa 100 dòng costLines, 32KB).

---

### GIAI ĐOẠN B: AUDIT SẴN SÀNG RA MẮT (CHỈ ĐỌC - thực hiện trong lúc chờ G4)
- [x] **B.** Viết `docs/AUDIT_REPORT.md` (11 mục audit chi tiết) 🛑 **CỔNG G1: DỪNG CHỜ DUYỆT**.

---

### GIAI ĐOẠN C: SCHEMA NỀN, TỔ CHỨC & RLS
- [x] **C1.** PLAN tổ chức & RLS (`docs/PLAN_ORGANIZATION_RLS.md`) 🛑 **CỔNG G2: ĐÃ DUYỆT**.
- [x] **C2.** Migration nền sạch `20261031084500_baseline_schema.sql` (9 bảng, RLS đa thành viên, trigger đăng ký tự động) + test RLS 6 tình huống (`supabase/tests/test_rls_baseline.sql`) + `docs/DB_RESET.md`.
- [x] **C3.** Cập nhật code theo schema mới (`storageService` ánh xạ `client_address`, `sections_snapshot`, tự resolve `org_id`, kiểm tra xung đột Optimistic Concurrency, hàm `syncLocalDemoToCloud()`, mời thành viên tổ chức, 62 tests pass).

---

### GIAI ĐOẠN D: CÁC MỤC CHẶN RA MẮT (P0)
- [x] **D1.** RLS `profiles` chặn tự đổi `subscription_tier` (Đã chặn ở baseline C2 qua Column-level Grant chỉ 9 cột, subscriptions tách bảng riêng chỉ backend ghi, test xác thực 63 tests pass).
- [x] **D2.** Bảo mật 3 API route (Zod schema, size limit, rate limit, no PII log: tạo `api-guard.ts` và áp dụng cho `/api/projects/direct-ingest`, `/api/license/verify`, 68 tests pass).
- [ ] **D3.** Webhook thanh toán (HMAC signature, idempotency).
- [ ] **D4.** Security headers trong `next.config.mjs`.
- [ ] **D5.** Trang Điều khoản & Chính sách quyền riêng tư (nháp).
- [ ] **D6.** Xóa tài khoản & Xuất dữ liệu.
- [ ] **D7.** Giám sát lỗi (lọc PII).
- [ ] **D8.** ESLint thật, error boundary, xóa catch rỗng.
- [ ] **D9.** `docs/OPERATIONS.md` (backup, restore, phân tách dev/prod).
- [ ] **D10.** `docs/AUTH_SETUP.md` (hardened auth checklist).

---

### GIAI ĐOẠN E: BƯỚC 4 — LUỒNG 3 BƯỚC & CHẾ ĐỘ NÂNG CAO
- [ ] **E1-E8.** Stepper 3 bước `/quoting`, Chế độ nâng cao, badge cấu hình, bộ lọc hiển thị.
- [ ] **E9.** Dọn dẹp dependency chưa dùng.

---

### GIAI ĐOẠN F: BƯỚC 5 — CHIA SẺ BÁO GIÁ BẰNG LINK BẢO MẬT
- [ ] **F.** Bảng `quote_shares`, che dữ liệu server-side, link bảo mật, PDF print.

---

### GIAI ĐOẠN G: CHECKLIST GO-LIVE
- [ ] **G.** `docs/GO_LIVE.md` (chuẩn bị go-live) 🛑 **CỔNG G5 & G6**.

---

## NHẬT KÝ THỰC HIỆN
- *31/10/2026:* Khởi tạo file tiến độ từ `docs/AGENT_RUNBOOK.md` bản v3. Bắt đầu rà soát Giai đoạn A.
- *31/10/2026:* Hoàn tất AX3: Lõi engine tổng quát `src/core/calculations/cost-lines/` (types, resolver, engine), adapter `legacyConfigToLines`, bộ test đối chiếu bảo toàn số vàng tuyệt đối (44 tests pass).
- *31/10/2026:* Hoàn tất AX4: Đưa bản lề, ray, keo, vật tư phụ vào mô hình chung (preset ván công nghiệp & thầu thi công trọn gói), test toàn diện ca biên `tiers` (đúng ngưỡng, dưới ngưỡng, kịch trần, rỗng) (48 tests pass).
- *31/10/2026:* Hoàn tất AX5, AX6, AX7: Danh mục vật tư tổng quát (11 categories), thuật ngữ `terms.ts`, `section-calculator.ts` hỗ trợ 3 chế độ nhập kèm cảnh báo BOM, bộ 7 ca golden và 4 test tính chất toán học (59 tests pass).
- *31/10/2026:* Hoàn tất AX8: Tổng kiểm Giai đoạn A+ (59 tests pass, build xanh, cập nhật CHECK tổng quát migration 20261025131700). Sẵn sàng chuyển sang Giai đoạn C (C1: PLAN Schema nền, tổ chức & RLS).
- *31/10/2026:* Hoàn tất C1: Lập kế hoạch thiết kế schema nền đa thành viên, phân quyền 4 vai trò (owner, sales, viewer, anon) và kế hoạch kiểm thử RLS tại `docs/PLAN_ORGANIZATION_RLS.md`. DỪNG TẠI CỔNG G2.
- *31/10/2026:* Hoàn tất C2: Viết migration nền sạch `20261031084500_baseline_schema.sql`, bộ test RLS `test_rls_baseline.sql` và hướng dẫn `docs/DB_RESET.md`. (59 tests pass).
- *31/10/2026:* Hoàn tất C3: Nâng cấp `storageService.ts` đồng bộ schema tổ chức đa thành viên, hỗ trợ `syncLocalDemoToCloud()`, `getOrgMembers()`, `inviteOrgMember()`, kiểm tra xung đột Optimistic Concurrency Control, bổ sung 3 unit tests mới (62 tests pass).
- *31/10/2026:* Hoàn tất D1: Xác thực triệt để RLS và phân quyền cột `profiles` ngăn chặn tự đổi `subscription_tier`, tách `subscriptions` riêng chỉ có service role ghi, bổ sung test xác thực (63 tests pass).
- *31/10/2026:* Hoàn tất D2: Xây dựng bộ chắn bảo mật `api-guard.ts` (Rate limit sliding window, body size limit, lọc sạch PII logging, Zod schemas kiểm duyệt đầu vào) và áp dụng cho direct-ingest và license verify (68 tests pass).
