# SmartDim Furniture (Ghi Kích Thước Tủ Thông Minh & Khóa Bản Quyền)

> **Phiên bản:** 1.5 Pro (Commercial Edition)  
> **Lệnh khởi động:** `SD` *(Smart Dimension)*  
> **Bản quyền:** Khóa theo mã phần cứng máy tính (Volume Serial Number ổ C:)  
> **Khóa kích hoạt dùng thử (Trial):** `NTPRO-COMMUNITY-TRIAL`  
> **Tương thích:** AutoCAD 2014, 2018, 2020, 2022, 2024, 2026 (64-bit Windows)

---

## 1. GIỚI THIỆU & CÔNG DỤNG

**SmartDim Furniture** là công cụ hỗ trợ thợ kỹ thuật triển khai bản vẽ nội thất 2D/3D trong AutoCAD:
- **Tự động đo lọt lòng khoang tủ:** Bắt chính xác 2 mép ván và gióng đường kích thước lọt lòng khoang đợt, khoang ngăn kéo chỉ với 2 cú click chuột.
- **Không đè nét chữ:** Tự động căn chỉnh khoảng cách đường kích thước, tránh đè chữ lên mép ván hoặc các đường hatch.
- **Tích hợp cơ chế DRM bản quyền:** Khóa cứng theo Volume Serial Number của ổ cứng `C:`, tự động lưu khóa kích hoạt vào Windows Registry để chỉ cần kích hoạt duy nhất một lần.

---

## 2. CẤU TRÚC GÓI CÔNG CỤ

```
smartdim-furniture/
├── SmartDim_Furniture.lsp        # File AutoLISP thương mại có tích hợp mã DRM
└── README.md                     # Hướng dẫn kích hoạt bản quyền & sử dụng lệnh SD
```

---

## 3. CÁCH LẤY MÃ MÁY TÍNH (VOLUME ID)

Mỗi máy tính có một mã Volume Serial Number duy nhất do Windows gán cho ổ cứng `C:`. Bạn có thể lấy mã máy bằng 2 cách:

### Cách 1: Chạy lệnh `SD` trực tiếp trong AutoCAD
1. Nạp file `SmartDim_Furniture.lsp` vào AutoCAD (kéo thả hoặc dùng lệnh `APPLOAD`).
2. Gõ lệnh `SD` -> Nhấn `Enter`.
3. Nếu máy chưa kích hoạt, hộp thoại **Kích Hoạt Bản Quyền SmartDim Furniture** sẽ xuất hiện và hiển thị sẵn:
   ```
   Mã máy (Volume ID): 4A2B-8C1D
   ```
4. Bạn chỉ cần sao chép mã này để đem lên Web nhận License Key.

### Cách 2: Lấy qua Command Prompt (CMD)
1. Nhấn tổ hợp phím `Windows + R` trên bàn phím.
2. Gõ `cmd` -> Nhấn `Enter`.
3. Gõ tiếp lệnh:
   ```cmd
   vol c:
   ```
4. Màn hình sẽ hiện dòng:  
   `Volume Serial Number is 4A2B-8C1D`  
   *(Chuỗi 8 ký tự sau chữ `is` chính là mã Volume ID của bạn).*

---

## 4. HƯỚNG DẪN KÍCH HOẠT BẢN QUYỀN

### Kích hoạt Bản Quyền Trọn Đời (Qua Web):
1. Truy cập vào trang: **`https://webnoithatpro.vn/cad-store`**.
2. Chọn sản phẩm **SmartDim Furniture (Ghi Kích Thước Tủ Thông Minh)**.
3. Dán **Mã máy (Volume ID)** của bạn vào ô đăng ký.
4. Quét mã VietQR để thanh toán (199.000 đ).
5. Sau khi thanh toán thành công, hệ thống sẽ cấp ngay cho bạn một **License Key** có định dạng:
   ```
   NTPRO-[4 Ký Tự Đầu Mã Máy]-SD-[Mã Hash Bảo Mật]
   Ví dụ: NTPRO-4A2B-SD-189320
   ```
6. Quay lại AutoCAD, dán Key này vào ô **Nhập Khóa Kích Hoạt (License Key)** trong hộp thoại -> Bấm **OK**.
7. Thông báo **"XÁC THỰC THÀNH CÔNG!"** xuất hiện. Key này được ghi vào Registry Windows:  
   `HKEY_CURRENT_USER\Software\NoiThatPro\SmartDim`  
   *Từ nay bạn có thể sử dụng vĩnh viễn trên máy tính này mà không cần nhập lại key.*

### Dùng Thử Nhanh (Trial Mode):
Nếu muốn kiểm tra tính năng trước khi mua, bạn có thể nhập khóa kích hoạt dùng thử:
```
NTPRO-COMMUNITY-TRIAL
```
Sau đó bấm **OK** để mở khóa công cụ.

---

## 5. HƯỚNG DẪN SỬ DỤNG LỆNH `SD`

1. Tại dòng lệnh AutoCAD, gõ:
   ```
   SD
   ```
   rồi nhấn `Enter`.
2. Dòng nhắc 1: `Chọn điểm mép ván thứ nhất (Điểm bắt đầu):`  
   -> Bấm chuột vào góc trong của hồi tủ trái.
3. Dòng nhắc 2: `Chọn điểm mép ván đối diện (Điểm lọt lòng):`  
   -> Bấm chuột vào góc trong của hồi tủ phải (hoặc đợt tủ).
4. Dòng nhắc 3: `Đặt vị trí đường kích thước:`  
   -> Kéo chuột ra vị trí mong muốn và click chuột để đặt đường đo.
5. Đường Dimension chuẩn chỉ sẽ được tạo và giá trị lọt lòng hiển thị trực tiếp trên thanh Command (Ví dụ: `Khoảng cách lọt lòng đo được: 866.0 mm`).
