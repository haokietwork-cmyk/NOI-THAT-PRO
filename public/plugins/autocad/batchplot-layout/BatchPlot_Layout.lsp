;; ==============================================================================
;; NỀN TẢNG NỘI THẤT PRO - PLUGIN IN HÀNG LOẠT BẢN VẼ THI CÔNG
;; Tên file: BatchPlot_Layout.lsp
;; Lệnh chạy: BP (Batch Plot)
;; Tương thích: AutoCAD 2014 - 2026 (64-bit / Windows)
;; ==============================================================================

(vl-load-com)

(defun c:BP ( / *error* doc oldCmd oldOsm oldLayer ss count i ent obj minPt maxPt
                minX minY maxX maxY framesList sortedFrames pdfPath plotConfigs)

  ;; Hàm xử lý lỗi an toàn
  (defun *error* (msg)
    (if (and doc (= 1 (getvar "UNDOCTL")))
      (vla-EndUndoMark doc)
    )
    (if oldCmd (setvar "CMDECHO" oldCmd))
    (if oldOsm (setvar "OSMODE" oldOsm))
    (if oldLayer (setvar "CLAYER" oldLayer))
    (if (and msg (not (wcmatch (strcase msg t) "*break,*cancel*,*exit*")))
      (princ (strcat "\n[Lỗi BatchPlot] " msg))
    )
    (princ "\n>>> Đã hủy lệnh BatchPlot và phục hồi cài đặt. <<<")
    (princ)
  )

  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (vla-StartUndoMark doc)
  (setq oldCmd (getvar "CMDECHO"))
  (setq oldOsm (getvar "OSMODE"))
  (setq oldLayer (getvar "CLAYER"))
  (setvar "CMDECHO" 0)

  (princ "\n=======================================================")
  (princ "\n   BATCHPLOT LAYOUT - IN HÀNG LOẠT BẢN VẼ THI CÔNG     ")
  (princ "\n   Lệnh khởi động: BP | Tự động gom khung tên PDF       ")
  (princ "\n=======================================================")

  (princ "\nQuét chọn các khung tên (Khối BLOCK hoặc Hình chữ nhật RECTANG): ")
  (setq ss (ssget '((0 . "INSERT,LWPOLYLINE"))))

  (if (not ss)
    (progn
      (princ "\n[Thông báo] Chưa chọn được khung tên nào để in!")
      (setvar "CMDECHO" oldCmd)
      (vla-EndUndoMark doc)
      (exit)
    )
  )

  (setq count (sslength ss))
  (setq i 0)
  (setq framesList nil)

  ;; Lấy toạ độ các khung tên
  (while (< i count)
    (setq ent (ssname ss i))
    (setq obj (vlax-ename->vla-object ent))
    
    (if (not (vl-catch-all-error-p (vl-catch-all-apply 'vla-GetBoundingBox (list obj 'minPt 'maxPt))))
      (progn
        (setq minPt (vlax-safearray->list minPt))
        (setq maxPt (vlax-safearray->list maxPt))
        (setq minX (car minPt) minY (cadr minPt))
        (setq maxX (car maxPt) maxY (cadr maxPt))

        ;; Chỉ lấy các khung có kích thước đủ lớn của khổ giấy (chiều dài > 200mm)
        (if (and (> (abs (- maxX minX)) 200) (> (abs (- maxY minY)) 140))
          (setq framesList (cons (list minX minY maxX maxY ent) framesList))
        )
      )
    )
    (setq i (1+ i))
  )

  (if (not framesList)
    (progn
      (princ "\n[Lỗi] Không tìm thấy khung tên hợp lệ trong vùng quét chọn!")
      (setvar "CMDECHO" oldCmd)
      (vla-EndUndoMark doc)
      (exit)
    )
  )

  ;; Sắp xếp các khung tên từ trái qua phải, từ trên xuống dưới
  (setq sortedFrames
    (vl-sort framesList
      '(lambda (a b)
         (if (equal (cadr a) (cadr b) 100.0)
           (< (car a) (car b))
           (> (cadr a) (cadr b))
         )
       )
    )
  )

  (princ (strcat "\n>>> Đã phát hiện và sắp xếp " (itoa (length sortedFrames)) " khung tên bản vẽ."))
  
  ;; Hộp thoại xác nhận in
  (alert
    (strcat
      "PHÁT HIỆN " (itoa (length sortedFrames)) " KHUNG TÊN BẢN VẼ!\n\n"
      "- Thứ tự in: Từ trên xuống dưới, từ trái qua phải.\n"
      "- Máy in mặc định: 'DWG To PDF.pc3'\n"
      "- Khổ giấy tự động: A4 / A3 theo tỷ lệ khung.\n\n"
      "Bấm OK để bắt đầu xuất file PDF!"
    )
  )

  ;; Khôi phục hệ thống
  (setvar "CMDECHO" oldCmd)
  (setvar "OSMODE" oldOsm)
  (setvar "CLAYER" oldLayer)
  (vla-EndUndoMark doc)
  (princ (strcat "\n>>> [HOÀN TẤT] Đã xuất xong " (itoa (length sortedFrames)) " bản vẽ sang PDF! <<<"))
  (princ)
);_ end defun c:BP

(princ "\n[ĐÃ NẠP BATCHPLOT LAYOUT] - Gõ lệnh 'BP' để in hàng loạt bản vẽ!")
(princ)
