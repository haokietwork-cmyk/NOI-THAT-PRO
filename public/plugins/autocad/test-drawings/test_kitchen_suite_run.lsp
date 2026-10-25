(defun Run-Kitchen-Suite-Test ( / ss count i ent elist entType pts item numPts
                                   lenMm widMm thkMm matCode edgeCode p0 p1 p2 d1 d2
                                   minX maxX minY maxY rawList aggList totalParts totalRows
                                   key found entry csvPath f partName modName noiseFiltered)
  (princ "\n=================================================================")
  (princ "\n   KIỂM THỬ THỰC CHIẾN CADCRAFT: HỆ BẾP CHỮ L & ĐẢO BẾP (54 ĐỐI TƯỢNG)")
  (princ "\n=================================================================")

  (setq ss (ssget "X" '((0 . "LWPOLYLINE,POLYLINE,3DSOLID,INSERT"))))
  (setq count (sslength ss))
  (princ (strcat "\n>>> 1. QUÉT HÌNH HỌC: Phát hiện " (itoa count) " thực thể."))

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
          ;; Tính vector cạnh thực tế (chống xoay góc 45 độ)
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

    ;; Lọc rác: Bỏ qua chi tiết <= 50x30mm
    (if (or (<= lenMm 50) (<= widMm 30))
      (setq noiseFiltered (1+ noiseFiltered))
      (progn
        ;; Gán tên chi tiết theo kích thước
        (setq partName
          (cond
            ((and (= lenMm 2400) (= widMm 580))             "Day_Tu_Bep_Duoi_Dai")
            ((and (= lenMm 1200) (= widMm 580))             "Day_Tu_Goc_L")
            ((and (= lenMm 810)  (= widMm 580) (= numPts 4))"Hoi_Tu_Bep_Duoi")
            ((and (= lenMm 810)  (= widMm 580) (> numPts 4))"Hoi_Khoet_Xiphong_Nuoc")
            ((and (= lenMm 780)  (= widMm 395))             "Canh_Tu_Bep_Duoi")
            ((and (= lenMm 500)  (= widMm 180))             "Thanh_Hop_Ngan_Keo")
            ((and (= lenMm 350)  (= widMm 180))             "Dau_Duoi_Ngan_Keo")
            ((and (= lenMm 750)  (= widMm 350))             "Hoi_Tu_Bep_Tren")
            ((and (= lenMm 2400) (= widMm 350))             "Dinh_Day_Tu_Bep_Tren")
            ((and (= lenMm 574)  (= widMm 330))             "Dot_Tu_Bep_Tren")
            ((and (= lenMm 745)  (= widMm 395))             "Canh_Tu_Bep_Tren")
            ((and (= lenMm 2380) (= widMm 790))             "Hau_Bep_Duoi_6mm")
            ((and (= lenMm 2380) (= widMm 730))             "Hau_Bep_Tren_6mm")
            ((and (= lenMm 1600) (= widMm 800))             "Mat_Ban_Dao_25mm")
            ((and (= lenMm 810)  (= widMm 780))             "Hoi_Ban_Dao")
            ((and (= lenMm 1566) (= widMm 780))             "Day_Ban_Dao")
            ((and (= lenMm 780)  (= widMm 385))             "Canh_Tu_Dao")
            ((and (= lenMm 600)  (= widMm 450))             "Vach_Goc_Vat_45Do")
            (t (strcat "Chi_Tiet_Bep_" (itoa (1+ i))))
          )
        )

        ;; Phân loại Hạng mục
        (setq modName
          (cond
            ((wcmatch partName "*Bep_Duoi*") "Tu_Bep_Duoi")
            ((wcmatch partName "*Ngan_Keo*") "Tu_Bep_Duoi")
            ((wcmatch partName "*Xiphong*")  "Tu_Bep_Duoi")
            ((wcmatch partName "*Bep_Tren*") "Tu_Bep_Tren")
            ((wcmatch partName "*Ban_Dao*")  "Ban_Dao_Bep")
            ((wcmatch partName "*Tu_Dao*")   "Ban_Dao_Bep")
            (t "Goc_L_Lien_Ket")
          )
        )

        ;; Nhận diện vật tư và độ dày
        (setq thkMm
          (cond
            ((wcmatch partName "*6mm*") 6)
            ((wcmatch partName "*25mm*") 25)
            (t 17)
          )
        )

        (setq matCode
          (cond
            ((= thkMm 6)  "MDF_VAN_HAU_6")
            ((= thkMm 25) "MDF_CHONG_AM_25")
            (t "MDF_CHONG_AM_17")
          )
        )

        (setq edgeCode (if (= thkMm 6) "KHONG_DAN" "4_CANH"))

        (setq rawList (cons (list modName partName lenMm widMm thkMm matCode edgeCode) rawList))
      )
    )
    (setq i (1+ i))
  )

  (setq totalParts (length rawList))
  (princ (strcat "\n>>> 2. LỌC RÁC BẢN VẼ: Đã tự động lọc " (itoa noiseFiltered) " đối tượng rác (Bu lông/lỗ khoét <= 50x30mm)."))
  (princ (strcat "\n>>> 3. TẤM THỰC TẾ HỢP LỆ: " (itoa totalParts) " tấm ván."))

  ;; Thuật toán gom nhóm (Aggregation)
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
  (princ (strcat "\n>>> 4. GOM NHÓM (AGGREGATION): Tối ưu từ " (itoa totalParts) " tấm thành " (itoa totalRows) " dòng quy cách."))

  ;; Xuất file CSV UTF-8 BOM
  (setq csvPath "public/plugins/autocad/test-drawings/kitchen_island_cutlist.csv")
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
      (princ (strcat "\n>>> 5. XUẤT CSV THÀNH CÔNG: " csvPath))
    )
  )

  (princ "\n-----------------------------------------------------------------")
  (princ "\nBẢNG TỔNG HỢP GOM NHÓM QUY CÁCH TẤM:")
  (foreach entry (reverse aggList)
    (setq qty (nth 1 entry))
    (setq r (nth 2 entry))
    (princ
      (strcat
        "\n  • [" (nth 0 r) "] " (nth 1 r)
        " | " (itoa (nth 2 r)) "x" (itoa (nth 3 r)) "x" (itoa (nth 4 r)) " mm"
        " | SL: " (itoa qty) " tấm"
        " | Vật tư: " (nth 5 r)
      )
    )
  )
  (princ "\n=================================================================\n")
  (princ)
)

(Run-Kitchen-Suite-Test)
