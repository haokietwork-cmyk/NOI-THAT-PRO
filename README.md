# AutoCutlist Pro - Nền Tảng Bóc Tách Vật Tư & Báo Giá Nội Thất Xưởng Gỗ

Hệ thống bóc tách danh sách tấm (Cutlist) Excel, tính toán định mức ván tiêu chuẩn (1220x2440), mét dài chỉ dán cạnh PVC, phụ kiện kim khí và nhân công sản xuất xưởng mộc, xuất hai đầu ra độc lập:
1. **Bảng đặt vật tư (BOM):** Gửi đại lý cung ứng ván và phụ kiện.
2. **Báo giá khách hàng chuẩn A4:** Bản in chuyên nghiệp không lộ thông số hao hụt và giá vốn.

---

## Yêu Cầu Môi Trường (System Requirements)

- **Node.js:** `>= 22.6.0` (Bắt buộc để hỗ trợ cờ native `--experimental-strip-types` và bộ `node:test` không cần cài thêm trình biên dịch phụ).
- **Trình quản lý gói:** `npm` (đi kèm Node.js).

---

## Cài Đặt & Vận Hành

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Kiểm tra kiểu & cú pháp nghiêm ngặt
npm run lint

# 4. Chạy bộ kiểm thử tự động
npm test

# 5. Đóng gói bản chạy thực tế (Production Build)
npm run build
```

---

## Quy Tắc Phiên Bản Tính Toán (calc_version)

- `calc_version = 1`: Đại diện cho công thức tính toán chuẩn xưởng hiện tại của AutoCutlist.
- **Quy tắc bất biến:** Kể từ thời điểm có khách hàng thật lưu dự án đầu tiên lên hệ thống, nếu có bất kỳ sự thay đổi logic/công thức tính toán nào trong tương lai, BẮT BUỘC phải tăng `calc_version` lên (+1) và bảo lưu nguyên vẹn engine tính toán của các phiên bản cũ để bảo vệ triệt để tính toàn vẹn của báo giá lịch sử (Snapshot Pricing).

