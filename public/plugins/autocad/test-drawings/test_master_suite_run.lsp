(defun Run-Master-Suite-Test ( / ss count i ent elist entType pts item numPts
                                   lenMm widMm thkMm matCode edgeCode p0 p1 p2 d1 d2
                                   minX maxX minY maxY rawList aggList totalParts totalRows
                                   key found entry csvPath f partName modName noiseFiltered)
  (princ "\n=================================================================")
  (princ "\n   KIỂM THỬ THỰC CHIẾN CADCRAFT: CĂN HỘ MASTER SUITE (35 ĐỐI TƯỢNG)")
  (princ "\n=================================================================")

  (setq ss (ssget "X" '((0 . "LWPOLYLINE,POLYLINE,3DSOLID,INSERT"))))
  (setq count (sslength ss))
  (princ (strcat "\n>>> 1. QUÉT ĐỐI TƯỢNG: Tìm thấy " (itoa count) " thực thể hình học."))

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
          ;; Tính vector cạnh thực tế (chống xoay góc)
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

    ;; Lọc rác bản vẽ: Bỏ qua các đối tượng có kích thước <= 50x30mm
    (if (or (<= lenMm 50) (<= widMm 30))
      (setq noiseFiltered (1+ noiseFiltered))
      (progn
        ;; Gán tên chi tiết chuyên ngành xưởng
        (setq partName
          (cond
            ((and (= lenMm 2000) (= widMm 1000))            "Dau_Giuong_Master")
            ((and (= lenMm 2000) (= widMm 350))             "Vai_Giuong_Master")
            ((and (= lenMm 1800) (= widMm 350))             "Duoi_Giuong_Master")
            ((and (= lenMm 1950) (= widMm 890))             "Giat_Giuong_Phan_Nam")
            ((and (= lenMm 500)  (= widMm 160))             "Thanh_Hop_Ngan_Keo_Giuong")
            ((and (= lenMm 400)  (= widMm 160))             "Dau_Duoi_Ngan_Keo_Giuong")
            ((and (= lenMm 1100) (= widMm 450))             "Mat_Day_Ban_Trang_Diem")
            ((and (= lenMm 450)  (= widMm 180))             "Hoi_Ban_Trang_Diem")
            ((and (= lenMm 545)  (= widMm 175))             "Canh_Hoc_Ban_Trang_Diem")
            ((and (= lenMm 1100) (= widMm 700))             "Vach_Nan_Trang_Diem")
            ((and (= lenMm 1800) (= widMm 350))             "Dinh_Day_Ke_Tivi")
            ((and (= lenMm 350)  (= widMm 300))             "Hoi_Ke_Tivi")
            ((and (= lenMm 350)  (= widMm 266))             "Vach_Ngan_Ke_Tivi")
            ((and (= lenMm 595)  (= widMm 295))             "Canh_Mo_Ke_Tivi")
            ((and (= lenMm 1780) (= widMm 280))             "Hau_Ke_Tivi_6mm")
            ((and (= lenMm 800)  (= widMm 400))             "Vach_Goc_Vat_45Do")
            ((and (= lenMm 2000) (= widMm 600) (> numPts 4))"Vach_Khoet_ODien_LenTuong")
            (t (strcat "Chi_Tiet_Tam_" (itoa (1+ i))))
          )
        )

        ;; Phân loại hạng mục
        (setq modName
          (cond
            ((wcmatch partName "*Giuong*")    "Giuong_Ngu_Master")
            ((wcmatch partName "*Trang_Diem*") "Ban_Trang_Diem")
            ((wcmatch partName "*Tivi*")       "Ke_Tivi_Phong_Ngu")
            (t "Vach_Trang_Tri")
          )
        )

        ;; Nhận diện vật tư
        (setq matCode
          (cond
            ((wcmatch partName "*Hau*") "MDF_VAN_HAU_6")
            (t "MDF_CHONG_AM_17")
          )
        )
        (setq thkMm (if (wcmatch partName "*Hau*") 6 17))
        (setq edgeCode (if (wcmatch partName "*Hau*") "KHONG_DAN" "4_CANH"))

        (setq rawList (cons (list modName partName lenMm widMm thkMm matCode edgeCode) rawList))
      )
    )
    (setq i (1+ i))
  )

  (setq totalParts (length rawList))
  (princ (strcat "\n>>> 2. LỌC RÁC: Đã tự động lọc " (itoa noiseFiltered) " đối tượng rác (Lỗ khoan/vít 25x25, 30x20)."))
  (princ (strcat "\n>>> 3. CHI TIẾT TẤM THỰC TẾ: " (itoa totalParts) " tấm ván."))

  ;; Thuật toán gom nhóm
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
  (princ (strcat "\n>>> 4. GOM NHÓM (AGGREGATION): Tối ưu từ " (itoa totalParts) " tấm thành " (itoa totalRows) " dòng Cutlist."))

  ;; Xuất file CSV UTF-8 BOM
  (setq csvPath "public/plugins/autocad/test-drawings/master_suite_cutlist.csv")
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
      (princ (strcat "\n>>> 5. XUẤT FILE: Đã xuất thành công: " csvPath))
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

(Run-Master-Suite-Test)
