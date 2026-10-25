(defun Run-Production-Cutlist-Test ( / ss count i ent elist entType pts item numPts
                                        lenMm widMm thkMm matCode edgeCode p0 p1 p2 d1 d2
                                        minX maxX minY maxY rawList aggList totalParts totalRows
                                        key found entry csvPath f partName noiseFiltered)
  (princ "\n=================================================================")
  (princ "\n   KIỂM THỬ SẢN XUẤT THỰC CHIẾN TRÊN CADCRAFT (34 ĐỐI TƯỢNG)    ")
  (princ "\n=================================================================")

  (setq ss (ssget "X" '((0 . "LWPOLYLINE,POLYLINE,3DSOLID,INSERT"))))
  (setq count (sslength ss))
  (princ (strcat "\n>>> Tổng số đối tượng quét được: " (itoa count)))

  (setq rawList nil)
  (setq noiseFiltered 0)
  (setq i 0)

  (while (< i count)
    (setq ent (ssname ss i))
    (setq elist (entget ent))
    (setq entType (cdr (assoc 0 elist)))

    (if (wcmatch entType "LWPOLYLINE,POLYLINE")
      (progn
        (setq pts nil)
        (foreach item elist
          (if (= (car item) 10) (setq pts (cons (cdr item) pts)))
        )
        (setq pts (reverse pts))
        (setq numPts (length pts))

        (if (= numPts 4)
          ;; Tính vector cạnh thực tế (chống sai lệch khi xoay góc)
          (progn
            (setq p0 (nth 0 pts))
            (setq p1 (nth 1 pts))
            (setq p2 (nth 2 pts))
            (setq d1 (distance p0 p1))
            (setq d2 (distance p1 p2))
            (setq lenMm (fix (+ 0.5 (max d1 d2))))
            (setq widMm (fix (+ 0.5 (min d1 d2))))
          )
          ;; Tấm khoét/giật cấp (> 4 đỉnh)
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

    ;; Lọc rác bản vẽ: Bỏ qua chi tiết < 50x30mm
    (if (or (<= lenMm 50) (<= widMm 30))
      (setq noiseFiltered (1+ noiseFiltered))
      (progn
        ;; Gán tên chi tiết theo kích thước chuẩn xưởng
        (setq partName
          (cond
            ((and (= lenMm 2600) (= widMm 600) (= numPts 4)) "Hoi_Ngoai_Tu_Ao")
            ((and (= lenMm 2600) (= widMm 600) (> numPts 4)) "Hoi_Khoet_Len_Tuong")
            ((and (= lenMm 2500) (= widMm 580))             "Hoi_Giua_Tu_Ao")
            ((and (= lenMm 2500) (= widMm 495))             "Canh_Mo_Tu_Ao")
            ((and (= lenMm 2000) (= widMm 600))             "Dinh_Day_Tu_Ao")
            ((and (= lenMm 974)  (= widMm 580))             "Dot_Tu_Ao")
            ((and (= lenMm 2200) (= widMm 580))             "Day_Tu_Bep_Duoi")
            ((and (= lenMm 810)  (= widMm 580))             "Hoi_Tu_Bep_Duoi")
            ((and (= lenMm 780)  (= widMm 545))             "Canh_Tu_Bep")
            ((and (= lenMm 450)  (= widMm 140))             "Thanh_Hop_Ngan_Keo")
            ((and (= lenMm 1200) (= widMm 450))             "Canh_Vat_Goc_45Do")
            ((and (= lenMm 900)  (= widMm 350))             "Tam_Nghieng_Goc_30Do")
            (t (strcat "Chi_Tiet_" (itoa (1+ i))))
          )
        )

        ;; Phân loại Hạng mục
        (setq modName
          (cond
            ((wcmatch partName "*Tu_Ao*") "Tu_Ao_Master")
            ((wcmatch partName "*Tu_Bep*") "Tu_Bep_Duoi")
            ((wcmatch partName "*Ngan_Keo*") "Tu_Bep_Duoi")
            (t "Module_Khac")
          )
        )

        (setq rawList (cons (list modName partName lenMm widMm 17 "MDF_CHONG_AM_17" "4_CANH") rawList))
      )
    )
    (setq i (1+ i))
  )

  (setq totalParts (length rawList))
  (princ (strcat "\n>>> Số rác/chi tiết nhỏ tự động lọc bỏ: " (itoa noiseFiltered) " đối tượng."))
  (princ (strcat "\n>>> Số tấm gỗ thực tế hợp lệ: " (itoa totalParts) " tấm."))

  ;; Thuật toán gom nhóm số lượng
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
  (princ (strcat "\n>>> Tối ưu hóa: Thu gọn từ " (itoa totalParts) " tấm thành " (itoa totalRows) " dòng Cutlist."))

  ;; Xuất file CSV UTF-8 BOM
  (setq csvPath "public/plugins/autocad/test-drawings/production_cutlist_output.csv")
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
      (princ (strcat "\n>>> Đã xuất file CSV chuẩn: " csvPath))
    )
  )

  (princ "\n-----------------------------------------------------------------")
  (princ "\nBẢNG BÓC TÁCH TỐI ƯU HÓA HOÀN CHỈNH:")
  (foreach entry (reverse aggList)
    (setq qty (nth 1 entry))
    (setq r (nth 2 entry))
    (princ
      (strcat
        "\n  [" (nth 0 r) "] " (nth 1 r)
        " | Quy cách: " (itoa (nth 2 r)) "x" (itoa (nth 3 r)) "x" (itoa (nth 4 r)) " mm"
        " | Số lượng: " (itoa qty) " tấm"
      )
    )
  )
  (princ "\n=================================================================\n")
  (princ)
)

(Run-Production-Cutlist-Test)
