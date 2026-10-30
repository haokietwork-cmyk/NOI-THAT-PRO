# AutoCutlist: Runbook cho AI Agent (Antigravity) — v3

Cập nhật: 31/10/2026. Đặt tệp này vào repo tại `docs/AGENT_RUNBOOK.md`.
Mục tiêu: agent tự thực hiện toàn bộ các bước còn lại, tự kiểm tra, tự sửa lỗi, và chỉ dừng ở các "cổng" ghi rõ bên dưới.

**Bản bổ sung v2 (31/10/2026) đã thêm các phần còn thiếu so với lộ trình đã thống nhất:**
- Mục 5: Rule 12 (không phá Snapshot Pricing), Rule 13 (quy tắc từ ngày có khách thật: migration qua preview, changelog, quay lại bản cũ).
- A8 (mới): bộ test lõi tính toán theo module và các ca biên. A8 cũ thành A9.
- D10 (mới): làm cứng Supabase Auth (xác nhận email, đặt lại mật khẩu, redirect URL, chống dò mật khẩu, captcha, SMS).
- D8 sửa: KHÔNG gỡ 27 dependency chưa dùng trước Bước 4. Việc gỡ chuyển sang E9.
- Giai đoạn H (mới, P1 sau ra mắt): đóng băng dự án khi chốt hợp đồng, nhật ký thay đổi, tính bản lề/ray, nâng cấp dự án công thức cũ, onboarding, tối ưu điện thoại, phân tích sử dụng.
- Giai đoạn I (mới, P2): lịch sử giá, nhập Excel, plugin, gói cước, khách duyệt online, báo cáo, mẫu theo phân khúc và các mục dài hạn.
- Cổng G6. Mục 8 thêm việc của người. Mục 10 (mới): mẫu prompt sửa lỗi nhỏ.
- Bổ sung nhỏ: kiểm tra Dashboard dùng số nào (audit mục 5), 4 vai trò trong test RLS (C1.8), mục G10-G14 trong go-live.

**Bản v3 (31/10/2026): tổng quát hóa để không còn tư duy cục bộ (ván, bản lề, ray, keo...):**
- Giai đoạn A+ (mới, nằm giữa A và B): mô hình "dòng chi phí" tổng quát. Mọi vật tư, phụ kiện, nhân công, thiết bị mua ngoài là dữ liệu cấu hình, không phải code/cột DB/ô UI riêng. Có cổng G4 ở AX2.
- Rule 14-16 (mục 5): tổng quát trước cụ thể sau; không bịa số; mỗi loại quy tắc/loại hình dự án có golden riêng.
- A2 (CHECK), A3 (keo, bản lề), H3 (bản lề/ray), C1 (schema) được sửa cho khớp. Mục 8 thêm việc #17 (thông tin loại hình báo giá thực tế của xưởng).

---

## 0. Cách bắt đầu

1. Đọc toàn bộ tệp này trước khi làm gì.
2. Tạo `docs/AGENT_PROGRESS.md` (danh sách checkbox theo mã việc A1, A2, ... bên dưới). Cập nhật sau MỖI commit. Nếu hội thoại bị cắt hoặc mất ngữ cảnh, đọc lại tệp này và `AGENT_PROGRESS.md` để làm tiếp từ chỗ dừng.
3. Làm tuần tự theo thứ tự giai đoạn: **A → A+ → B → C → D → E → F → G → H → I**. Không nhảy cóc, không gộp giai đoạn. H và I chỉ bắt đầu sau go-live và qua cổng G6.

---

## 1. Chế độ vận hành (thay thế Rule 1 cũ "luôn dừng chờ duyệt")

Agent **tự làm, tự kiểm, tự sửa, không hỏi** ở mọi việc, trừ các "cổng" dưới đây. Tới cổng thì dừng phần đó, ghi vào `AGENT_PROGRESS.md`, rồi làm tiếp các việc độc lập không phụ thuộc cổng.

| Cổng | Khi nào dừng | Ai xử lý |
|---|---|---|
| G1 | Sau khi xong Giai đoạn B (audit). Nộp `docs/AUDIT_REPORT.md` kèm thứ tự sửa | Người duyệt |
| G2 | Sau khi viết PLAN tổ chức/RLS (C1), trước khi viết SQL | Người duyệt |
| G3 | Mọi thứ cần chạy trên Supabase thật hoặc thử nghiệm | Chỉ người chạy. Agent chỉ viết file và hướng dẫn |
| G4 | Muốn thêm thư viện mới, đổi cấu trúc thư mục, hoặc đổi công thức tính tiền | Hỏi người |
| G5 | Public repo, deploy production, đổi khóa/bí mật | Chỉ người |
| G6 | Trước khi bắt đầu Giai đoạn H hoặc I: go-live xong và người chốt thứ tự ưu tiên các mục H/I | Người duyệt |

---

## 2. Vòng lặp tự kiểm, tự sửa (áp dụng cho MỌI việc)

```
LẶP cho mỗi việc nhỏ (1 việc = 1 commit):
 1. Đọc code liên quan. Ghi 2-3 dòng kế hoạch vào AGENT_PROGRESS.md.
 2. Viết TEST TRƯỚC nếu là logic tính tiền hoặc lỗi cần tái hiện. Chạy, thấy đỏ.
 3. Sửa code tối thiểu.
 4. Chạy bộ VERIFY (mục 3). Phải xanh toàn bộ.
 5. Nếu đỏ: đọc lỗi, tìm NGUYÊN NHÂN GỐC, sửa, chạy lại. Tối đa 3 vòng.
 6. Sau 3 vòng vẫn đỏ: git restore/revert về commit xanh gần nhất (không để cây làm việc bẩn),
    ghi BLOCKER vào AGENT_PROGRESS.md (lệnh, output lỗi, giả thuyết, đã thử gì),
    chuyển sang việc độc lập tiếp theo.
 7. Xanh: commit (thông điệp tiếng Việt không dấu, dạng "fix(scope): ..." như lịch sử hiện có).
 8. Ghi báo cáo theo mẫu mục 7.
```

**Cấm tuyệt đối khi "tự sửa":** làm yếu hoặc xóa test cho qua, thêm vào `exclude`/`@ts-ignore`/`eslint-disable` để né lỗi, `catch` rỗng, đổi con số kỳ vọng cho khớp kết quả sai, hạ ngưỡng kiểm tra. Lỗi phải được sửa ở gốc.

**Bằng chứng:** mọi con số, tên test, hash commit trong báo cáo phải chép từ output lệnh VỪA chạy. Không tự tính nhẩm. Nếu là ước tính thì ghi rõ chữ "ước tính".

---

## 3. Bộ lệnh kiểm tra chuẩn (VERIFY)

Chạy trong thư mục dự án (Windows PowerShell). Tất cả phải đạt trước mỗi commit.

```powershell
npm run lint
npm test
npm run build
git status --short                                  # chỉ thấy các file vừa sửa
git ls-files | findstr /i env                       # CHỈ được thấy .env.local.example

# Quét vi phạm (phải KHÔNG có kết quả, trừ ghi chú):
git grep -nE "service_role|SERVICE_ROLE" -- src ":!src/app/api" ":!src/lib/server"
git grep -nE "catch[[:space:]]*(\([^)]*\))?[[:space:]]*\{[[:space:]]*\}" -- src
git grep -nE "console\.(log|error|warn)\(.*(phone|client_name|client_phone|address|email)" -- src
git grep -nE "@ts-ignore|eslint-disable" -- src
```

Nếu `npm run lint` hiện vẫn chỉ là `tsc --noEmit` thì ghi rõ trong báo cáo, và làm việc D8 (ESLint thật) ở Giai đoạn D.

**Số vàng (golden) KHÔNG được đổi trừ khi một việc nói rõ là đổi:**
- Bộ seed 48 tấm: giá vốn **16.281.950 đ**, giá bán **26.865.218 đ** (hệ số k = 1.65), biên lợi nhuận hiển thị **39,4%**, tiền ván **11.140.000 đ**, tổng **18,5 tấm** (17mm: 14,0 tấm; 6mm: 4,5 tấm).
- Số test hiện có: 18 test pass. Số test chỉ được tăng, không giảm.

Nếu việc nào làm đổi số vàng ngoài ý muốn thì đó là lỗi: dừng, tìm nguyên nhân, sửa.

---

## 4. Hiện trạng (nguồn sự thật, trích từ các báo cáo đã duyệt)

**Sản phẩm:** SaaS công khai cho xưởng nội thất. Nhập cutlist → bóc tách → giá vốn → BOM xưởng + báo giá khách A4. Stack: Next.js 16 (App Router), TypeScript, Supabase (PostgreSQL + RLS). Sản phẩm thật sẽ public, xử lý dữ liệu cá nhân và tiền.

