(defun Run-Full-Cutlist-Test ( / ss count i ent partData rawList aggList totalParts totalRows key found entry csvPath f)
  (princ "\n=================================================================")
  (princ "\n   KIỂM THỬ TÍNH TỐI ƯU CỦA AUTOCUTLIST V2.5 TRONG CADCRAFT   ")
  (princ "\n=================================================================")

  (setq ss (ssget "X" '((0 . "LWPOLYLINE,POLYLINE,3DSOLID,INSERT"))))
  (setq count (sslength ss))
  (princ (strcat "\n>>> Tổng số đối tượng tìm thấy trong bản vẽ: " (itoa count)))

  (setq rawList nil)
  (setq i 0)

  ;; Duyệt từng đối tượng và bóc tách
  (while (< i count)
    (setq ent (ssname ss i))
    (setq elist (entget ent))
    (setq entType (cdr (assoc 0 elist)))
    (setq layerName (strcase (cdr (assoc 8 elist))))

    ;; A. Tự động nhận diện độ dày và vật tư theo Layer
    (cond
      ((or (wcmatch layerName "*HAU*") (wcmatch layerName "*_6*"))
       (setq thkMm 6)
       (setq matCode "MDF_VAN_HAU_6")
       (setq edgeCode "KHONG_DAN")
      )
      ((or (wcmatch layerName "*_9*") (wcmatch layerName "*DAY_9*"))
       (setq thkMm 9)
       (setq matCode "MDF_CHONG_AM_9")
       (setq edgeCode "4_CANH")
      )
      (t
       (setq thkMm 17)
       (setq matCode "MDF_CHONG_AM_17")
       (setq edgeCode "4_CANH")
      )
    )

    ;; B. Xử lý hình học
    (if (wcmatch entType "LWPOLYLINE,POLYLINE")
      (progn
        (setq pts nil)
        (foreach item elist
          (if (= (car item) 10) (setq pts (cons (cdr item) pts)))
        )
        (setq pts (reverse pts))
        (setq numPts (length pts))

        (if (= numPts 4)
          ;; Đo vector cạnh thực tế (cho cả tấm xoay góc)
          (progn
            (setq p0 (nth 0 pts))
            (setq p1 (nth 1 pts))
            (setq p2 (nth 2 pts))
            (setq d1 (distance p0 p1))
            (setq d2 (distance p1 p2))
            (setq lenMm (fix (+ 0.5 (max d1 d2))))
            (setq widMm (fix (+ 0.5 (min d1 d2))))
          )
          ;; Tấm khoét/giật cấp
          (progn
            (setq minX (apply 'min (mapcar 'car pts)))
            (setq maxX (apply 'max (mapcar 'car pts)))
            (setq minY (apply 'min (mapcar 'cadr pts)))
            (setq maxY (apply 'max (mapcar 'cadr pts)))
            (setq lenMm (fix (+ 0.5 (max (- maxX minX) (- maxY minY)))))
            (setq widMm (fix (+ 0.5 (min (- maxX minX) (- maxY minY)))))
          )
        )
      )
    )

    ;; Đặt tên chi tiết gợi nhớ theo kích thước để dễ kiểm chứng
    (setq partName
      (cond
        ((and (= lenMm 2400) (= widMm 600)) "Hoi_Tu_Dung")
        ((and (= lenMm 1800) (= widMm 600)) "Day_Tu_Ngang")
        ((and (= lenMm 866) (= widMm 580))  "Dot_Di_Dong")
        ((and (= lenMm 1000) (= widMm 400)) "Canh_Vat_Xoay_45Do")
        (t (strcat "Tam_Chi_Tiet_" (itoa (1+ i))))
      )
    )

    (if (and lenMm widMm (> lenMm 50) (> widMm 30))
      (setq rawList (cons (list "Tu_Ao_Master" partName lenMm widMm thkMm matCode edgeCode) rawList))
    )
    (setq i (1+ i))
  )

  (setq totalParts (length rawList))
  (princ (strcat "\n>>> Số tấm hợp lệ trích xuất: " (itoa totalParts)))

  ;; C. Thuật toán gom nhóm số lượng
  (setq aggList nil)
  (foreach row (reverse rawList)
    (setq key (strcat (nth 0 row) "|" (nth 1 row) "|" (itoa (nth 2 row)) "|" (itoa (nth 3 row)) "|" (itoa (nth 4 row)) "|" (nth 5 row) "|" (nth 6 row)))
    (setq found (assoc key aggList))
    (if found
      (setq aggList (subst (list key (1+ (cadr found)) row) found aggList))
      (setq aggList (cons (list key 1 row) aggList))
    )
  )

  (setq totalRows (length aggList))
  (princ (strcat "\n>>> Số dòng sau khi gom nhóm (Aggregated): " (itoa totalRows) " dòng."))

  ;; D. Xuất ra file CSV (Dùng chuỗi UTF-8 BOM chr 239 187 191 tương thích 100% mọi Lisp Engine)
  (setq csvPath "public/plugins/autocad/test-drawings/test_cutlist_output.csv")
  (setq f (open csvPath "w"))
  (if f
    (progn
      (setq bomHeader (strcat (chr 239) (chr 187) (chr 191) "Hang_Muc,Ten_Chi_Tiet,Dai,Rong,Day,So_Luong,Ma_Vat_Lieu,Dan_Canh"))
      (write-line bomHeader f)
      (foreach entry (reverse aggList)
        (setq qty (nth 1 entry))
        (setq r (nth 2 entry))
        (write-line
          (strcat
            (nth 0 r) ","
            (nth 1 r) ","
            (itoa (nth 2 r)) ","
            (itoa (nth 3 r)) ","
            (itoa (nth 4 r)) ","
            (itoa qty) ","
            (nth 5 r) ","
            (nth 6 r)
          )
          f
        )
      )
      (close f)
      (princ (strcat "\n>>> Đã xuất thành công file CSV: " csvPath))
    )
  )

  (princ "\n-----------------------------------------------------------------")
  (princ "\nBẢNG KẾT QUẢ BÓC TÁCH CHI TIẾT:")
  (foreach entry (reverse aggList)
    (setq qty (nth 1 entry))
    (setq r (nth 2 entry))
    (princ
      (strcat
        "\n  • " (nth 1 r)
        " | " (itoa (nth 2 r)) "x" (itoa (nth 3 r)) "x" (itoa (nth 4 r)) " mm"
        " | Số lượng: " (itoa qty) " tấm"
        " | Vật tư: " (nth 5 r)
        " | Dán chỉ: " (nth 6 r)
      )
    )
  )
  (princ "\n=================================================================\n")
  (princ)
)

(Run-Full-Cutlist-Test)
