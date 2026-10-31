# TÀI LIỆU VẬN HÀNH HỆ THỐNG, SAO LƯU & PHỤC HỒI DỮ LIỆU (OPERATIONS RUNBOOK)

> **Dự án:** Nền tảng SaaS AutoCutlist (`webnoithatpro.vn`)  
> **Cập nhật:** Tháng 10/2026 | **Phiên bản:** 1.0-prod-ready  
> **Áp dụng cho:** Kỹ sư vận hành (DevOps), Kỹ sư chính, Quản trị viên hệ thống.

---

## 1. PHÂN TÁCH BA MÔI TRƯỜNG ĐỘC LẬP (ENVIRONMENT ISOLATION)

Để đảm bảo an toàn tuyệt đối cho dữ liệu thật và tiền của khách hàng, hệ thống nghiêm cấm dùng chung cơ sở dữ liệu giữa các môi trường:

```
[Local / Dev]        -->  Supabase Dev Instance / Localhost 3000
[Staging / Preview]  -->  Supabase Staging Project / Vercel Preview Branch
[Production]         -->  Supabase Production (PITR Bật) / webnoithatpro.vn
```

### Bảng cấu hình biến môi trường theo môi trường

| Tên Biến | Môi Trường Local / Dev | Staging / Preview | Production |
|---|---|---|---|
| `NODE_ENV` | `development` | `production` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dev-xxx.supabase.co` | `https://staging-xxx.supabase.co` | `https://prod-xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key Dev | Key Staging | Key Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Key Dev | Service Key Staging | Service Key Production (Bảo mật tối mật) |
| `PAYMENT_WEBHOOK_SECRET` | Chuỗi test tùy ý | Secret Staging SePay/PayOS | Secret Production thực tế |
| `SEPAY_API_KEY` | Bỏ trống hoặc Test Key | API Key Sandbox | API Key Production Live |
| `PAYOS_CHECKSUM_KEY` | Bỏ trống hoặc Test Key | Checksum Sandbox | Checksum Production Live |

> [!CAUTION]
> Tuyệt đối không commit file `.env`, `.env.local`, `.env.production` vào Git. Toàn bộ biến môi trường Production phải được cấu hình trực tiếp trên Dashboard Vercel / Máy chủ triển khai.

---

## 2. CHIẾN LƯỢC SAO LƯU DỮ LIỆU (BACKUP POLICY)

### 2.1. Sao Lưu Tự Động Hàng Ngày (Automated Daily Backups)
- **Cơ chế:** Do dịch vụ Supabase quản lý tự động vào 02:00 sáng hàng ngày (giờ Việt Nam).
- **Thời gian lưu trữ:** Giữ lại tối thiểu 7 ngày gần nhất (gói Free/Pro) hoặc 30 ngày (gói Team/Enterprise).

### 2.2. Điểm Phục Hồi Theo Từng Giây (Point-in-Time Recovery - PITR)
- **Bắt buộc kích hoạt trên Production:** PITR ghi nhận liên tục Write-Ahead Logging (WAL).
- **Khả năng:** Cho phép tua ngược trạng thái cơ sở dữ liệu về chính xác từng giây trước thời điểm xảy ra sự cố (ví dụ: ngay trước khi một bảng bị xóa nhầm lúc 14:22:15).

### 2.3. Sao Lưu Thủ Công Dự Phòng (Manual Logical Backup via pg_dump)
Trước mỗi đợt nâng cấp schema lớn hoặc chạy migration có nguy cơ ảnh hưởng cấu trúc:
```bash
# Xuất toàn bộ dữ liệu và cấu trúc ra file nén
pg_dump -h db.prod-xxx.supabase.co -U postgres -d postgres -F c -b -v -f "autocutlist_backup_$(date +%Y%m%d_%H%M%S).dump"
```

---

## 3. QUY TRÌNH PHỤC HỒI SỰ CỐ (DISASTER RECOVERY PROCEDURES)