**Đã xong và đã duyệt:**
- Dọn legacy V1, một engine duy nhất, mặc định markup k = 1.65. Hàm biên lợi nhuận = (k − 1) / k, có test cho k ≤ 0 và 0 < k < 1.
- Gộp "ốc cam + vật tư phụ" thành một khoản (mặc định tạm 15.000 đ/tấm), `WorkshopCostConfig` được chụp vào snapshot dự án.
- Thuật ngữ UI gom vào `src/core/constants/terms.ts`.
- Seed khớp engine, test khóa số. CI mẫu `.github/workflows/ci.yml`. `docs/BACKLOG.md` đã xếp P0/P1/P2.
- Nhãn "Ước tính theo cấu hình xưởng" cho bản lề, ray trên BOM và Excel.
- Zod validator `cost-config-validator.ts`; `saveProfile`/`saveProject` trả `{ success, error }`; `saveProfile` đã đổi sang `.update()`.
- Repo GitHub private `NOI-THAT-PRO`; `.env.local` chưa từng nằm trong lịch sử git.

**Supabase thử nghiệm (chỉ dữ liệu thử, không cần giữ):**
- RLS bật ở cả 5 bảng: `feature_leads`, `materials_library`, `profiles`, `project_items`, `projects`.
- `profiles`: `authenticated` chỉ có UPDATE theo cột trên `address, bank_info, company_name, logo_url, phone, quote_terms, updated_at`. Không có INSERT. `anon` không có quyền ghi. Người dùng không tự đổi được `subscription_tier`, `email`, `id`.
- Cột thật của `profiles`: id, company_name, logo_url, phone, address, subscription_tier, updated_at, email, quote_terms, bank_info.
- Cột thật của `projects`: id, user_id, project_name, client_name, client_phone, status, profit_margin (default 1.25, sai so với code 1.65), total_cost, total_quote, created_at, materials_snapshot, rounding_step, discount_amount, notes.
- Chưa có trên DB: `profiles.cost_config`, `projects.cost_config_snapshot`, `projects.calc_version`, `projects.client_address`. Vì vậy "Lưu Cloud" đang báo lỗi thật (đúng) cho tới khi migration được chạy.

**Chưa làm / còn dở:**
- Migration `20261025131700_add_cost_config_and_calc_version.sql` hiện là **bản trước khi sửa**, chưa chạy lên Supabase: chưa có trigger `handle_new_user`, chưa backfill, khối GRANT đang bị bọc `DO ... EXCEPTION WHEN OTHERS THEN NULL` (nuốt lỗi), CHECK còn lọt JSON null/chuỗi, chưa có trần cho khóa mới và kích thước JSON.
- Định mức keo, ngưỡng bản lề chưa nối vào engine. `keo hạt chưa được tính vào giá`.
- Hao hụt mặc định cần khớp tài liệu sản phẩm: ván 17mm 1.15, ván hậu 6mm 1.12, ván Jumbo 1.18.
- CI chạy Node 22, máy dev chạy Node 24.
- Audit sẵn sàng ra mắt, tổ chức/RLS, các mục P0, Bước 4, Bước 5 chưa làm.

---

## 5. Rules bắt buộc (đưa vào `GEMINI.md` hoặc `.agent/rules/`)

Nếu Rules hiện tại chưa có đủ các điều dưới đây (11 điều gốc và R12-R16 ở cuối mục này), cập nhật trong việc A7.

1. Làm theo mục 1 (cổng) và mục 2 (vòng tự kiểm). Khi mơ hồ hoặc có rủi ro mất dữ liệu/tiền: hỏi.
2. Mọi phép tính tiền/diện tích/mét chỉ ở `src/core/calculations/`. Một engine duy nhất. Mọi đơn giá cấu hình được, không gán cứng.
3. Database chỉ qua migration trong `supabase/migrations/` (tên `YYYYMMDDHHMMSS_ten.sql`, 14 chữ số, có rollback, không trùng version, lưu UTF-8). KHÔNG chạy lên DB thật. Luôn bật RLS, vai trò `authenticated`, dùng `(select auth.uid())`.
4. Bảo mật: không đưa service role key/bí mật vào code, log, `NEXT_PUBLIC_*`; không in nội dung `.env*`; mọi API route phải xác thực, kiểm tra input bằng schema, giới hạn kích thước và tần suất; không nuốt lỗi; không log dữ liệu cá nhân (tên, SĐT, địa chỉ khách).
5. Mỗi thay đổi logic tính toán kèm unit test; mỗi thay đổi RLS kèm test RLS (SQL mô tả).
6. Giao diện tiếng Việt, thuật ngữ thân thiện, import từ `terms.ts`.
7. Mỗi việc một commit; cuối mỗi việc chạy VERIFY rồi báo cáo kèm output lệnh.
8. Không thêm thư viện mới, không đổi cấu trúc khi chưa hỏi (G4).
9. Từ khi có khách thật lưu dự án đầu tiên: đổi công thức phải tăng `calc_version` và giữ engine bản cũ.
10. Báo cáo theo mẫu: [việc] → đã làm gì → bằng chứng (lệnh + output) → còn tồn đọng. Không tuyên bố "100%" khi chưa có bằng chứng.
11. Số liệu trong báo cáo phải trích từ output lệnh vừa chạy; không tự tính nhẩm. Nếu ước tính thì ghi rõ.
12. Không phá Snapshot Pricing: dự án đã lưu mở lại phải ra đúng số cũ. Muốn số mới thì tạo bản mới hoặc nâng cấp có xem trước mức chênh, không đổi âm thầm.
13. Từ ngày có khách thật: mọi thay đổi database là migration có thứ tự, kiểm thử trên bản preview rồi mới lên prod, không sửa thẳng trên giao diện Supabase. Mỗi lần ra bản mới có changelog (`CHANGELOG.md`) và cách quay lại bản trước.
14. Tổng quát trước, cụ thể sau: KHÔNG thêm khóa cấu hình, cột DB, ô UI hay nhánh engine riêng cho một loại vật tư/phụ kiện/nhân công. Mọi khoản chi phí phát sinh là một dòng chi phí (dữ liệu) trong mô hình chung ở A+. Thấy mình sắp viết `if (item === 'ban le')` hoặc thêm trường kiểu `xxxPerSheet` thì dừng, dùng hoặc mở rộng mô hình chung (mở rộng mô hình thì hỏi G4).
15. Không bịa số: mọi đơn giá, định mức, hao hụt mặc định do agent đặt phải bằng 0/rỗng, hoặc gắn nhãn "mặc định tham khảo, hãy nhập số thực tế của xưởng". Con số dùng trong test phải là số GIẢ đặt tên rõ, không giả làm số thật của xưởng.
16. Mỗi loại quy tắc số lượng (`kind`) và mỗi loại hình dự án (có cutlist, theo m², dòng nhập tay...) có ít nhất một golden test riêng cùng ca biên.

---

# GIAI ĐOẠN A: Hoàn tất đợt sửa đang dở (Nền tảng tính giá)

Đây là đợt sửa Claude đã yêu cầu ở lượt trước nhưng chưa có báo cáo. Mỗi mục A1-A9 là một commit.

### A1. `saveProfile` / `saveProject`: lỗi trúng 0 dòng
- Dùng `.update(...).eq(...).select('id')`. Nếu mảng trả về rỗng thì trả `{ success:false, error: "<thông báo tiếng Việt rõ>" }`. Trường hợp thiếu hàng `profiles`: nói rõ "Hồ sơ chưa được tạo".
- Thông báo UI phải phân biệt: "Đã lưu lên Cloud" và "Đã lưu tạm trên máy, chưa lên Cloud".
- Test (mô phỏng Supabase): trả lỗi; trả 0 dòng; thành công. UI hiện đúng thông báo ở từng ca.
- **Tự kiểm:** `npm test` có thêm ≥ 3 test mới, pass. `git grep` không còn nơi nào chỉ `console.error` rồi báo "thành công".

### A2. Viết lại MỘT file migration `20261025131700_add_cost_config_and_calc_version.sql`
Gộp mọi thứ vào một file (kiểm tra `supabase/migrations/` không có hai file cùng tiền tố 14 chữ số). Lưu UTF-8. Có phần DOWN (rollback). Thứ tự: **thêm cột → backfill → trigger → ràng buộc → quyền**. Chạy lại nhiều lần không lỗi (`IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS`, `CREATE OR REPLACE`).

Nội dung bắt buộc:
1. Cột: `profiles.cost_config jsonb`, `projects.cost_config_snapshot jsonb`, `projects.calc_version int not null default 1` (comment "1 = công thức hiện tại"), `projects.client_address text`.
2. **Backfill** tài khoản đã có: `INSERT INTO public.profiles (id, email) SELECT id, email FROM auth.users ON CONFLICT (id) DO NOTHING;` Kiểm tra `profiles.email` có cho NULL không (đăng ký bằng SĐT có thể không có email) và nêu cách xử lý.
3. **Trigger** `handle_new_user` (security definer, `set search_path = ''`, `ON CONFLICT (id) DO NOTHING`) trên `auth.users`. Phác thảo:
   ```sql
   create or replace function public.handle_new_user() returns trigger
   language plpgsql security definer set search_path = '' as $$
   begin
     insert into public.profiles (id, email) values (new.id, new.email)
     on conflict (id) do nothing;
     return new;
   end $$;
   ```
   Thu hồi EXECUTE của hàm khỏi `public/anon/authenticated`. Lưu ý trong báo cáo: **trigger lỗi sẽ chặn đăng ký**, nên mô tả cách kiểm thử đăng ký tài khoản mới sau khi chạy.
