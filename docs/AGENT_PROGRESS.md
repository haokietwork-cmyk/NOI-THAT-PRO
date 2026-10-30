# AutoCutlist: Tiến Độ Thực Hiện (AGENT_PROGRESS.md)

Theo dõi tiến độ thực hiện theo `docs/AGENT_RUNBOOK.md` (bản v3).  
Quy tắc: Cập nhật sau MỖI commit. Dừng tại các cổng quy định.

---

## BẢNG THEO DÕI TIẾN ĐỘ

### GIAI ĐOẠN A: NỀN TẢNG TÍNH GIÁ & HOÀN TẤT ĐỢT SỬA DỞ
- [x] **A1.** `saveProfile` / `saveProject`: kiểm tra trúng 0 dòng với `.select('id')`, không nuốt lỗi, UI phân biệt thông báo Cloud vs Offline, test mô phỏng. (Commit: `bb255e6`)
- [x] **A2.** Migration hợp nhất `20261025131700_add_cost_config_and_calc_version.sql` (v3: không thêm khóa riêng cho keo/bản lề vào CHECK, hàm `_cc_num_ok` + `is_valid_cost_config`, trigger `handle_new_user`, backfill, GRANT thẳng, bộ ca SQL test trong `supabase/tests/`).
- [ ] **A3.** Cấu hình xưởng (v3: ẩn khỏi UI mọi ô chưa có tác dụng thật, giữ số vàng không đổi).
- [ ] **A4.** Hao hụt mặc định theo tài liệu sản phẩm (17mm: 1.15, 6mm: 1.12, Jumbo: 1.18), chạy lại engine trên seed, đối soát số liệu.
- [ ] **A5.** CI cùng phiên bản Node 24 với máy dev, biến môi trường build placeholder.
- [ ] **A6.** Đồng bộ `docs/BACKLOG.md` (P0-10 migration nền và P1-4).
- [ ] **A7.** Cập nhật Rules 11-16 vào `GEMINI.md` / rules.
- [ ] **A8.** Bộ test lõi tính toán (golden + ca biên cho board, edge, quote-engine, đo coverage).
- [ ] **A9.** Tổng kiểm Giai đoạn A (chạy VERIFY đầy đủ, xác nhận số vàng).

---

### GIAI ĐOẠN A+: TỔNG QUÁT HÓA MÔ HÌNH CHI PHÍ
- [ ] **AX1.** Kiểm kê chỗ "cục bộ" (CHỈ ĐỌC, ghi `docs/reports/AX1.md`).
- [ ] **AX2.** Kế hoạch PLAN mô hình chi phí tổng quát (`docs/PLAN_COST_MODEL.md`) 🛑 **CỔNG G4: DỪNG CHỜ DUYỆT**.
- [ ] **AX3.** Lõi engine tổng quát (sau G4).
- [ ] **AX4.** Đưa bản lề, ray, keo, vật tư phụ vào mô hình chung.
- [ ] **AX5.** Danh mục vật tư tổng quát và UI.
- [ ] **AX6.** Nhiều cách nhập và nhiều hạng mục.
- [ ] **AX7.** Bộ golden đa dạng và test tính chất.
- [ ] **AX8.** Tổng kiểm A+.

---

### GIAI ĐOẠN B: AUDIT SẴN SÀNG RA MẮT (CHỈ ĐỌC - thực hiện trong lúc chờ G4)
- [ ] **B.** Viết `docs/AUDIT_REPORT.md` (11 mục audit chi tiết) 🛑 **CỔNG G1: DỪNG CHỜ DUYỆT**.

---

### GIAI ĐOẠN C: SCHEMA NỀN, TỔ CHỨC & RLS
- [ ] **C1.** PLAN tổ chức & RLS (`docs/PLAN_ORGANIZATION_RLS.md`) 🛑 **CỔNG G2: DỪNG CHỜ DUYỆT**.
- [ ] **C2.** Migration nền sạch + test RLS (`supabase/tests/rls_*.sql`) + `docs/DB_RESET.md`.
- [ ] **C3.** Cập nhật code theo schema mới (`storageService`, auth, org).

---

### GIAI ĐOẠN D: CÁC MỤC CHẶN RA MẮT (P0)
- [ ] **D1.** RLS `profiles` chặn đổi `subscription_tier`.
- [ ] **D2.** Bảo mật 3 API route (Zod schema, size limit, rate limit, no PII log).
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
