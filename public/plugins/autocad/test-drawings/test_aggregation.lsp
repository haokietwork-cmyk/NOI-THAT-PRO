(defun Run-Aggregation-Test ( / ss count i ent elist pts item numPts p0 p1 p2 d1 d2 lenMm widMm thkMm rawList aggList key found entry)
  (setq ss (ssget "X" '((0 . "LWPOLYLINE,POLYLINE"))))
  (setq count (sslength ss))
  (setq rawList nil)

  (setq i 0)
  (while (< i count)
    (setq ent (ssname ss i))
    (setq elist (entget ent))
    (setq pts nil)
    (foreach item elist
      (if (= (car item) 10) (setq pts (cons (cdr item) pts)))
    )
    (setq pts (reverse pts))
    (setq numPts (length pts))

    (if (= numPts 4)
      (progn
        (setq p0 (nth 0 pts))
        (setq p1 (nth 1 pts))
        (setq p2 (nth 2 pts))
        (setq d1 (distance p0 p1))
        (setq d2 (distance p1 p2))
        (setq lenMm (fix (+ 0.5 (max d1 d2))))
        (setq widMm (fix (+ 0.5 (min d1 d2))))
      )
      (progn
        (setq minX (apply 'min (mapcar 'car pts)))
        (setq maxX (apply 'max (mapcar 'car pts)))
        (setq minY (apply 'min (mapcar 'cadr pts)))
        (setq maxY (apply 'max (mapcar 'cadr pts)))
        (setq lenMm (fix (+ 0.5 (max (- maxX minX) (- maxY minY)))))
        (setq widMm (fix (+ 0.5 (min (- maxX minX) (- maxY minY)))))
      )
    )

    ;; Gia lap ten chi tiet theo kich thuoc
    (setq partName
      (cond
        ((and (= lenMm 2400) (= widMm 600)) "Hoi_Tu")
        ((and (= lenMm 1800) (= widMm 600)) "Day_Tu")
        ((and (= lenMm 866) (= widMm 580))  "Dot_Di_Dong")
        (t "Tam_Khac")
      )
    )

    (setq rawList (cons (list "Tu_Ao_Master" partName lenMm widMm 17 "MDF_CHONG_AM_17" "4_CANH") rawList))
    (setq i (1+ i))
  )

  (princ (strcat "\n>>> SO LUONG BAN DAU (CHUA GOM NHOM): " (itoa (length rawList)) " tam."))

  ;; THUAT TOAN GOM NHOM (AGGREGATION)
  (setq aggList nil)
  (foreach row (reverse rawList)
    (setq key (strcat (nth 0 row) "|" (nth 1 row) "|" (itoa (nth 2 row)) "|" (itoa (nth 3 row)) "|" (itoa (nth 4 row)) "|" (nth 5 row) "|" (nth 6 row)))
    (setq found (assoc key aggList))
    (if found
      ;; Neu da co: Tang so luong qty len 1
      (setq aggList (subst (list key (1+ (cadr found)) row) found aggList))
      ;; Neu chua co: Them moi voi qty = 1
      (setq aggList (cons (list key 1 row) aggList))
    )
  )

  (princ (strcat "\n>>> SO DONG SAU KHI GOM NHOM: " (itoa (length aggList)) " dong."))
  (princ "\n-----------------------------------------------------------------")
  (princ "\nKET QUA CUTLIST SAU KHI GOM NHOM:")
  (foreach entry (reverse aggList)
    (setq qty (nth 1 entry))
    (setq r (nth 2 entry))
    (princ
      (strcat
        "\n- " (nth 1 r)
        " | Kich thuoc: " (itoa (nth 2 r)) "x" (itoa (nth 3 r)) "x" (itoa (nth 4 r)) "mm"
        " | So luong (Qty): " (itoa qty) " tam"
        " | Vat tu: " (nth 5 r)
      )
    )
  )
  (princ "\n-----------------------------------------------------------------\n")
  (princ)
)

(Run-Aggregation-Test)