4. **CHECK** cho `cost_config` VÀ `cost_config_snapshot`, dùng chung MỘT hàm `IMMUTABLE` (vd. `public.is_valid_cost_config(jsonb)`), dùng `CASE` để không phụ thuộc thứ tự đánh giá `AND`:
   - NULL cả cột: hợp lệ (dùng mặc định). Không phải object: từ chối.
   - `octet_length(cfg::text) <= 4096`.
   - Mỗi khóa số: nếu có thì `jsonb_typeof(cfg->key) = 'number'` (loại JSON null và chuỗi như `"15000"`), rồi mới ép `::numeric` và kiểm `0 <= giá trị <= trần`. Mẫu hàm phụ:
     ```sql
     create or replace function public._cc_num_ok(cfg jsonb, k text, maxv numeric)
     returns boolean language sql immutable as $$
       select case
         when not (cfg ? k) then true
         when jsonb_typeof(cfg->k) <> 'number' then false
         else (cfg->>k)::numeric between 0 and maxv end $$;
     ```
   - Trần đã duyệt: `suppliesRatePerSheet <= 500000`, `laborRatePerSheet <= 1000000`, `hingesPerSheet <= 20`, `slidesPerSheet <= 10`.
   - **v3:** KHÔNG thêm khóa riêng cho keo, bản lề hay vật tư nào khác vào CHECK (Rule 14). Hai thứ này sẽ là dòng chi phí trong mô hình chung ở A+ (AX4). Ở A2 chỉ cần viết sao cho dễ thay: tách hàm kiểm khóa số cũ khỏi phần kiểm cấu trúc chung; trần kích thước JSON sẽ chốt lại ở AX2. Phần khóa mới `glueRatePerMd`, `glueUnitPrice`, `hingeThresholds` bị hoãn sang A+.
5. **GRANT viết thẳng, không bọc `DO`:**
   ```sql
   GRANT UPDATE (company_name, logo_url, phone, address, quote_terms, bank_info, cost_config, updated_at)
   ON public.profiles TO authenticated;
   ```
   Tuyệt đối không cấp cho `subscription_tier`, `email`, `id`. Nếu GRANT lỗi, migration phải thất bại rõ ràng.
6. **DOWN:** gồm `REVOKE UPDATE (cost_config) ON public.profiles FROM authenticated;`, drop trigger/hàm/ràng buộc/cột theo thứ tự ngược.
7. **Bộ ca SQL kiểm thử (viết thành file mô tả trong `supabase/tests/`, KHÔNG chạy):** hợp lệ; NULL cả cột; thiếu khóa; giá trị JSON null; giá trị chuỗi; âm; vượt trần; mảng quá dài; JSON quá lớn; đăng ký tài khoản mới có tạo profile; tài khoản đã có được backfill.
8. Kiểm tra tiếng Việt trong comment hiển thị đúng: `Get-Content -Raw -Encoding UTF8 "supabase\migrations\20261025131700_add_cost_config_and_calc_version.sql"`. Nếu vỡ chữ thì lưu lại UTF-8 (không BOM gây lỗi) rồi đọc lại.
9. Dán **toàn bộ nội dung file** vào báo cáo (không tóm tắt), kèm kết quả đọc lại ở bước 8.

**Tự kiểm:** `git ls-files supabase/migrations` không trùng tiền tố; file không còn chuỗi `EXCEPTION WHEN OTHERS`; `git grep -n "EXCEPTION WHEN OTHERS" -- supabase` rỗng; có chứa `GRANT UPDATE` nằm ngoài khối `DO`.

### A3. Cấu hình phải có tác dụng thật

> **v3:** ở A3 CHỈ làm: (a) ẩn khỏi UI mọi ô cấu hình chưa có tác dụng thật; (b) test xác nhận số vàng không đổi. Các gạch đầu dòng về keo và `hingeThresholds` bên dưới được THỰC HIỆN Ở AX4 theo mô hình chung, không viết ô/khóa riêng ở đây (Rule 14).

- Nối `glueRatePerMd` × `glueUnitPrice` vào engine: chi phí keo = tổng mét chỉ dán × định mức × đơn giá. **Mặc định 0 / rỗng, kèm nhãn "hãy nhập số thực tế của xưởng".** Không dùng số 0,02 kg/md hay đơn giá 180.000/80.000 (không có nguồn).
- Dòng "Keo dán cạnh" trên BOM chỉ hiện khi giá trị > 0.
- `hingeThresholds` chưa dùng ở engine: ẩn khỏi form nhập, hoặc ghi rõ "chưa áp dụng". Quy tắc: mọi ô cấu hình hiển thị trên UI phải có tác dụng thật.
- Test: keo = 0 thì seed vẫn 16.281.950 / 26.865.218; keo > 0 thì giá vốn tăng đúng bằng phép tính tay trong test; keo âm/vượt trần bị Zod chặn.
- **Tự kiểm:** `npm test` xanh, test seed không đổi số vàng.

### A4. Hao hụt mặc định theo tài liệu sản phẩm
- Ván 17mm = 1.15, ván hậu 6mm = 1.12, ván Jumbo = 1.18. Tất cả chỉnh được theo xưởng, gắn nhãn "mặc định tham khảo, hãy nhập số thực tế".
- Cập nhật seed cho khớp. Chạy `calculateProject` trên `SEED_PARTS`, dán output từng mã ván: diện tích net, hệ số, gross, số tấm trước/sau làm tròn, đơn giá (dán dòng khai báo trong `SEED_MATERIALS`), thành tiền. Nêu rõ tổng giá ván/giá vốn/giá bán có đổi hay không.
- Dự kiến của Claude (ước tính, phải được output thật xác nhận): ván 6mm = 11,606 × 1,12 ÷ 2,9768 ≈ 4,367 nên vẫn làm tròn 4,5 tấm. Nếu output thật khác, báo đúng số thật và cập nhật số vàng ở mục 3 bằng một commit riêng có giải thích.
- Ghi rõ trong báo cáo báo cáo nào trước đây KHÔNG lấy từ kết quả chạy thật (giá ván 6mm từng bị ghi 320.000 và 360.000): xác nhận giá hiện hành từ `SEED_MATERIALS`.