### Kịch bản 1: Xóa nhầm dữ liệu hoặc Migration lỗi trên Production
1. **Dừng ghi tạm thời (Drain Traffic):** Chuyển trang web sang chế độ bảo trì (Maintenance Mode) trên Vercel để tránh phát sinh thêm giao dịch mới.
2. **Khôi phục qua Supabase Dashboard:**
   - Vào: `Project Settings` → `Database` → `Backups` → `Point in Time Recovery`.
   - Chọn thời điểm: Trước khi xảy ra lỗi 2 phút.
   - Bấm `Restore to a new project` (khuyến nghị khôi phục sang project mới để kiểm tra đối chiếu trước khi tráo đổi).
3. **Chuyển biến môi trường:** Cập nhật URL và Key mới trên Vercel, kiểm tra smoke test các trang `/dashboard`, `/quoting`.
4. **Mở lại hệ thống:** Tắt chế độ bảo trì.

### Kịch bản 2: Webhook ngân hàng bị đứt mạng hoặc gián đoạn kết nối
- Nhờ bảng `payment_events` (migration `20261031085500_payment_events.sql`), toàn bộ giao dịch đều được bảo vệ tính Idempotent.
- Khi cổng SePay/PayOS gửi lại (retry) các request bị sót, hệ thống tự động kiểm tra:
  - Nếu đã xử lý: Trả về HTTP 200 `{ idempotent: true }` ngay lập tức, không cộng gói trùng.
  - Nếu chưa xử lý: Ghi nhận kích hoạt gói Pro hoặc cấp License Key bình thường.

### Kịch bản 3: Khách hàng sửa dự án đồng thời trên 2 thiết bị tại xưởng
- Đã được bảo vệ bởi cơ chế **Optimistic Concurrency Control** trong `StorageService`:
  - So sánh `updated_at` của server với `updatedAt` của client.
  - Nếu phát hiện bản trên Cloud mới hơn bản trên máy: Cảnh báo người dùng và không cho phép ghi đè âm thầm.

---

## 4. MA TRẬN PHÂN ĐỊNH TRÁCH NHIỆM (RACI MATRIX)

| Tác Vụ Vận Hành | Kỹ Sư Trưởng (Agent/Lead) | Quản Trị Viên / Chủ Sở Hữu (Human Admin) | Cổng Thanh Toán (SePay/PayOS) |
|---|---|---|---|
| Cấu hình biến môi trường Production | Hướng dẫn định dạng | **Thực hiện (Nhập Key thật)** | Cung cấp Webhook Secret |
| Bật PITR & Kiểm tra Backup thật | Viết tài liệu hướng dẫn | **Thực hiện trên Supabase Console** | - |
| Áp dụng Migration Database | Viết file migration SQL chuẩn | **Review & Bấm chạy trên DB thật** | - |
| Xử lý khiếu nại giao dịch lỗi | Cung cấp công cụ tra cứu log | **Xác nhận số dư ngân hàng** | Đối soát giao dịch |
| Duyệt cập nhật Terms & Privacy | Chuẩn bị bản dự thảo | **Tham vấn luật sư & Công bố** | - |

---

## 5. CHECKLIST KIỂM TRA ĐỊNH KỲ HÀNG TUẦN (WEEKLY OPS CHECKLIST)

- [ ] Kiểm tra trạng thái Database Backup trên Supabase Console (xanh lá cây).
- [ ] Kiểm tra dung lượng lưu trữ Storage (các file Cutlist tải lên).
- [ ] Kiểm tra tỷ lệ lỗi 5xx trên Vercel Analytics / Monitoring (< 0.1%).
- [ ] Rà soát các cảnh báo bảo mật phụ thuộc qua `npm audit`.
- [ ] Kiểm tra bảng `payment_events` xem có giao dịch nào bị treo hoặc retry bất thường không.
