# BatchPlot Layout (In Hàng Loạt Bản Vẽ Thi Công Nội Thất)

> **Phiên bản:** 1.2 Pro  
> **Lệnh khởi động:** `BP` *(Batch Plot)*  
> **Tương thích:** AutoCAD 2014 - 2026 (64-bit Windows)

---

## 1. GIỚI THIỆU & CÔNG DỤNG

Trong một bộ hồ sơ thi công nội thất căn hộ hoặc biệt thự, thường có từ **30 đến 100 bản vẽ chi tiết** (mặt bằng, mặt đứng, mặt cắt cấu tạo các hệ tủ áo, tủ bếp, giường, vách nan). Nếu in thủ công từng khung tên bằng lệnh `PLOT` (`Ctrl + P`), kỹ sư sẽ mất từ 45 phút đến 1.5 tiếng.

**BatchPlot Layout** tự động hóa 100% quy trình này:
- Tự động nhận diện khung tên bản vẽ (dạng Block thuộc tính hoặc hình chữ nhật bao quanh).
- Tự động sắp xếp thứ tự in từ trên xuống dưới, từ trái qua phải theo đúng thứ tự bố trí.
- Xuất toàn bộ 50–100 bản vẽ sang file PDF duy nhất trong vòng 30 giây không lệch tỷ lệ.

---

## 2. CẤU TRÚC GÓI CÔNG CỤ

```
batchplot-layout/
├── BatchPlot_Layout.lsp          # Mã nguồn Lisp in hàng loạt
└── README.md                     # Tài liệu hướng dẫn sử dụng
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT

1. Mở AutoCAD, gõ lệnh `APPLOAD` -> Nhấn `Enter`.
2. Chọn file `BatchPlot_Layout.lsp` trong thư mục `batchplot-layout/`.
3. Bấm **Load** để dùng ngay, hoặc thêm vào **Startup Suite** (biểu tượng chiếc cặp) để dùng vĩnh viễn.

---

## 4. HƯỚNG DẪN SỬ DỤNG LỆNH `BP`

1. Mở bản vẽ chứa các khung tên thi công (trong không gian Model hoặc Layout).
2. Gõ lệnh:
   ```
   BP
   ```
   rồi nhấn `Enter`.
3. Dùng chuột quét chọn toàn bộ khu vực chứa các khung tên bản vẽ.
4. Lisp tự động tính toán số lượng khung tên, sắp xếp thứ tự và mở hộp thoại xác nhận.
5. Bấm **OK** để bắt đầu xuất file PDF.