### A5. CI cùng phiên bản Node với máy dev
- Dùng Node 24 (hoặc ghi `engines` + `.nvmrc` nhất quán). Nêu phiên bản ở cả hai nơi trong báo cáo.
- Bước build dùng biến môi trường GIẢ: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` dạng placeholder. Tuyệt đối không dùng secrets thật.
- Mô phỏng CI tại máy: `npm ci`, `npm run lint`, `npm test`, `npm run build` với biến giả. Ghi output.
- Nếu máy có `gh` CLI: `gh run list --limit 3`. Nếu không, ghi "cần người xem tab Actions".

### A6. Đồng bộ BACKLOG
- Ghi vào `docs/BACKLOG.md`: DB `profit_margin default 1.25` cần bỏ (hoặc đặt 1.65) ở migration nền; `client_address` cần cột ở migration nền.

### A7. Rules
- Thêm Rule 11-16 và cập nhật Rules theo mục 5 vào `GEMINI.md` / `.agent/rules/` và README.

### A8. Bộ test lõi tính toán (golden + ca biên)
- `npm test` phải chạy mọi `*.test.ts` trong `src` (không chỉ một file). Tách test theo module: profit, engine, seed, cost-config.
- Viết/bổ sung unit test cho `board-calculator`, `edge-calculator`, `quote-engine` với các ca: tấm 2,9768 m² (1,22 x 2,44); hệ số hao hụt 1,15 / 1,12 / 1,18; chỉ dán hao hụt 8%; tấm không dán cạnh; số lượng lớn; làm tròn tiền (`rounding_step`). Dùng bộ seed 48 tấm làm ca chuẩn (golden).
- Báo cáo độ phủ test của `src/core/calculations` (dán output lệnh).
- **Tự kiểm:** số test tăng so với 18, tất cả pass, số vàng không đổi. Không sửa số kỳ vọng để cho khớp.

### A9. Tổng kiểm A
- Chạy VERIFY đầy đủ, in số test, số vàng. Cập nhật `AGENT_PROGRESS.md`. Không có cổng ở giai đoạn này: chuyển sang Giai đoạn A+ nếu xanh (cổng G4 nằm ở AX2).

---

# GIAI ĐOẠN A+ (v3): Tổng quát hóa mô hình chi phí

**Vì sao có giai đoạn này.** Các bản trước đi theo lối "thiếu gì thì thêm một ô cho đúng thứ đó": số bản lề mỗi tấm, số ray mỗi tấm, ô keo, hằng số ốc cam... Mỗi vật tư mới sẽ đòi thêm một khóa cấu hình, một ràng buộc DB, một ô UI, một nhánh trong engine. Lối này không bao giờ phủ hết nội thất thật (tay nắm, chân tủ, rổ, đèn LED, gương, kính, đá, inox, sơn PU, nhân công lắp đặt, vận chuyển, thiết bị mua ngoài, thầu phụ...) và làm engine, DB, UI phình theo từng thứ.

**Nguyên tắc.** Engine không được biết "bản lề" hay "ván" là gì. Nó chỉ biết **dòng chi phí** (cost line): danh mục + quy tắc số lượng + đơn giá + hao hụt + nhóm + hệ số bán. Ván, cạnh, bản lề, ray, keo, ốc cam, nhân công đều chỉ là DỮ LIỆU cấu hình, sinh ra từ **mẫu xưởng (preset)**. Thêm một loại vật tư mới = thêm dữ liệu, không sửa code, không migration.

**Ràng buộc cứng.**
- Đổi cấu trúc và công thức nên phải qua cổng G4 (AX2).
- Số vàng ở mục 3 KHÔNG đổi: engine mới với cấu hình cũ phải cho đúng 16.281.950 / 26.865.218.
- Chưa có khách thật nên đổi cấu trúc ngay bây giờ còn rẻ. Sau go-live sẽ chịu Rule 9 và Rule 12 và rất đau.
- Chưa chạy migration nào lên DB, nên được phép sửa lại file migration A2 cho khớp mô hình mới (ghi rõ trong báo cáo).

### AX1. Kiểm kê chỗ "cục bộ" (CHỈ ĐỌC, ghi `docs/reports/AX1.md`)
- Liệt kê file:dòng mọi nơi một loại vật tư/phụ kiện/nhân công có trường, hằng số, ô UI, cột DB hoặc nhánh `if` riêng: engine, types, Zod, form cấu hình, DB (cột, CHECK), seed, BOM, Excel, `terms.ts`.
- Dạng bảng: nơi | loại vật tư | đang cục bộ kiểu gì | sẽ thay bằng gì trong mô hình chung.
- Lệnh gợi ý (dán output): `git grep -niE "hinge|slide|glue|ban le|ray|oc cam|PerSheet|PerMd" -- src supabase`.

### AX2. PLAN mô hình chi phí tổng quát (CỔNG G4: dừng chờ người duyệt)
Viết `docs/PLAN_COST_MODEL.md` trả lời đủ "Đặc tả tham khảo" ở cuối giai đoạn này. Agent được đề xuất khác đặc tả nếu có lý do, phải nêu rõ. PLAN phải có thêm:
1. Cách `legacyConfigToLines` chuyển cấu hình cũ sang dòng chi phí mà số vàng không đổi.
2. Ảnh hưởng tới schema nền (C1): `materials_library` → `catalog_items` đa loại, thêm `project_sections`, `project_lines` hay lưu dòng trong JSON; ưu nhược từng cách.
3. Ảnh hưởng tới snapshot, BOM xưởng, báo giá khách (payload che ở Giai đoạn F), Excel.
4. Kế hoạch chuyển từng bước (mỗi bước VERIFY xanh) và cách quay lại nếu hỏng.
5. Phần để sau (phương án A/B, tùy chọn khách chọn thêm...) nhưng dữ liệu thiết kế hôm nay không được chặn đường.
Trong lúc chờ G4: làm Giai đoạn B (chỉ đọc). C1 chỉ lập PLAN sau khi AX2 được duyệt vì schema phụ thuộc vào nó.

### AX3. Lõi engine tổng quát (sau G4)
- Thư mục `src/core/calculations/cost-lines/`: hàm thuần, không phụ thuộc UI/DB, không `eval`, không đánh giá biểu thức chuỗi do người dùng nhập. Chỉ các `kind` quy tắc định sẵn (xem đặc tả).
- Viết adapter `legacyConfigToLines`. Test so sánh engine cũ và mới trên `SEED_PARTS`: bằng nhau từng dòng và từng tổng TRƯỚC khi xóa engine cũ. Sau đó xóa engine cũ ở commit riêng (Rule 2: một engine duy nhất).
- **Tự kiểm:** số vàng không đổi; số test tăng; `git grep -niE "hinge|slide|glue" -- src/core/calculations/cost-lines` rỗng (engine không chứa tên vật tư cụ thể).

### AX4. Đưa bản lề, ray, keo, ốc cam/vật tư phụ, màng PE... vào mô hình chung
- Mỗi thứ là MỘT dòng chi phí trong preset, dùng quy tắc `tiers`, `perDriver`, `perTaggedPart`... Thay cho các ô riêng ở A3 và H3.
- Mặc định rỗng hoặc 0, nhãn "hãy nhập số thực tế của xưởng" (Rule 15). Dòng chỉ hiện trên BOM/báo giá khi giá trị > 0.
- Test: bật/tắt từng dòng, ca biên của `tiers` (đúng ngưỡng, dưới, trên, rỗng), số vàng không đổi khi mọi dòng mới = 0.

### AX5. Danh mục vật tư tổng quát và UI
- Một danh mục dùng chung mọi loại (tấm, cạnh, phụ kiện, vật tư tiêu hao, bề mặt, đá/kính/inox, thiết bị, nhân công, dịch vụ, mua ngoài). Trường: loại, tên, đơn vị, đơn giá, ngày hiệu lực giá, đã/chưa gồm VAT, quy cách mua (gói), nhà cung cấp, ghi chú, nguồn số (xem đặc tả).
- Thêm vật tư mới trong UI không cần sửa code. Trong một dự án cho thêm dòng tự do (mua ngoài, thầu phụ, nhân công, vận chuyển).
- Mọi chuỗi giao diện qua `terms.ts`; nhập Excel mapping cột để dành cho I2.

### AX6. Nhiều cách nhập và nhiều hạng mục
- Ba chế độ vào một dự án: (1) cutlist chi tiết (hiện có), (2) báo nhanh theo module/mét dài/m², (3) dòng nhập tay. Có thể trộn trong cùng dự án.
- Hạng mục (section) theo phòng hoặc sản phẩm (bếp, tủ áo, vách...). Báo giá khách hiển thị theo hạng mục; tổng và hệ số tính từ các dòng.
- Chế độ (2) và (3) không có cutlist: BOM xưởng có thể thiếu, phải báo rõ thay vì hiện số 0 gây hiểu lầm.
- Giữ luồng 3 bước của Giai đoạn E.

### AX7. Bộ golden đa dạng và test tính chất
Số kỳ vọng tính tay trong test, dùng đơn giá GIẢ đặt tên rõ (vd. `TEST_PRICE_*`), KHÔNG phải số thật của xưởng. Tối thiểu:
- (a) Seed 48 tấm hiện có (số vàng).
- (b) Tủ bếp: tấm + phụ kiện theo bậc chiều cao cánh + mặt đá + thiết bị mua ngoài + lắp đặt.
- (c) Tủ áo: hộc kéo + ray + thanh treo.
- (d) Vách ốp hoặc trần tính theo m², không có cutlist.
- (e) Dự án chỉ gồm dòng nhập tay.
- (f) Có VAT, giảm giá, làm tròn tiền.
- (g) Cấu hình rỗng.
- Test tính chất: tổng các nhóm = tổng toàn; thêm dòng số lượng 0 không đổi tổng; tăng đơn giá không làm giảm giá bán; không ra NaN/Infinity; số lượng âm bị chặn; snapshot lưu rồi mở lại ra đúng số cũ (Rule 12).

### AX8. Tổng kiểm A+
VERIFY đầy đủ, in số test và số vàng, cập nhật `AGENT_PROGRESS.md`, rồi tiếp B/C. Cập nhật A2 hoặc baseline C2 cho khớp mô hình (CHECK chung, không liệt kê khóa theo vật tư).

## Đặc tả tham khảo mô hình chi phí tổng quát (cho AX2)

**1. Dòng chi phí (CostLine).** `id`, `catalogItemId?`, `name`, `category`, `unit`, `unitPrice`, `priceIncludesVat?`, `quantityRule`, `wasteFactor`, `group`, `markupOverride?`, `visibleOnQuote` (hiện trên báo giá khách hay chỉ nội bộ), `source`, `enabled`, `notes`.

**2. Loại gợi ý (mở rộng được bằng dữ liệu):** tấm (MDF, MFC, HDF, ván ép, Jumbo...); cạnh; phụ kiện (bản lề, ray, tay nâng, tay nắm, chân tủ, rổ, bas, thanh treo...); vật tư tiêu hao (ốc, keo, màng PE, nẹp...); bề mặt hoàn thiện (laminate, acrylic, veneer, sơn PU, dán film...); vật liệu mặt (đá, kính, inox, nhôm kính, gương...); thiết bị và điện (đèn LED, nguồn, bếp, hút mùi, chậu vòi...); nhân công (cắt, dán cạnh, lắp ráp, sơn, lắp đặt); dịch vụ (thiết kế, vận chuyển, giám sát, bảo hành); mua ngoài/thầu phụ; khác.

**3. Quy tắc số lượng (`quantityRule.kind`, danh sách đóng, có test từng loại):**

| kind | Ý nghĩa | Ví dụ loại việc (không có số) |
|---|---|---|
| `fixed` | số lượng cố định mỗi dự án/hạng mục | một chuyến vận chuyển |
| `perDriver` | số lượng = driver × định mức | keo theo mét chỉ dán; ốc theo tấm |
| `tiers` | bậc theo giá trị driver | số bản lề theo chiều cao cánh |
| `perTaggedPart` | đếm chi tiết có nhãn × định mức | tay nắm theo cánh; ray theo hộc kéo |
| `percentOfGroup` | % của tổng một nhóm khác | vật tư phụ theo % ván |
| `manual` | người nhập số lượng | thiết bị mua ngoài |

**4. Driver** (biến lấy từ dự án): số tấm theo mã ván, diện tích net, mét chỉ dán theo loại cạnh, số chi tiết theo nhãn (cánh, hộc kéo, hông, đợt, hậu...), số module, chiều dài tủ (mét dài), diện tích mặt đứng, số công, số chuyến. Nhãn chi tiết đến từ nguồn nhập (AutoCAD/SketchUp) hoặc luật gán nhãn cấu hình được, và cho sửa tay. Quy tắc dựa trên nhãn do đoán thì gắn nhãn "Ước tính" và cho ghi đè theo dự án. KHÔNG đoán âm thầm.

**5. Nhóm và hệ số bán.** Mỗi dòng thuộc một nhóm; hệ số bán theo nhóm, mặc định mọi nhóm = k hiện tại (1,65) để giữ số vàng. Biên lợi nhuận tổng = (bán − vốn) / bán tính từ tổng; khi mọi nhóm cùng k thì ra đúng (k − 1) / k. Phụ phí chi phí chung (mặc định 0), VAT (mặc định tắt, hiển thị rõ "chưa/đã gồm VAT"), giảm giá, làm tròn (`rounding_step`).

**6. Hao hụt theo dòng**, không chỉ theo ván.

**7. Quy cách mua.** `packSize` (vd. mua theo gói) và chế độ `consumed` (tính theo lượng dùng) hoặc `purchased` (làm tròn lên gói). Nhãn rõ chế độ nào đang dùng.

**8. Nguồn số (`source`):** `default_reference` (mặc định tham khảo), `workshop_entered` (xưởng nhập), `project_override` (ghi đè theo dự án). UI hiển thị nhãn tương ứng.

**9. Snapshot (Rule 12).** Snapshot dự án chụp: các dòng, đơn giá, quy tắc, hệ số, `calc_version`. Sửa danh mục sau này không đổi dự án cũ.

**10. Preset xưởng.** Vài mẫu chỉ có CẤU TRÚC, không có giá: xưởng ván công nghiệp, xưởng gỗ tự nhiên/sơn PU, thầu thi công trọn gói. Người dùng chọn preset rồi nhập giá của mình.

**11. Kiểm tra dữ liệu.** Zod kiểm cấu trúc đầy đủ. DB chỉ kiểm cấu trúc chung (là object, có `schemaVersion`, số dòng tối đa, kích thước, số không âm có trần), KHÔNG liệt kê khóa theo từng vật tư.

**12. An toàn.** Không công thức tự do do người dùng gõ; mọi tính toán đi qua các `kind` đã định sẵn.

---

# GIAI ĐOẠN B: Audit sẵn sàng ra mắt (CHỈ ĐỌC)

**Không sửa code, không chạy DB.** Ghi kết quả vào `docs/AUDIT_REPORT.md`. Dữ liệu đầu vào đã có: RLS cả 5 bảng = true; quyền cột `profiles` như mục 4. `supabase/migrations/` có thể không phản ánh DB thật (bảng có thể tạo thủ công).

Mỗi mục: **trạng thái** (ĐẠT / THIẾU / RỦI RO), **bằng chứng** (file:dòng hoặc output lệnh), **mức độ** (CHẶN RA MẮT / CAO / TRUNG BÌNH / THẤP), **đề xuất sửa nhỏ nhất**.

1. Bí mật và cấu hình: liệt kê tên biến môi trường (KHÔNG in giá trị), cái nào có `NEXT_PUBLIC_`; service role key có được import ở code chạy ở client không; `.env*` có bị git track không.
2. Auth: đăng ký/đăng nhập (email, SĐT, OAuth), xác nhận email, đặt lại mật khẩu; `middleware.ts` bảo vệ route nào; route app nào vào được khi chưa đăng nhập.
3. API routes `/api/license/verify`, `/api/projects/direct-ingest`, `/api/webhooks/payment`: xác thực, kiểm tra input, giới hạn tần suất/kích thước, chữ ký webhook, chống xử lý trùng, bảng đọc/ghi, có dùng service role không, có log dữ liệu cá nhân không.
4. RLS và schema: đối chiếu migrations với schema thực; `project_items` chưa kiểm tra project cha; `feature_leads` không có trong migrations; cột code ghi mà DB không có; `profit_margin` default 1.25 (DB) so với 1.65 (code).
5. Tính tiền: đơn giá còn gán cứng (file:dòng), độ phủ test của `src/core/calculations`, rủi ro làm tròn. Kiểm tra thêm: Dashboard đang lấy `total_cost` từ DB còn trang chi tiết lấy từ engine, hai nơi có thể ra hai số khác nhau. Nêu rõ nơi nào dùng số nào và đề xuất chốt MỘT nguồn.
6. Lỗi và giám sát: chỗ nuốt lỗi (catch rỗng), error boundary, logging/Sentry, dữ liệu cá nhân bị log.
7. Phụ thuộc và build: `npm audit` (nếu mạng bị chặn thì nói rõ), 27 dependency chưa dùng, ESLint thật (hiện lint = tsc), security headers trong `next.config`.
8. Pháp lý và dữ liệu cá nhân: trang Điều khoản/Chính sách quyền riêng tư; xóa tài khoản/xuất dữ liệu; liệt kê trường dữ liệu cá nhân được thu thập (trường + bảng).
9. Hiệu năng và điện thoại: kích thước bundle `/quoting`, thư viện `xlsx` tải ở đâu và có nên tải trễ không, trang nào vỡ ở 375px (nếu chạy được).
10. Môi trường và triển khai: dev/staging/prod, CI, chiến lược migration, sao lưu/phục hồi.
11. License/plugin: schema thực tế không có bảng `plugins`/`orders`. Route license đang lưu trạng thái ở đâu, hay mới là khung chưa nối? Nói rõ.

Kết thúc bằng **bảng tổng hợp xếp theo mức độ** và **thứ tự sửa tối đa 10 việc đầu** (mỗi việc một commit nhỏ).

**CỔNG G1:** dừng, chờ người duyệt thứ tự. Trong lúc chờ có thể làm việc Giai đoạn C1 (chỉ lập PLAN).

---

# GIAI ĐOẠN C: Schema nền, tổ chức (nhiều thành viên) và RLS

Quyết định đã có: Supabase hiện chỉ có dữ liệu thử nên **không cần giữ hay migrate dữ liệu cũ**. Làm migration nền sạch (baseline) thay cho việc vá chồng migration. Chỉ viết file, KHÔNG chạy DB thật. Làm trước khi có khách thật vì sau đó rất đau.

### C1. PLAN (xong thì CỔNG G2, dừng chờ duyệt rồi mới viết SQL)
PLAN phải có:
1. Sơ đồ bảng: `organizations`, `org_members` (role: `owner | sales | viewer`), `profiles` (chỉ hồ sơ), `subscriptions` (client chỉ SELECT; ghi qua service role/webhook), `materials_library` (+`org_id`; theo kết quả AX2 sẽ đổi thành `catalog_items` đa loại và thêm `project_sections`, `project_lines` hoặc tương đương), `projects` (+`org_id`, `calc_version`, `cost_config_snapshot`, `parent_project_id`, `version_no`, `client_address`, `updated_at`), `project_items`, `feature_leads`, `project_audit_log`. Mỗi user mới tự có một org riêng với vai trò owner (xử lý trong trigger đăng ký của A2/C2).
2. RLS (vai trò `authenticated`, dùng `(select auth.uid())`): thành viên đọc theo `org_id`; owner/sales được ghi; viewer chỉ xem BOM; `project_items` kiểm tra dự án cha cùng org; `feature_leads`: INSERT khi `user_id IS NULL OR user_id = (select auth.uid())`, client không SELECT.
3. `profiles`: GRANT UPDATE theo cột (company_name, logo_url, phone, address, quote_terms, bank_info, cost_config); không sửa được `subscription`/`email`/`id`.
4. Ràng buộc: CHECK `status` theo danh sách giá trị code đang dùng (agent tự liệt kê enum thật từ code, không giả định `approved | finalized`); `profit_margin > 0` (bỏ default 1.25 hoặc đặt 1.65); giới hạn độ dài text.
5. Trigger `updated_at`; index cho `org_id`, `project_id`.
6. Cách người tự reset DB thử nghiệm và chạy migration nền (hướng dẫn từng bước, không tự động).
7. Thay đổi code cần làm theo (`storageService`, auth, màn hình mời thành viên) và rủi ro.
8. Kế hoạch test RLS (SQL mô tả) cho 6 tình huống: người dùng A không đọc/ghi dữ liệu của B; người ngoài org bị chặn; viewer không ghi; không tự nâng gói cước; `anon` không đọc `feature_leads`; không chèn `project_items` vào dự án người khác.
   Ngoài ra kiểm thử đủ 4 vai trò: owner, sales, viewer, người ngoài org. Chứng minh người ngoài org không đọc được dữ liệu.

### C2. Sau khi được duyệt: viết migration nền + test RLS + hướng dẫn
- Migration nền (một hoặc vài file timestamp 14 chữ số), có DOWN. Hợp nhất nội dung A2 vào baseline (không để hai nguồn mâu thuẫn).
- `supabase/tests/rls_*.sql`: 6 tình huống ở C1.8, mỗi ca ghi kết quả kỳ vọng.
- `docs/DB_RESET.md`: các bước người tự reset DB thử nghiệm và chạy migration (G3).
- **Tự kiểm (không cần DB):** mọi bảng có `enable row level security`; không có policy `using (true)` ngoại trừ ghi chú; chạy `git grep -n "to public" -- supabase` phải rỗng (chỉ `authenticated`); không `security definer` thiếu `set search_path`.

### C3. Đổi code theo schema mới
- `storageService`, auth, màn hình mời thành viên (nhập email, chọn vai trò).
- Lưu trữ: **Cloud là nguồn chuẩn; LocalStorage chỉ là cache/offline và dữ liệu demo.** Thêm luồng "Lưu demo vào tài khoản" khi khách demo đăng nhập/đăng ký. Chống ghi đè khi sửa trên 2 thiết bị bằng `updated_at`/`version`; nếu xung đột thì báo người dùng chọn giữ bản nào.
- Test cho các luồng trên (mô phỏng Supabase). VERIFY xanh.

---

# GIAI ĐOẠN D: Sửa các mục CHẶN RA MẮT (P0)

Lấy thứ tự từ `AUDIT_REPORT.md` đã duyệt ở G1. Mỗi mục là một commit. Nếu audit và danh sách dưới đây khác nhau thì audit thắng, nhưng không được bỏ sót mục nào dưới đây:

- **D1.** RLS `profiles` chặn tự đổi `subscription_tier` (đã có trong baseline C2; xác nhận bằng test RLS).
- **D2.** Bảo mật 3 API route: xác thực; kiểm tra input bằng schema (Zod đã có sẵn trong dự án); giới hạn kích thước body; giới hạn tần suất (nếu cần thư viện mới thì G4 hỏi người); không log dữ liệu cá nhân; không dùng service role khi không cần.
- **D3.** Webhook thanh toán: xác thực chữ ký (HMAC) và chống xử lý trùng (idempotency, vd. bảng `payment_events` có khóa duy nhất theo event id, migration riêng). Thiết kế cuối cùng phụ thuộc cách thu tiền (xem mục 8: người chưa trả lời VietQR tự động hay thủ công). Nếu chưa biết: dựng khung an toàn, từ chối mọi request không có chữ ký hợp lệ, ghi blocker.
- **D4.** Security headers trong `next.config` (CSP, X-Frame-Options, Referrer-Policy, v.v.). Kiểm tra app vẫn chạy được (`npm run build` + mở thử).
- **D5.** Trang Điều khoản dịch vụ và Chính sách quyền riêng tư (bản nháp). Nêu: xưởng là bên kiểm soát dữ liệu khách của họ, nền tảng là bên xử lý. **Đây là bản nháp, người phải tra luật hiện hành (Nghị định 13/2023 và Luật Bảo vệ dữ liệu cá nhân có hiệu lực 2026, chưa được xác minh trong tài liệu này) hoặc hỏi luật sư trước khi public.** Ghi rõ dòng cảnh báo này trong `AGENT_PROGRESS.md`.
- **D6.** Xóa tài khoản và xuất dữ liệu (Excel/JSON), có xác nhận hai bước, xóa theo cascade đúng org.
- **D7.** Giám sát lỗi: cấu hình để KHÔNG gửi dữ liệu cá nhân. Nếu cần Sentry/thư viện mới thì G4.
- **D8.** ESLint thật (hiện lint = tsc), error boundary toàn app, loại bỏ catch rỗng. Dependency chưa dùng (27): CHỈ lập danh sách ở giai đoạn này, KHÔNG gỡ (Bước 4 có thể cần `@radix-ui/react-slider`, `sonner`, `clsx`). Việc gỡ làm ở E9.
- **D9.** Tài liệu sao lưu/phục hồi và tách môi trường (`docs/OPERATIONS.md`): dev/staging/prod, cách phục hồi, ai làm gì. Việc bật/test sao lưu thật là của người (mục 8).

- **D10.** Làm cứng Supabase Auth (chỉ phần agent làm được trong code và tài liệu):
  - Rà `middleware.ts` và các luồng đăng ký/đăng nhập/đặt lại mật khẩu: URL chuyển hướng lấy từ biến cấu hình, không gán cứng; thông báo lỗi chung, không lộ tài khoản có tồn tại hay không.
  - Viết `docs/AUTH_SETUP.md` hướng dẫn từng bước cho người (G3): bật xác nhận email; đặt lại mật khẩu; danh sách URL chuyển hướng cho phép (preview và production); giới hạn tần suất đăng nhập; chống mật khẩu yếu/bị lộ nếu gói hỗ trợ; captcha cho đăng ký nếu bị spam.
  - Đăng nhập bằng số điện thoại: nêu rủi ro SMS tốn tiền và dễ bị lạm dụng, đề xuất tắt hoặc giới hạn + captcha, để người quyết định.
  - Agent KHÔNG tự chỉnh Supabase thật.

**Tự kiểm D:** từng mục có test hoặc quét `git grep` chứng minh (vd. route không có token trả 401; body quá lớn trả 413; chữ ký sai trả 401/400; event trùng không xử lý hai lần).

---

# GIAI ĐOẠN E: Bước 4 — Luồng 3 bước và Chế độ nâng cao

Yêu cầu đã duyệt:
- Luồng `/quoting` hiển thị 3 bước rõ ràng: **Nhập → Xem báo giá → Xuất**. Phễu lọc 6 tiêu chí và tính năng v2/hợp đồng đưa vào "Chế độ nâng cao" (mặc định tắt, nhớ lựa chọn của người dùng). Đọc `localStorage` trong `useEffect`, không đọc lúc render (tránh lỗi hydration).
- Nhận diện bản v2 bằng **trường dữ liệu rõ ràng** (`version_no` hoặc `parent_project_id`), KHÔNG dùng `projectName.includes("(v")`. Dán enum `status` thực tế trong code vào báo cáo.
- Dự án có v2 hoặc đã khóa hợp đồng: luôn hiện các tính năng đó bất kể công tắc.
- Badge "Đang dùng cấu hình tùy chỉnh": dựa trên việc cấu hình khác mặc định, kể cả khi mở dự án đã lưu có cấu hình tùy chỉnh (không chỉ khi vừa chỉnh trong phiên).
- Khi Chế độ nâng cao tắt mà có bộ lọc đang hoạt động: hiện nhãn "Đang lọc N tiêu chí" kèm nút xóa lọc. Có test chứng minh **bộ lọc chỉ ảnh hưởng hiển thị, không ảnh hưởng giá**.
- Stepper phải xử lý: bước 2 khi chưa có dữ liệu; nút Back của trình duyệt; màn hình điện thoại (375px); khi in A4 thì ẩn stepper.
- "Lãi trên giá vốn" và "Biên lợi nhuận" chỉ ở màn hình nội bộ, KHÔNG xuất hiện trên bản A4 hay trang khách.
- HelpTooltip dùng được bằng chạm trên mobile, bằng phím (focus), có `aria-label`.
- Mở dự án đã lưu phải ra đúng số tiền trước đó (so với số vàng/snapshot).
- **E9 (cuối giai đoạn E).** Sau khi Bước 4 xong và VERIFY xanh: gỡ dependency chưa dùng (danh sách từ D8), từng nhóm nhỏ một commit, mỗi nhóm VERIFY xanh. Giữ lại gói Bước 4 thực sự dùng.

**Tự kiểm E:** VERIFY xanh; test cho lọc-không-đổi-giá, nhận diện v2, badge cấu hình; `git grep -n 'includes("(v"' -- src` rỗng; chụp màn hình/mô tả kiểm tra tay nếu agent chạy được `npm run dev`, nếu không thì liệt kê "cần người kiểm tra tay" các mục 375px và in A4.

---

# GIAI ĐOẠN F: Bước 5 — Chia sẻ báo giá bằng link

Đây là thiết kế ưu tiên bảo mật; có bảng DB nên theo quy tắc migration riêng, KHÔNG chạy DB thật. Lập PLAN ngắn trước (không phải cổng, nhưng phải ghi vào báo cáo), rồi làm.

- Không dùng `[id]` dự án làm đường dẫn. Dùng `share_token` ngẫu nhiên, đủ dài (≥ 128 bit, vd. 32 byte sinh bằng `crypto.randomBytes`), **lưu riêng**. Đề xuất (của Claude, không bắt buộc): chỉ lưu hash của token trong DB để lộ DB không lộ link.
- Bảng riêng `quote_shares`: token (hoặc hash), org/user, **payload đã che**, version (cố định theo v1/v2, không đổi khi dự án bị sửa sau đó), `expires_at`, `revoked_at`.
- **Che dữ liệu ở server**, không lọc ở client. Đọc qua API route hoặc hàm Postgres security definer chỉ trả đúng payload đã che. KHÔNG mở RLS của `projects` cho người chưa đăng nhập.
- Payload che: không có hao hụt, chi tiết tấm phôi, giá vốn, markup, biên lợi nhuận. Số tài khoản ngân hàng chỉ hiện khi chủ xưởng bật.
- Chủ xưởng thu hồi link và đặt hạn dùng. `noindex` (meta robots và header `X-Robots-Tag`). Giới hạn tần suất truy cập.
- Link chỉ hoạt động với dự án đã lưu Cloud. Dự án demo (LocalStorage) phải yêu cầu đăng nhập trước khi tạo link.
- Nút "Tải PDF" bằng `@media print` và "Copy link xem báo giá". Kiểm tra font tiếng Việt trên Chrome, Safari, điện thoại (ghi "cần người kiểm tra tay" cho phần agent không chạy được).

**Tự kiểm F:** test: token sai/hết hạn/thu hồi trả 404 (không lộ lý do); payload không chứa các trường cấm (test kiểm khóa JSON); tạo link khi chưa đăng nhập bị từ chối; `git grep` cho thấy không có route nào đọc `projects` bằng service role mà không kiểm token.

---

# GIAI ĐOẠN G: Checklist go-live (agent chuẩn bị, người thực hiện)

Agent viết `docs/GO_LIVE.md` gồm bảng trạng thái từng mục (ĐẠT / CHỜ NGƯỜI), kèm lệnh kiểm. Các mục:
1. Project Supabase production riêng (còn trống); chạy migration theo thứ tự trên preview/test trước, rồi mới prod.
2. Quản lý bí mật: biến môi trường ở nơi triển khai; xoay khóa nếu từng lộ.
3. Hosting (Vercel hay nơi khác: **người chưa trả lời**), domain, HTTPS.
4. Cách thu tiền gói cước và webhook (người chưa trả lời).
5. Sao lưu tự động và **thử phục hồi một lần**.
6. Giám sát lỗi và cảnh báo khi webhook thanh toán lỗi; kênh hỗ trợ (Zalo/email).
7. Một người ngoài thử đăng ký, tạo dự án, xuất báo giá trên điện thoại.
8. Chỉ public repo sau khi audit sạch; bật 2FA cho GitHub.
9. Ghi rõ trong sản phẩm: đây là công cụ ước tính, chủ xưởng chịu trách nhiệm kiểm tra trước khi báo giá khách.
10. Supabase Auth đã cấu hình theo `docs/AUTH_SETUP.md` (xác nhận email, đặt lại mật khẩu, URL chuyển hướng, chống dò mật khẩu, captcha nếu cần, SMS).
11. Nhánh chính được bảo vệ: không đẩy thẳng, bắt buộc CI xanh trước khi gộp.
12. Theo dõi uptime và cảnh báo khi webhook thanh toán lỗi.
13. Quy trình ra bản mới: `CHANGELOG.md`, chạy migration trên preview trước prod, cách quay lại bản trước (ghi trong `docs/OPERATIONS.md`).
14. Kiểm tra `npm audit` (hoặc ghi rõ nếu mạng bị chặn) và xử lý lỗ hổng mức cao.

Sau go-live: làm Giai đoạn H (P1) rồi Giai đoạn I (P2), chỉ khi qua cổng G6. Toàn bộ các mục "sau go-live" cũ đã được chuyển vào H và I.

---

# GIAI ĐOẠN H: P1 sau ra mắt (tháng đầu)

Chỉ bắt đầu sau cổng G6. Mỗi mục là một commit (hoặc một PLAN ngắn rồi commit). Mục có đổi database: chỉ viết migration có DOWN, KHÔNG chạy DB thật (G3). Mục cần thư viện mới hoặc đổi cấu trúc: G4.

### H1. Đóng băng dự án khi chốt hợp đồng
- Khi `status` chuyển sang trạng thái đã duyệt (dùng đúng enum thực tế trong code), khóa dự án. Cột đề xuất: `is_locked`, `frozen_at`, `snapshot_totals`.
- Đóng băng CẢ BOM, không chỉ tổng tiền: khóa danh sách tấm (chỉ đọc hoặc lưu hash), `calc_version`, `materials_snapshot`, và tóm tắt BOM (số tấm theo mã ván, mét chỉ, phụ kiện). Nếu chỉ lưu tổng tiền mà cutlist vẫn sửa được thì BOM sẽ lệch số đã chốt.
- Chặn sửa/xóa `project_items` khi dự án đã khóa (RLS hoặc trigger, có test mô tả).
- Bản đã duyệt KHÔNG có nút "Mở khóa" sửa đè. Thay bằng "Tạo bản v2" từ bản đã khóa (dùng `parent_project_id`, `version_no`), bản cũ giữ nguyên. "Mở khóa" chỉ cho bản nháp, ghi nhật ký (ai, khi nào), sau này giới hạn cho chủ xưởng.
- **Tự kiểm:** test: đã khóa thì không sửa được cutlist; tạo v2 không đổi bản cũ; mở bản khóa ra đúng số đã chốt.

### H2. Nhật ký thay đổi (audit log)
- Ghi vào `project_audit_log`: đổi giá, khóa BOM, chuyển trạng thái hợp đồng, mở khóa bản nháp. Có người thực hiện và thời điểm.
- Ghi ở phía server hoặc trigger, client không ghi được. Thành viên org được đọc theo RLS. Không đưa dữ liệu cá nhân của khách vào nội dung log (Rule 4).
- **Tự kiểm:** test mô tả: client không INSERT/UPDATE/DELETE được log; người ngoài org không đọc được.

### H3. Tính số bản lề/ray từ danh sách tấm
- **v3:** cơ chế (quy tắc `tiers`, `perTaggedPart`) đã làm ở AX4. H3 chỉ còn: nhập số thực tế của xưởng, hiển thị trên UI/BOM/Excel, kiểm các ca biên. Các gạch bên dưới đọc theo nghĩa đó.
- Nối `hingeThresholds` vào engine: ngưỡng cấu hình được theo xưởng, không gán cứng. Mở lại ô cấu hình trên UI chỉ khi đã có tác dụng thật.
- Mặc định tắt/rỗng để số vàng không đổi. Nhãn "Ước tính theo cấu hình xưởng" trên BOM và Excel.
- Số liệu thật cần hỏi xưởng (mục 8 #9). Chưa có thì không tự bịa số.
- **Tự kiểm:** test ca biên: đúng ngưỡng, dưới/trên ngưỡng, cấu hình rỗng.

### H4. Nâng cấp dự án nháp dùng công thức cũ
- Dự án nháp (chưa gửi khách) dùng công thức cũ: hiện nhãn "Dự án dùng công thức cũ (thiếu vật tư phụ)" và nút "Nâng cấp lên công thức mới" có xem trước mức chênh. Không đổi số âm thầm (Rule 12).
- Chốt Dashboard và trang chi tiết dùng cùng MỘT nguồn số (theo kết luận audit mục 5).
- **Tự kiểm:** test: chưa bấm nâng cấp thì số giữ nguyên; xem trước đúng mức chênh; sau nâng cấp `calc_version` đúng.

### H5. Onboarding và điều hướng
- Điều hướng gọn 3 khu vực: Dự án, Thư viện giá, Cài đặt (logo, hotline, gói cước).
- Sau lần demo đầu tiên, gợi ý "Nhập bảng giá của bạn" kèm file Excel mẫu, rồi mới yêu cầu đăng nhập (đúng lúc người dùng đã thấy giá trị).
- **Tự kiểm:** VERIFY xanh; mô tả luồng kiểm tay (agent không chạy được thì ghi "cần người kiểm tra tay").

### H6. Tối ưu điện thoại
- Rà mọi trang ở 375px, sửa chỗ vỡ bố cục. Nút chia sẻ báo giá dùng chia sẻ của trình duyệt nếu có (để gửi qua Zalo), nếu không thì copy link. Không thêm thư viện.
- Chủ xưởng thường xem và gửi báo giá trên điện thoại: ưu tiên màn hình báo giá và xuất.

### H7. Phân tích sử dụng (không thu dữ liệu cá nhân)
- Đo phễu: demo → đăng ký → tạo dự án → xuất báo giá, bằng sự kiện ẩn danh. KHÔNG gửi tên, SĐT, địa chỉ khách hay nội dung dự án.
- Cần dịch vụ/thư viện mới thì G4. Cập nhật Chính sách quyền riêng tư (D5) cho khớp.

---

# GIAI ĐOẠN I: P2 mở rộng và tối ưu

Chỉ làm sau H và khi người chốt ưu tiên (G6). Mỗi mục bắt đầu bằng PLAN ngắn ghi vào báo cáo. Có đổi DB: G3. Thư viện mới/đổi cấu trúc: G4. Mục có thay đổi công thức: tăng `calc_version` (Rule 9).

- **I1. Lịch sử giá vật tư.** Lưu mỗi lần đổi giá trong `materials_library`. Nút "Cập nhật giá mới cho dự án mới" và cập nhật hàng loạt, KHÔNG đổi giá chốt của dự án cũ.
- **I2. Nhập Excel.** Lưu mapping cột theo từng tổ chức, lần sau tự áp dụng. Hỗ trợ dán trực tiếp từ Excel. Lỗi từng dòng bằng tiếng Việt, nêu rõ dòng nào, cột nào, sai gì.
- **I3. Schema trao đổi plugin và web.** CSV/JSON có `schema_version`, web đọc được nhiều phiên bản cũ.
- **I4. License plugin theo tài khoản/token.** Cho phép 2-3 thiết bị mỗi tài khoản thay vì khóa mã máy. Chỉ viết đề xuất và thay đổi bảng, chưa sửa code plugin LISP.
- **I5. Gói cước.** Free giới hạn số dự án đang hoạt động (không giới hạn thời gian dùng thử); Pro có logo riêng, team, v2, xuất Excel. Thu tiền qua VietQR. Kiểm tra gói ở phía server qua bảng `subscriptions`, không tin client. Phụ thuộc cách thu tiền (mục 8 #8).
- **I6. Khách duyệt online.** Nút "Đồng ý" trên link xem báo giá: ghi nhận ai, khi nào, chuyển trạng thái và tạo lệnh xưởng. Có giới hạn tần suất, ghi vào nhật ký, không lộ dữ liệu thừa. Lập PLAN riêng vì liên quan bảo mật.
- **I7. Báo cáo cơ bản.** Tỷ lệ chốt, lãi thực tế theo dự án, hao hụt thực tế so với dự kiến.
- **I8. Mẫu giá và cutlist theo phân khúc.** Căn hộ, nhà phố, bếp, tủ áo, để người mới có điểm xuất phát.
- **I9. Học hệ số hao hụt từ dữ liệu thật; làm tròn theo module.** Chỉ làm khi đã có dữ liệu thật đủ nhiều.
- **I10. Nguồn nhập từ phần mềm thiết kế khác** qua lớp adapter chuẩn hóa (ngoài AutoCAD/SketchUp). SEO cho landing.
- **I11. Dài hạn (chỉ lập PLAN):** nesting/tối ưu cắt, xuất g-code máy CNC, quản lý kho ván lẻ thừa, module thẩm định giá.

---

## 7. Mẫu báo cáo (dùng cho mỗi việc, ghi vào `docs/reports/<mã-việc>.md`)

```
[Mã việc + tên]
Đã làm gì: ...
Bằng chứng:
  - Lệnh: ...
    Output: (dán nguyên văn)
  - Commit: <hash> <thông điệp>
