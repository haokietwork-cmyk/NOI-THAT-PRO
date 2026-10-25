# QUY TẮC PHÁT TRIỂN AUTOLISP / VISUAL LISP THƯƠNG MẠI (AUTOLISP RULES)

> Áp dụng cho các công cụ, plugin AutoCAD được phát triển để bán trên module `/cad-store` hoặc dùng làm công cụ đầu phễu bóc tách dữ liệu đẩy lên Web.

---

## 1. SÁU QUY TẮC VÀNG KHI VIẾT CODE AUTOLISP

1. **Khởi tạo môi trường COM:**
   - Luôn đặt `(vl-load-com)` ở dòng đầu tiên của file để nạp thư viện Visual LISP.
2. **Khai báo biến cục bộ nghiêm ngặt:**
   - Mọi hàm lệnh `(defun c:TenLenh ( / bien1 bien2 bien3 ...))` BẮT BUỘC khai báo toàn bộ danh sách biến cục bộ sau dấu gạch chéo `/`.
   - *Lý do:* Tránh biến toàn cục lưu rác giữa các lần chạy, gây sai lệch số liệu khi người dùng chạy lệnh lần thứ hai.
3. **Bắt lỗi & Bảo toàn biến hệ thống (System Variables):**
   - Lưu trạng thái các biến hệ thống trước khi chạy: `CMDECHO`, `OSMODE`, `CLAYER`, `ANGDIR`, `AUNITS`.
   - Luôn có hàm `*error*` cục bộ bên trong lệnh chính để khôi phục lại các biến hệ thống ngay cả khi người dùng bấm phím `ESC` để hủy lệnh.
   - Bọc toàn bộ thao tác vẽ/sửa đối tượng trong cặp `vla-StartUndoMark` và `vla-EndUndoMark` của `ActiveDocument` để người dùng chỉ cần nhấn `Ctrl + Z` 1 lần là hoàn tác toàn bộ thao tác.
4. **Hộp thoại DCL tự hủy (Single-File Distribution):**
   - Để khách hàng cài đặt dễ dàng (chỉ cần 1 file `.lsp` hoặc `.vlx`), ưu tiên nhúng mã DCL vào chuỗi trong Lisp, tự động ghi ra file tạm trong `%TEMP%`, mở hộp thoại và xóa file tạm ngay khi đóng.
5. **Định dạng xuất CSV chuẩn tiếng Việt & Khớp 8 cột Web:**
   - Khi xuất file `.csv` danh sách tấm chi tiết, bắt buộc ghi mã BOM UTF-8 (`\xEF\xBB\xBF`) ở đầu file để mở bằng Microsoft Excel không bao giờ bị lỗi font tiếng Việt.
   - Xuất chính xác 8 cột chuẩn của Web:
     ```csv
     Hang_Muc,Ten_Chi_Tiet,Dai,Rong,Day,So_Luong,Ma_Vat_Lieu,Dan_Canh
     ```
6. **Kiểm tra cú pháp & Dấu ngoặc:**
   - Mọi hàm phải có chú thích đóng rõ ràng, ví dụ `);_ end defun`, kiểm tra số lượng dấu mở/đóng ngoặc khớp 100%.

---

## 2. KHUNG LỆNH AUTOLISP CHUẨN MẪU (BOILERPLATE)

```lisp
(vl-load-com)

(defun c:XuatCutlist ( / *error* doc oldCmd oldOsm oldLayer filePath f)
  ;; --- Hàm xử lý lỗi cục bộ ---
  (defun *error* (msg)
    (if (and doc (= 1 (getvar "UNDOCTL")))
      (vla-EndUndoMark doc)
    )
    (if oldCmd (setvar "CMDECHO" oldCmd))
    (if oldOsm (setvar "OSMODE" oldOsm))
    (if oldLayer (setvar "CLAYER" oldLayer))
    (if (and msg (not (wcmatch (strcase msg t) "*break,*cancel*,*exit*")))
      (princ (strcat "\n[Lỗi] " msg))
    )
    (princ "\n>>> Đã hủy lệnh và khôi phục cài đặt CAD. <<<")
    (princ)
  )

  ;; --- Lưu trạng thái hệ thống ---
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (vla-StartUndoMark doc)
  (setq oldCmd (getvar "CMDECHO"))
  (setq oldOsm (getvar "OSMODE"))
  (setq oldLayer (getvar "CLAYER"))
  (setvar "CMDECHO" 0)

  ;; --- Logic chính của công cụ ---
  (princ "\nĐang bóc tách khối lượng chi tiết nội thất...")
  ;; (Xử lý đối tượng bản vẽ ở đây...)

  ;; --- Khôi phục hệ thống khi hoàn thành ---
  (setvar "CMDECHO" oldCmd)
  (setvar "OSMODE" oldOsm)
  (setvar "CLAYER" oldLayer)
  (vla-EndUndoMark doc)
  (princ "\n>>> Bóc tách hoàn tất! File sẵn sàng đưa lên Web. <<<")
  (princ)
);_ end defun
```

---

## 3. CƠ CHẾ KHÓA BẢN QUYỀN (LICENSE KEY) THEO MÁY

Để bảo vệ bản quyền Lisp thương mại bán trên Web:
1. Lisp đọc Volume Serial Number của ổ cứng `C:` bằng `Scripting.FileSystemObject`:
```lisp
(defun Get-Machine-ID ( / fso drive serial)
  (setq fso (vlax-create-object "Scripting.FileSystemObject"))
  (setq drive (vlax-invoke-method fso 'GetDrive "C:"))
  (setq serial (vlax-get-property drive 'SerialNumber))
  (vlax-release-object drive)
  (vlax-release-object fso)
  (itoa serial)
)
```
2. Khách hàng nhập Machine ID lên trang `/cad-store/[slug]` sau khi thanh toán VietQR -> Web cấp License Key kích hoạt.
3. Trước khi phân phối, lập trình viên mở **VLIDE** trong AutoCAD để đóng gói và mã hóa file `.lsp` thành `.vlx` hoặc `.fas` để chống lộ mã nguồn.
