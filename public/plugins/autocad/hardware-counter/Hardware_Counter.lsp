;; ==============================================================================
;; NỀN TẢNG NỘI THẤT PRO - PLUGIN THỐNG KÊ PHỤ KIỆN KIM KHÍ
;; Tên file: Hardware_Counter.lsp
;; Lệnh chạy: HC (Hardware Counter)
;; Tương thích: AutoCAD 2014 - 2026 (64-bit / Windows)
;; ==============================================================================

(vl-load-com)

(defun c:HC ( / *error* doc oldCmd oldOsm oldLayer ss count i ent blkName
                hwList found item qty csvPath f dwgDir)

  ;; Bắt lỗi an toàn
  (defun *error* (msg)
    (if (and doc (= 1 (getvar "UNDOCTL")))
      (vla-EndUndoMark doc)
    )
    (if oldCmd (setvar "CMDECHO" oldCmd))
    (if oldOsm (setvar "OSMODE" oldOsm))
    (if oldLayer (setvar "CLAYER" oldLayer))
    (if (and msg (not (wcmatch (strcase msg t) "*break,*cancel*,*exit*")))
      (princ (strcat "\n[Lỗi HardwareCounter] " msg))
    )
    (princ "\n>>> Đã hủy lệnh thống kê phụ kiện. <<<")
    (princ)
  )

  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (vla-StartUndoMark doc)
  (setq oldCmd (getvar "CMDECHO"))
  (setq oldOsm (getvar "OSMODE"))
  (setq oldLayer (getvar "CLAYER"))
  (setvar "CMDECHO" 0)

  (princ "\n=======================================================")
  (princ "\n   HARDWARE COUNTER - THỐNG KÊ PHỤ KIỆN KIM KHÍ XƯỞNG ")
  (princ "\n   Lệnh khởi động: HC | Bản lề, Ray trượt, Cam chốt    ")
  (princ "\n=======================================================")

  (princ "\nQuét chọn toàn bộ bản vẽ chứa các Block phụ kiện: ")
  (setq ss (ssget '((0 . "INSERT"))))

  (if (not ss)
    (progn
      (princ "\n[Thông báo] Không tìm thấy Block phụ kiện nào được chọn!")
      (setvar "CMDECHO" oldCmd)
      (vla-EndUndoMark doc)
      (exit)
    )
  )

  (setq count (sslength ss))
  (setq i 0)
  (setq hwList nil)

  ;; Đếm số lượng theo tên Block phụ kiện
  (while (< i count)
    (setq ent (ssname ss i))
    (setq blkName (cdr (assoc 2 (entget ent))))

    (if (and blkName (not (wcmatch (strcase blkName) "`**")))
      (progn
        (setq found (assoc blkName hwList))
        (if found
          (setq hwList (subst (cons blkName (1+ (cdr found))) found hwList))
          (setq hwList (cons (cons blkName 1) hwList))
        )
      )
    )
    (setq i (1+ i))
  )

  (if (not hwList)
    (progn
      (princ "\n[Thông báo] Không có tên Block hợp lệ trong vùng chọn!")
      (setvar "CMDECHO" oldCmd)
      (vla-EndUndoMark doc)
      (exit)
    )
  )

  ;; In kết quả lên màn hình Command
  (princ "\n-------------------------------------------------------")
  (princ "\nDANH SÁCH PHỤ KIỆN THỐNG KÊ:")
  (foreach item hwList
    (princ (strcat "\n- " (car item) ": " (itoa (cdr item)) " cái/bộ"))
  )
  (princ "\n-------------------------------------------------------")

  ;; Xuất file CSV UTF-8 BOM gửi đại lý
  (setq dwgDir (getvar "DWGPREFIX"))
  (if (or (not dwgDir) (= dwgDir ""))
    (setq dwgDir (strcat (getenv "USERPROFILE") "\\Desktop\\"))
  )
  (setq csvPath (strcat dwgDir "Hardware_BOM_" (rtos (getvar "CDATE") 2 0) ".csv"))
  (setq f (open csvPath "w"))

  (if f
    (progn
      (write-char 239 f)
      (write-char 187 f)
      (write-char 191 f)
      (write-line "STT,Ten_Phu_Kien,So_Luong,Don_Vi,Ghi_Chu" f)
      
      (setq idx 1)
      (foreach item hwList
        (write-line
          (strcat
            (itoa idx) ","
            (car item) ","
            (itoa (cdr item)) ","
            "Bộ/Cái,"
            "Dat_Hang_Dai_Ly"
          )
          f
        )
        (setq idx (1+ idx))
      )
      (close f)

      (alert
        (strcat
          "THỐNG KÊ PHỤ KIỆN HOÀN TẤT!\n\n"
          "- Tổng số loại phụ kiện: " (itoa (length hwList)) " loại\n"
          "- File tổng hợp lưu tại:\n" csvPath "\n\n"
          "Bạn có thể mở file CSV này bằng Excel để gửi ngay cho đại lý kim khí!"
        )
      )
    )
  )

  (setvar "CMDECHO" oldCmd)
  (setvar "OSMODE" oldOsm)
  (setvar "CLAYER" oldLayer)
  (vla-EndUndoMark doc)
  (princ)
);_ end defun c:HC

(princ "\n[ĐÃ NẠP HARDWARE COUNTER] - Gõ lệnh 'HC' để thống kê phụ kiện kim khí!")
(princ)