Số vàng sau khi làm: giá vốn ..., giá bán ..., test pass/fail ... (trích từ output)
Còn tồn đọng / BLOCKER: ...
Cần người làm: ... (nếu có)
```

---

## 8. Việc NGƯỜI phải làm (agent không làm thay, không chạy DB)

| # | Việc | Ghi chú |
|---|---|---|
| 1 | `git push` rồi xem tab **Actions** xanh hay đỏ | Chụp ảnh nếu đỏ |
| 2 | Gửi Claude nội dung file migration sau A2 (`Get-Content -Raw -Encoding UTF8 ...`) | Chưa chạy migration cho tới khi đọc xong |
| 3 | Chạy trên Supabase thử nghiệm (SQL Editor, chỉ đọc) và gửi số: `select count(*) as tai_khoan_thieu_profile from auth.users u left join public.profiles p on p.id = u.id where p.id is null;` | Quyết định có cần backfill |
| 4 | Thử lưu hồ sơ ở `/settings/profile`, rồi F5; thử cả tài khoản cũ và tài khoản mới đăng ký | Kiểm tra lệnh vá `profiles` không làm hỏng app. Nếu `permission denied`, gửi nguyên dòng lỗi, đừng tự cấp quyền |
| 5 | "Lưu Cloud" một dự án: F12 → Network → lọc `projects`; nếu đỏ, chụp tab **Response** (không chụp Headers) | Sau khi chạy migration phải xanh |
| 6 | Mở `/projects/proj-vin-smart-2pn`, chụp tab BOM (bảng ván, giá từng dòng) | Đối chiếu số liệu seed bằng mắt |
| 7 | Chạy migration trên Supabase thử nghiệm theo `docs/DB_RESET.md` sau khi duyệt (G3) | Sau đó test đăng ký tài khoản mới (trigger lỗi sẽ chặn đăng ký) |
| 8 | Trả lời: hosting dùng gì (Vercel hay nơi khác); thu tiền gói cước thế nào (VietQR có đối soát tự động hay thủ công) | Ảnh hưởng thiết kế webhook và bảng `subscriptions` |
| 9 | Hỏi một xưởng thật: mỗi cánh dùng mấy bản lề; mỗi hộc kéo mấy bộ ray; ốc cam, vít, keo, màng PE tốn bao nhiêu mỗi tấm; lượng keo hạt thực tế (kg keo một tháng ÷ tổng mét chỉ dán) | Thay các hệ số tạm hiện tại |
| 10 | Tra luật dữ liệu cá nhân hiện hành hoặc hỏi luật sư; tạo project Supabase production; bật 2FA GitHub | Trước khi public |
| 11 | Cấu hình Supabase Auth theo `docs/AUTH_SETUP.md` (xác nhận email, đặt lại mật khẩu, URL chuyển hướng, captcha, SMS) | Sau D10 |
| 12 | Bật bảo vệ nhánh chính trên GitHub (không đẩy thẳng, bắt buộc CI xanh) | Trước go-live |
| 13 | Xoay khóa Supabase/webhook nếu từng lộ trong log hoặc tài liệu chia sẻ | Trước khi public (G5) |
| 14 | Xác nhận gói Supabase có sao lưu tự động không, rồi thử phục hồi một lần | Gói miễn phí không đảm bảo như gói trả phí |
| 15 | Chọn dịch vụ theo dõi uptime/lỗi và kênh hỗ trợ (Zalo hoặc email) | Cho G6 và D7 |
| 16 | TRƯỚC khi gửi link bản chạy thử cho bất kỳ ai: chạy (chỉ đọc) hai câu dưới trên đúng project Supabase mà bản chạy trỏ tới, gửi kết quả. Kỳ vọng: `authenticated` chỉ có UPDATE ở các cột hồ sơ cho phép, không có `subscription_tier`, `email`, `id`; `anon` không có quyền ghi | Chặn việc tự nâng gói `pro` |
| 17 | Gửi Claude để kiểm mô hình ở AX2: (a) các loại sản phẩm xưởng báo giá (tủ bếp, tủ áo, giường, bàn, vách, trần, cửa, sàn...); (b) mỗi loại hiện báo theo cách nào (chi tiết cutlist, mét dài, m², trọn gói); (c) các nhóm chi phí thực tế (mua ngoài, thầu phụ đá/kính/sơn, lắp đặt, vận chuyển, thiết kế, VAT); (d) 3-5 bảng báo giá mẫu đã che thông tin khách | Để mô hình chung phủ đúng thực tế, không bịa |

```sql
select grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema='public' and table_name='profiles' and grantee in ('anon','authenticated')
order by grantee, column_name;

