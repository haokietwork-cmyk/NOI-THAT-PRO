# Hardware Counter (Thống Kê Phụ Kiện Kim Khí Xưởng)

> **Phiên bản:** 1.0 Pro  
> **Lệnh khởi động:** `HC` *(Hardware Counter)*  
> **Tương thích:** AutoCAD 2014 - 2026 (64-bit Windows)

---

## 1. GIỚI THIỆU & CÔNG DỤNG

Trong sản xuất nội thất, việc đếm thủ công từng chiếc bản lề giảm chấn, từng bộ ray trượt âm ngăn kéo, từng chốt cam liên kết hoặc tay nắm tủ trên bản vẽ thường xuyên dẫn đến việc **đếm thiếu hoặc đặt thừa phụ kiện**, làm đình trệ tiến độ lắp đặt tại công trình.

**Hardware Counter** giải quyết triệt để vấn đề này:
- Tự động quét và đếm chính xác số lượng từng loại phụ kiện dựa trên các Block trong bản vẽ.
- Gom nhóm và tính toán tổng số lượng theo từng loại (bản lề lọt lòng, cong vừa, trùm ngoài; ray âm giảm chấn 400mm, 450mm, 500mm...).
- Xuất ngay bảng **BOM phụ kiện gửi đại lý (.csv)** có mã UTF-8 BOM, sẵn sàng mở bằng Excel để gửi đặt hàng cho Hafele, Ivan, Blum, Cariny.

---

## 2. CẤU TRÚC GÓI CÔNG CỤ

```
hardware-counter/
├── Hardware_Counter.lsp          # Mã nguồn Lisp thống kê phụ kiện
└── README.md                     # Hướng dẫn quy ước đặt tên Block và sử dụng lệnh HC
```

---

## 3. QUY ƯỚC ĐẶT TÊN BLOCK PHỤ KIỆN ĐỂ CÔNG CỤ ĐẾM CHUẨN

Để công cụ đếm và xuất bảng chính xác tên sản phẩm, các thư viện Block phụ kiện của xưởng nên đặt tên theo quy ước gợi nhớ:
- `Ban_Le_Giam_Chan_Thang` (Bản lề trùm ngoài)
- `Ban_Le_Giam_Chan_Cong_Vua` (Bản lề nửa trùm)
- `Ban_Le_Giam_Chan_Cong_Nhieu` (Bản lề lọt lòng)
- `Ray_Truot_Am_450mm`
- `Chot_Cam_Lien_Ket`
- `Tay_Nam_Nhom_D128`
- `Piston_Nang_Canh_100N`

---

## 4. HƯỚNG DẪN SỬ DỤNG LỆNH `HC`

1. Trong AutoCAD, nạp file `Hardware_Counter.lsp` (qua kéo thả hoặc lệnh `APPLOAD`).
2. Gõ lệnh:
   ```
   HC
   ```
   rồi nhấn `Enter`.
3. Quét chọn toàn bộ bản vẽ chứa các ký hiệu phụ kiện.
4. Lisp sẽ tự động đếm và hiển thị bảng tổng hợp trên thanh Command, đồng thời tự động xuất ra file:  
   `Hardware_BOM_[NgayThang].csv`
5. Mở file CSV bằng Excel và gửi cho nhà cung cấp kim khí.