select grantee, privilege_type
from information_schema.table_privileges
where table_schema='public' and table_name='profiles' and grantee in ('anon','authenticated');
```

---

## 9. Câu khởi động để dán vào Antigravity

> Đọc toàn bộ `docs/AGENT_RUNBOOK.md`. Tạo `docs/AGENT_PROGRESS.md`. Thực hiện tuần tự từ Giai đoạn A, mỗi việc một commit, theo vòng tự kiểm tự sửa ở mục 2 và bộ VERIFY ở mục 3. Chỉ dừng ở các cổng G1-G5. Không chạy bất kỳ lệnh nào lên database thật. Không in nội dung `.env*`. Mọi số liệu trong báo cáo phải trích từ output lệnh vừa chạy. Khi xong mỗi giai đoạn, ghi tóm tắt vào `AGENT_PROGRESS.md` và tiếp tục giai đoạn kế tiếp, trừ khi gặp cổng.

Khi đã qua cổng G6, dán thêm:

> Đọc lại `docs/AGENT_RUNBOOK.md` và `docs/AGENT_PROGRESS.md`. Thực hiện Giai đoạn H theo thứ tự H1 đến H7, rồi Giai đoạn I theo thứ tự người đã chốt. Quy tắc cổng, vòng tự kiểm và VERIFY giữ nguyên.

---

## 10. Mẫu prompt sửa lỗi hoặc tính năng nhỏ phát sinh

Dùng khi có lỗi lẻ ngoài lộ trình A-I (agent vẫn theo mục 1-3, chỉ hỏi ở các cổng):

```
Vấn đề: [hiện tượng, trang nào, làm gì thì xảy ra]
Kỳ vọng: [kết quả đúng phải thế nào]
Yêu cầu: tìm NGUYÊN NHÂN GỐC trước, nêu giả thuyết và file liên quan.
Nếu liên quan tính toán: viết test tái hiện lỗi TRƯỚC khi sửa (phải thấy đỏ).
Sửa nhỏ nhất, một việc một commit, chạy VERIFY, báo cáo theo mục 7
kèm cách tôi tự kiểm tra bằng tay.
Nếu rủi ro mất dữ liệu/tiền hoặc chạm cổng G1-G6 thì hỏi tôi trước.
```
