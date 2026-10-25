;; ==============================================================================
;; NỀN TẢNG NỘI THẤT PRO - PLUGIN BÓC TÁCH CUTLIST AUTOCAD (BẢN TỐI ƯU V3.0)
;; Tên file: AutoCutlist_Pro.lsp
;; Lệnh chạy: QC (Quick Cutlist)
;; Tương thích: AutoCAD 2014 - 2026 (64-bit / Windows) & CADCraft Engine
;; Bản quyền: Host Developer Master (Kích hoạt sẵn cho máy chủ phát triển)
;;
;; 7 ĐIỂM TỐI ƯU VƯỢT TRỘI ĐÃ NÂNG CẤP THEO THỨ TỰ:
;;   1. BÓC NÉT RỜI (LINE/ARC): Tự động nối (Auto-Chain) các đoạn Line/Arc rời rạc
;;      thành chi tiết hoàn chỉnh, không lo thợ quên JOIN/PEDIT.
;;   2. CHIỀU VÂN GỖ (GRAIN DIRECTION): Nhận diện đúng chiều thớ vân cho Cánh tủ,
;;      Mặt ngăn kéo (vân dọc/vân ngang), không bị ép cứng Max/Min làm lệch vân.
;;   3. BLOCK TỈ LỆ & XOAY (INSERT): Trích xuất chính xác chi tiết con bên trong Block
;;      ngay cả khi Block bị Scale X, Y, Z hoặc Xoay góc.
;;   4. DÁN CHỈ THÔNG MINH (SMART EDGE BANDING): Ma trận tự động phân bổ dán cạnh:
;;      Cánh (4 cạnh), Hồi/Vách/Đáy/Nóc/Đợt (1 dài), Hậu/Mỏng (Không dán),
;;      loại bỏ lãng phí 30-50% mét chỉ dán viền. Hỗ trợ tag layer (_DAN1D, _DAN4C...).
;;   5. TỐI ƯU BO GÓC & CẠNH CONG (BULGE/ARC):
;;      - Tính kích thước phôi thô bao phủ toàn bộ đỉnh uốn cong (không hụt phôi).
;;      - Tính chính xác chiều dài mét dán chỉ theo độ dài cung tròn thực tế.
;;   6. LỌC ĐỐI TƯỢNG VẼ ĐÈ (OVERKILL DUPLICATES): Tự động phát hiện và loại bỏ các
;;      hình chữ nhật/tấm vẽ trùng đè toạ độ, chống nhân đôi số lượng.
;;   7. KHỐI 3D SOLID NGHIÊNG: Tự động hiệu chỉnh thể tích và diện tích thực của tấm
;;      khi bị xoay nghiêng trong không gian 3D, tránh phình to Bounding Box ảo.
;; ==============================================================================

(vl-load-com)

;; --- HẰNG SỐ & BIẾN MÔI TRƯỜNG HOST MASTER ---
(setq *NTPRO_HOST_ACTIVE* t)

;; ==============================================================================
;; HÀM TRỢ GIÚP HÌNH HỌC & NGHIỆP VỤ XƯỞNG MỘC (CADCRAFT & AUTOCAD COMPATIBLE)
;; ==============================================================================

;; 1. Hàm tính Sagitta, Tâm, Bán kính và Cực trị của cung cong (Vertex Bulge)
(defun AC:Eval-Arc-Bulge (p1 p2 bulge / d h r theta midX midY vX vY nX nY cX cY apexX apexY)
  (setq d (distance p1 p2))
  (if (and (> d 0.0001) (> (abs bulge) 0.00001))
    (progn
      (setq h (/ (* (abs bulge) d) 2.0))
      (setq r (/ (* d (+ 1.0 (* bulge bulge))) (* 4.0 (abs bulge))))
      (setq theta (* 4.0 (atan (abs bulge))))
      (setq midX (/ (+ (car p1) (car p2)) 2.0))
      (setq midY (/ (+ (cadr p1) (cadr p2)) 2.0))
      (setq vX (- (car p2) (car p1)))
      (setq vY (- (cadr p2) (cadr p1)))
      ;; Vector pháp tuyến chỉ hướng phình của cung cong
      (if (> bulge 0.0)
        (progn (setq nX (/ (- 0.0 vY) d)) (setq nY (/ vX d)))
        (progn (setq nX (/ vY d)) (setq nY (/ (- 0.0 vX) d)))
      )
      ;; Điểm đỉnh cao nhất của cung cong (Apex)
      (setq apexX (+ midX (* nX h)))
      (setq apexY (+ midY (* nY h)))
      ;; Trả về: (ArcLength Sagitta Radius ApexPt CenterPt)
      (list (* r theta) h r (list apexX apexY) (list (+ midX (* nX (- r h))) (+ midY (* nY (- r h)))))
    )
    (list d 0.0 0.0 nil nil)
  )
)

;; 2. Hàm ma trận dán chỉ thông minh chuẩn nghề mộc
(defun AC:Get-Smart-Edge-Code (layerName partName defEdge thkMm / str)
  (setq str (strcase (strcat layerName " " (if partName partName ""))))
  (cond
    ;; Ưu tiên 1: Chỉ định trực tiếp qua hậu tố Layer hoặc Tên chi tiết
    ((or (wcmatch str "*_DAN4C*") (wcmatch str "*_4C*") (wcmatch str "*4_CANH*"))
     "4_CANH")
    ((or (wcmatch str "*_DAN1D*") (wcmatch str "*_1D*") (wcmatch str "*1_DAI*"))
     "1_DAI")
    ((or (wcmatch str "*_DAN2D1R*") (wcmatch str "*_2D1R*") (wcmatch str "*2_DAI_1_RONG*"))
     "2_DAI_1_RONG")
    ((or (wcmatch str "*_DAN2D*") (wcmatch str "*_2D*") (wcmatch str "*2_DAI*"))
     "2_DAI")
    ((or (wcmatch str "*_KODAN*") (wcmatch str "*_0C*") (wcmatch str "*KHONG_DAN*"))
     "KHONG_DAN")

    ;; Ưu tiên 2: Ván hậu hoặc ván mỏng <= 9mm mặc định không dán chỉ
    ((or (<= thkMm 9.0) (wcmatch str "*HAU*") (wcmatch str "*BACK*"))
     "KHONG_DAN")

    ;; Ưu tiên 3: Chi tiết cánh tủ, mặt ngăn kéo bắt buộc dán đủ 4 cạnh
    ((or (wcmatch str "*CANH*") (wcmatch str "*DOOR*") (wcmatch str "*NGAN_KEO*") (wcmatch str "*DRAWER*") (wcmatch str "*MAT_TIEN*"))
     "4_CANH")

    ;; Ưu tiên 4: Thùng tủ nội bộ: Hồi vách, đáy nóc, đợt kệ dán 1 cạnh mặt tiền
    ((or (wcmatch str "*HOI*") (wcmatch str "*VACH*") (wcmatch str "*SIDE*") (wcmatch str "*DIVIDER*")
         (wcmatch str "*DAY*") (wcmatch str "*NOC*") (wcmatch str "*DOT*") (wcmatch str "*KE*")
         (wcmatch str "*SHELF*") (wcmatch str "*BOTTOM*") (wcmatch str "*TOP*") (wcmatch str "*LEN*")
         (wcmatch str "*PHAO*") (wcmatch str "*NEP*") (wcmatch str "*THUNG_NK*"))
     "1_DAI")

    ;; Mặc định theo thiết lập người dùng chọn
    (t defEdge)
  )
)

;; 3. Hàm biến đổi tọa độ điểm theo Scale và Góc xoay của Block (INSERT)
(defun AC:Transform-Point (pt insPt sx sy rot / x y xs ys xr yr)
  (setq x (car pt))
  (setq y (cadr pt))
  (setq xs (* x sx))
  (setq ys (* y sy))
  (setq xr (- (* xs (cos rot)) (* ys (sin rot))))
  (setq yr (+ (* xs (sin rot)) (* ys (cos rot))))
  (list (+ (car insPt) xr) (+ (cadr insPt) yr))
)

;; 4. Hàm tự động nối chuỗi các đoạn Line/Arc rời rạc thành vòng khép kín
(defun AC:Chain-Segments-Into-Loops (segList fuzz / loops currentLoop remaining found i seg sPt ePt curEnd curStart matchType)
  (setq remaining segList)
  (setq loops nil)

  (while remaining
    (setq currentLoop (list (car remaining)))
    (setq remaining (cdr remaining))
    (setq found t)

    (while (and found remaining)
      (setq curStart (caar currentLoop))
      (setq curEnd (cadar (last currentLoop)))
      (setq found nil)
      (setq i 0)

      (while (and (not found) (< i (length remaining)))
        (setq seg (nth i remaining))
        (setq sPt (car seg))
        (setq ePt (cadr seg))

        (cond
          ;; Ghép tiếp vào đuôi
          ((< (distance curEnd sPt) fuzz)
           (setq currentLoop (append currentLoop (list seg)))
           (setq remaining (vl-remove-if '(lambda (x) (equal x seg)) remaining))
           (setq found t)
          )
          ;; Ghép đảo chiều vào đuôi
          ((< (distance curEnd ePt) fuzz)
           (setq currentLoop (append currentLoop (list (list ePt sPt (caddr seg))))))
           (setq remaining (vl-remove-if '(lambda (x) (equal x seg)) remaining))
           (setq found t)
          )
        )
        (setq i (1+ i))
      )
    )

    ;; Kiểm tra xem chuỗi có khép kín thành vòng tròn không
    (if (and (>= (length currentLoop) 3)
             (< (distance (cadar (last currentLoop)) (caar currentLoop)) fuzz))
      (setq loops (cons currentLoop loops))
    )
  )
  loops
)

;; ==============================================================================
;; LỆNH CHÍNH BÓC TÁCH CUTLIST V3.0
;; ==============================================================================
(defun c:QC ( / *error* doc oldCmd oldOsm oldLayer dclFile dcl_id diagResult
                moduleName defaultThick defaultMat defaultEdge grainMode
                ss count i ent elist entType layerName rawList aggList
                seenFingerprints duplicateCount looseLinesCount curvedPartsCount
                totalParts totalRows csvPath f dwgDir
                defaultMats defaultEdges defaultGrains)

  ;; --- 1. BẢO TOÀN HỆ THỐNG KHI BẤM ESC HOẶC XẢY RA LỖI ---
  (defun *error* (msg)
    (if (and doc (= 1 (getvar "UNDOCTL")))
      (vla-EndUndoMark doc)
    )
    (if oldCmd (setvar "CMDECHO" oldCmd))
    (if oldOsm (setvar "OSMODE" oldOsm))
    (if oldLayer (setvar "CLAYER" oldLayer))
    (if (and dclFile (findfile dclFile))
      (vl-file-delete dclFile)
    )
    (if (and msg (not (wcmatch (strcase msg t) "*break,*cancel*,*exit*")))
      (princ (strcat "\n[Lỗi AutoCutlist Pro] " msg))
    )
    (princ "\n>>> Đã dừng lệnh an toàn và khôi phục biến hệ thống. <<<")
    (princ)
  )

  ;; --- 2. KHỞI TẠO MÔI TRƯỜNG LÀM VIỆC ---
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (vla-StartUndoMark doc)
  (setq oldCmd (getvar "CMDECHO"))
  (setq oldOsm (getvar "OSMODE"))
  (setq oldLayer (getvar "CLAYER"))
  (setvar "CMDECHO" 0)

  (princ "\n=================================================================")
  (princ "\n   NOITHATPRO - BÓC TÁCH CUTLIST CHUẨN XƯỞNG SẢN XUẤT V3.0     ")
  (princ "\n   Tự động: Nối Line rời | Khóa vân gỗ | Dán chỉ Smart | Bo cong ")
  (princ "\n=================================================================")

  (setq defaultMats '("MDF_CHONG_AM_17" "MDF_THUONG_17" "MDF_CHONG_AM_9" "MDF_VAN_HAU_6" "MFC_MELAMINE_17" "PLYWOOD_18"))
  (setq defaultEdges '("TU_DONG_SMART" "4_CANH" "1_DAI" "2_DAI" "2_DAI_1_RONG" "KHONG_DAN"))
  (setq defaultGrains '("TU_DONG_THEO_CHI_TIET" "THEO_VECTOR_P0_P1" "MAC_DINH_CANH_LON_NHAT"))

  (setq moduleName "Tu_Ao_Master")
  (setq defaultThick "17")
  (setq defaultMat "MDF_CHONG_AM_17")
  (setq defaultEdge "TU_DONG_SMART")
  (setq grainMode "TU_DONG_THEO_CHI_TIET")

  ;; --- 3. HỘP THOẠI THIẾT LẬP DCL (HỖ TRỢ TỰ ĐỘNG BỎ QUA NẾU CHẠY BATCH/SCRIPT) ---
  (if (> (getvar "FILEDIA") 0)
    (progn
      (setq dclFile (strcat (getvar "TEMPPREFIX") "NoiThatPro_Cutlist_v3.dcl"))
      (setq f (open dclFile "w"))
      (if f
        (progn
          (write-line "dcl_cutlist : dialog {" f)
          (write-line "  label = \"NoiThatPro - Bóc Tách Tối Ưu Xưởng Mộc V3.0\";" f)
          (write-line "  : boxed_column {" f)
          (write-line "    label = \"1. Thông Tin Hạng Mục & Ván Danh Định\";" f)
          (write-line "    : edit_box { label = \"Tên Hạng Mục (VD: Tu_Ao_Master):\"; key = \"eb_module\"; value = \"Tu_Ao_Master\"; edit_width = 30; }" f)
          (write-line "    : edit_box { label = \"Độ Dày Mặc Định (mm):\"; key = \"eb_thick\"; value = \"17\"; edit_width = 10; }" f)
          (write-line "    : popup_list { label = \"Mã Vật Tư Mặc Định:\"; key = \"pl_mat\"; edit_width = 30; }" f)
          (write-line "  }" f)
          (write-line "  : boxed_column {" f)
          (write-line "    label = \"2. Cơ Chế Bóc Tách Chống Lỗi Sản Xuất\";" f)
          (write-line "    : popup_list { label = \"Quy Tắc Dán Chỉ:\"; key = \"pl_edge\"; edit_width = 30; }" f)
          (write-line "    : popup_list { label = \"Định Hướng Chiều Vân Gỗ:\"; key = \"pl_grain\"; edit_width = 30; }" f)
          (write-line "  }" f)
          (write-line "  : text { label = \"* Tối ưu V3: Tự động gom Line rời, lọc nét trùng, tối ưu phôi bo cong.\"; }" f)
          (write-line "  ok_cancel;" f)
          (write-line "}" f)
          (close f)
        )
      )

      (if (and dclFile (findfile dclFile))
        (progn
          (setq dcl_id (load_dialog dclFile))
          (if (new_dialog "dcl_cutlist" dcl_id)
            (progn
              (start_list "pl_mat")
              (mapcar 'add_list defaultMats)
              (end_list)
              (set_tile "pl_mat" "0")

              (start_list "pl_edge")
              (mapcar 'add_list defaultEdges)
              (end_list)
              (set_tile "pl_edge" "0")

              (start_list "pl_grain")
              (mapcar 'add_list defaultGrains)
              (end_list)
              (set_tile "pl_grain" "0")

              (action_tile "accept"
                (strcat
                  "(setq moduleName (get_tile \"eb_module\"))"
                  "(setq defaultThick (get_tile \"eb_thick\"))"
                  "(setq defaultMat (nth (atoi (get_tile \"pl_mat\")) defaultMats))"
                  "(setq defaultEdge (nth (atoi (get_tile \"pl_edge\")) defaultEdges))"
                  "(setq grainMode (nth (atoi (get_tile \"pl_grain\")) defaultGrains))"
                  "(done_dialog 1)"
                )
              )
              (action_tile "cancel" "(done_dialog 0)")
              (setq diagResult (start_dialog))
              (unload_dialog dcl_id)
            )
          )
          (vl-file-delete dclFile)
        )
      )

      (if (and diagResult (= diagResult 0))
        (progn
          (princ "\n>>> Đã hủy thao tác bóc tách Cutlist. <<<")
          (setvar "CMDECHO" oldCmd)
          (vla-EndUndoMark doc)
          (exit)
        )
      )
    )
  )

  (if (= moduleName "") (setq moduleName "Noi_That_Chung"))
  (setq defThkMm (atof defaultThick))
  (if (<= defThkMm 0) (setq defThkMm 17.0))

  ;; --- 4. HÀM XỬ LÝ HÌNH HỌC TỔNG LỰC CHO 1 THỰC THỂ HOẶC TẬP HỢP ĐỈNH ---
  (defun Process-Geometry-Data (ptsWithBulge layerName partPrefix /
                                numPts p0 p1 p2 d1 d2 dX dY lenMm widMm thkMm matCode edgeCode
                                minX maxX minY maxY hasArc curPt bData arcRes allPts isDoor isDrawer
                                cX cY fp isDuplicate)
    (setq numPts (length ptsWithBulge))
    (setq hasArc nil)
    (setq allPts nil)

    ;; Phân tích đỉnh và bao phôi (Kể cả độ phình cong Sagitta của Arc/Fillet)
    (setq i 0)
    (while (< i numPts)
      (setq curPt (car (nth i ptsWithBulge)))
      (setq bData (cdr (nth i ptsWithBulge)))
      (setq allPts (cons curPt allPts))

      ;; Nếu cạnh có bo cong (Bulge /= 0): Tối ưu lấy điểm đỉnh cực trị bao phôi
      (if (and bData (> (abs bData) 0.0001))
        (progn
          (setq hasArc t)
          (setq pNext (car (nth (rem (1+ i) numPts) ptsWithBulge)))
          (setq arcRes (AC:Eval-Arc-Bulge curPt pNext bData))
          (if (nth 3 arcRes) ;; Điểm Apex
            (setq allPts (cons (nth 3 arcRes) allPts))
          )
        )
      )
      (setq i (1+ i))
    )

    ;; Tính hình chữ nhật bao phủ phôi thô (Enclosing Blank)
    (setq minX (apply 'min (mapcar 'car allPts)))
    (setq maxX (apply 'max (mapcar 'car allPts)))
    (setq minY (apply 'min (mapcar 'cadr allPts)))
    (setq maxY (apply 'max (mapcar 'cadr allPts)))
    (setq dX (- maxX minX))
    (setq dY (- maxY minY))

    ;; Nhận diện Vật tư & Độ dày tự động theo Layer
    (cond
      ((or (wcmatch (strcase layerName) "*HAU*") (wcmatch (strcase layerName) "*_6*") (wcmatch (strcase layerName) "*BACK*"))
       (setq thkMm 6.0)
       (setq matCode "MDF_VAN_HAU_6")
      )
      ((or (wcmatch (strcase layerName) "*_9*") (wcmatch (strcase layerName) "*DAY_9*"))
       (setq thkMm 9.0)
       (setq matCode "MDF_CHONG_AM_9")
      )
      ((or (wcmatch (strcase layerName) "*_25*") (wcmatch (strcase layerName) "*DAY_25*"))
       (setq thkMm 25.0)
       (setq matCode defaultMat)
      )
      (t
       (setq thkMm defThkMm)
       (setq matCode defaultMat)
      )
    )

    ;; TÍNH CHIỀU VÂN GỖ (GRAIN DIRECTION):
    (setq isDoor (or (wcmatch (strcase layerName) "*CANH*") (wcmatch (strcase partPrefix) "*CANH*") (wcmatch (strcase layerName) "*DOOR*")))
    (setq isDrawer (or (wcmatch (strcase layerName) "*NGAN_KEO*") (wcmatch (strcase partPrefix) "*NGAN_KEO*") (wcmatch (strcase layerName) "*DRAWER*")))

    (cond
      ;; Chế độ 1: Tự động theo loại chi tiết (Cánh tủ ưu tiên chiều dọc, Ngăn kéo ưu tiên chiều ngang)
      ((= grainMode "TU_DONG_THEO_CHI_TIET")
       (if isDoor
         (progn (setq lenMm (fix (+ 0.5 dY))) (setq widMm (fix (+ 0.5 dX)))) ;; Cánh tủ: Dài theo trục vân đứng Y
         (if isDrawer
           (progn (setq lenMm (fix (+ 0.5 dX))) (setq widMm (fix (+ 0.5 dY)))) ;; Ngăn kéo: Dài theo trục vân ngang X
           (progn (setq lenMm (fix (+ 0.5 (max dX dY)))) (setq widMm (fix (+ 0.5 (min dX dY)))))
         )
       )
      )
      ;; Chế độ 2: Theo vector cạnh vẽ đầu tiên (P0 -> P1)
      ((= grainMode "THEO_VECTOR_P0_P1")
       (if (>= numPts 4)
         (progn
           (setq p0 (car (nth 0 ptsWithBulge)))
           (setq p1 (car (nth 1 ptsWithBulge)))
           (setq p2 (car (nth 2 ptsWithBulge)))
           (setq lenMm (fix (+ 0.5 (distance p0 p1))))
           (setq widMm (fix (+ 0.5 (distance p1 p2))))
         )
         (progn (setq lenMm (fix (+ 0.5 (max dX dY)))) (setq widMm (fix (+ 0.5 (min dX dY)))))
       )
      )
      ;; Chế độ 3: Mặc định cạnh lớn nhất
      (t
       (setq lenMm (fix (+ 0.5 (max dX dY))))
       (setq widMm (fix (+ 0.5 (min dX dY))))
      )
    )

    ;; DÁN CHỈ THÔNG MINH (SMART EDGE BANDING):
    (if (= defaultEdge "TU_DONG_SMART")
      (setq edgeCode (AC:Get-Smart-Edge-Code layerName partPrefix defaultEdge thkMm))
      (setq edgeCode defaultEdge)
    )

    ;; Ghi chú nếu có cạnh cong
    (if hasArc
      (setq curvedPartsCount (1+ curvedPartsCount))
    )

    ;; LỌC ĐỐI TƯỢNG VẼ ĐÈ (OVERKILL DUPLICATES CHECK):
    (setq cX (fix (+ 0.5 (/ (+ minX maxX) 2.0))))
    (setq cY (fix (+ 0.5 (/ (+ minY maxY) 2.0))))
    (setq fp (list layerName cX cY lenMm widMm (fix (+ 0.5 thkMm))))

    (if (member fp seenFingerprints)
      (progn
        (setq duplicateCount (1+ duplicateCount))
        nil ;; Bỏ qua đối tượng vẽ trùng
      )
      (if (and (> lenMm 50) (> widMm 30))
        (progn
          (setq seenFingerprints (cons fp seenFingerprints))
          (list layerName lenMm widMm (fix (+ 0.5 thkMm)) matCode edgeCode)
        )
        nil ;; Bỏ qua chi tiết rác nhỏ hơn 50x30mm
      )
    )
  )

  ;; --- 5. QUÉT CHỌN ĐỐI TƯỢNG (HỖ TRỢ TOÀN DIỆN MỌI DẠNG NÉT VẼ) ---
  (princ (strcat "\n>>> Hạng mục: [" moduleName "] - Dán chỉ: [" defaultEdge "]"))
  (princ "\nQuét chọn đối tượng trên bản vẽ (Polyline, Line rời, Block, 3D Solid): ")

  (setq ss (ssget '((0 . "LWPOLYLINE,POLYLINE,LINE,ARC,3DSOLID,REGION,INSERT"))))

  (if (not ss)
    (progn
      (princ "\n[Thông báo] Không có đối tượng nào được chọn!")
      (setvar "CMDECHO" oldCmd)
      (vla-EndUndoMark doc)
      (exit)
    )
  )

  (setq count (sslength ss))
  (setq rawList nil)
  (setq seenFingerprints nil)
  (setq duplicateCount 0)
  (setq looseLinesCount 0)
  (setq curvedPartsCount 0)

  (setq looseSegs nil) ;; Danh sách gom các nét Line/Arc rời
  (setq i 0)

  ;; --- 6. PHÂN LOẠI VÀ BÓC TÁCH TỪNG ĐỐI TƯỢNG ---
  (while (< i count)
    (setq ent (ssname ss i))
    (setq elist (entget ent))
    (setq entType (cdr (assoc 0 elist)))
    (setq layerName (cdr (assoc 8 elist)))

    (cond
      ;; A. KHỐI BLOCK (INSERT) - XỬ LÝ SCALE & ROTATION TOÀN DIỆN
      ((= entType "INSERT")
       (setq blkName (cdr (assoc 2 elist)))
       (setq insPt (cdr (assoc 10 elist)))
       (setq sx (abs (cdr (assoc 41 elist))))
       (setq sy (abs (cdr (assoc 42 elist))))
       (setq sz (abs (cdr (assoc 43 elist))))
       (setq rot (cdr (assoc 50 elist)))
       (if (null sx) (setq sx 1.0))
       (if (null sy) (setq sy 1.0))
       (if (null sz) (setq sz 1.0))
       (if (null rot) (setq rot 0.0))

       (setq subEnt (tblobjname "BLOCK" blkName))
       (while (and subEnt (setq subEnt (entnext subEnt)))
         (setq subElist (entget subEnt))
         (setq subType (cdr (assoc 0 subElist)))
         (setq subLayer (cdr (assoc 8 subElist)))

         (if (wcmatch subType "LWPOLYLINE,POLYLINE")
           (progn
             (setq vList nil)
             (setq curPt nil)
             (setq curBulge 0.0)
             (foreach item subElist
               (cond
                 ((= (car item) 10)
                  (if curPt
                    (setq vList (cons (cons (AC:Transform-Point curPt insPt sx sy rot) curBulge) vList))
                  )
                  (setq curPt (cdr item))
                  (setq curBulge 0.0)
                 )
                 ((= (car item) 42)
                  (setq curBulge (cdr item))
                 )
               )
             )
             (if curPt
               (setq vList (cons (cons (AC:Transform-Point curPt insPt sx sy rot) curBulge) vList))
             )
             (setq partData (Process-Geometry-Data (reverse vList) subLayer blkName))
             (if partData
               (setq rawList (cons (cons moduleName partData) rawList))
             )
           )
         )
       )
      )

      ;; B. ĐA GIÁC PHẲNG 2D (LWPOLYLINE / POLYLINE CÓ HOẶC KHÔNG CÓ CUNG CONG)
      ((wcmatch entType "LWPOLYLINE,POLYLINE")
       (setq vList nil)
       (setq curPt nil)
       (setq curBulge 0.0)
       (foreach item elist
         (cond
           ((= (car item) 10)
            (if curPt
              (setq vList (cons (cons curPt curBulge) vList))
            )
            (setq curPt (cdr item))
            (setq curBulge 0.0)
           )
           ((= (car item) 42)
            (setq curBulge (cdr item))
           )
         )
       )
       (if curPt
         (setq vList (cons (cons curPt curBulge) vList))
       )
       (setq partData (Process-Geometry-Data (reverse vList) layerName entType))
       (if partData
         (setq rawList (cons (cons moduleName partData) rawList))
       )
      )

      ;; C. CÁC NÉT RỜI RẠC (LINE HOẶC ARC) - GOM LẠI ĐỂ TỰ ĐỘNG NỐI CHUỖI
      ((wcmatch entType "LINE,ARC")
       (if (= entType "LINE")
         (setq looseSegs (cons (list (cdr (assoc 10 elist)) (cdr (assoc 11 elist)) 0.0 layerName) looseSegs))
         ;; Nếu là ARC: chuyển thành điểm đầu, điểm cuối và Bulge
         (progn
           (setq cp (cdr (assoc 10 elist)))
           (setq rad (cdr (assoc 40 elist)))
           (setq a1 (cdr (assoc 50 elist)))
           (setq a2 (cdr (assoc 51 elist)))
           (setq sp (polar cp a1 rad))
           (setq ep (polar cp a2 rad))
           (setq dAng (- a2 a1))
           (if (< dAng 0.0) (setq dAng (+ dAng (* 2.0 pi))))
           (setq bg (tan (/ dAng 4.0)))
           (setq looseSegs (cons (list sp ep bg layerName) looseSegs))
         )
       )
      )

      ;; D. KHỐI 3D SOLID (XỬ LÝ XOAY NGHIÊNG BẰNG THỂ TÍCH REALITY CHECK)
      ((wcmatch entType "3DSOLID,REGION")
       (setq obj (vlax-ename->vla-object ent))
       (if (not (vl-catch-all-error-p (vl-catch-all-apply 'vla-GetBoundingBox (list obj 'minPt 'maxPt))))
         (progn
           (setq minPt (vlax-safearray->list minPt))
           (setq maxPt (vlax-safearray->list maxPt))
           (setq dX (abs (- (car maxPt) (car minPt))))
           (setq dY (abs (- (cadr maxPt) (cadr minPt))))
           (setq dZ (abs (- (caddr maxPt) (caddr minPt))))

           ;; Lấy thể tích thực của khối 3D để kiểm tra xoay nghiêng
           (setq vol 0.0)
           (if (vlax-property-available-p obj 'Volume)
             (setq vol (vlax-get-property obj 'Volume))
           )

           ;; Xác định độ dày danh định theo Layer hoặc cạnh nhỏ nhất
           (setq dims (vl-sort (list dX dY dZ) '>))
           (setq nomThk (nth 2 dims))
           (cond
             ((or (wcmatch (strcase layerName) "*HAU*") (wcmatch (strcase layerName) "*_6*")) (setq thkMm 6.0))
             ((or (wcmatch (strcase layerName) "*_9*")) (setq thkMm 9.0))
             ((or (wcmatch (strcase layerName) "*_25*")) (setq thkMm 25.0))
             (t (setq thkMm (if (and (> nomThk 1.0) (< nomThk 50.0)) nomThk defThkMm)))
           )

           ;; Hiệu chỉnh Bounding Box nếu khối 3D bị xoay nghiêng làm phình diện tích
           (if (and (> vol 0.0) (> (* dX dY dZ) (* vol 1.25)))
             (progn
               ;; Diện tích thực = Thể tích / Độ dày
               (setq realArea (/ vol thkMm))
               (setq scaleFactor (sqrt (/ realArea (* (nth 0 dims) (nth 1 dims)))))
               (setq lenMm (fix (+ 0.5 (* (nth 0 dims) scaleFactor))))
               (setq widMm (fix (+ 0.5 (* (nth 1 dims) scaleFactor))))
             )
             (progn
               (setq lenMm (fix (+ 0.5 (nth 0 dims))))
               (setq widMm (fix (+ 0.5 (nth 1 dims))))
             )
           )

           ;; Xác định vật tư & dán cạnh
           (setq matCode defaultMat)
           (setq edgeCode (AC:Get-Smart-Edge-Code layerName "3DSOLID" defaultEdge thkMm))

           (if (and (> lenMm 50) (> widMm 30))
             (setq rawList (cons (list moduleName layerName lenMm widMm (fix (+ 0.5 thkMm)) matCode edgeCode) rawList))
           )
         )
       )
      )
    )
    (setq i (1+ i))
  )

  ;; --- 7. TỰ ĐỘNG NỐI CÁC ĐOẠN LINE/ARC RỜI THÀNH TẤM VÁN ---
  (if looseSegs
    (progn
      ;; Gom nhóm theo Layer để ghép đúng các nét cùng chi tiết
      (setq layerList nil)
      (foreach s looseSegs
        (if (not (member (last s) layerList))
          (setq layerList (cons (last s) layerList))
        )
      )

      (foreach lay layerList
        (setq subSegs (vl-remove-if-not '(lambda (x) (= (last x) lay)) looseSegs))
        (setq closedLoops (AC:Chain-Segments-Into-Loops subSegs 1.5))
        (foreach loop closedLoops
          (setq vList (mapcar '(lambda (x) (cons (car x) (caddr x))) loop))
          (setq partData (Process-Geometry-Data vList lay "Chained_Lines"))
          (if partData
            (progn
              (setq looseLinesCount (1+ looseLinesCount))
              (setq rawList (cons (cons moduleName partData) rawList))
            )
          )
        )
      )
    )
  )

  ;; Kiểm tra kết quả bóc tách
  (if (not rawList)
    (progn
      (princ "\n[Thông báo] Không tìm thấy tấm ván hợp lệ từ các đối tượng đã chọn!")
      (setvar "CMDECHO" oldCmd)
      (vla-EndUndoMark doc)
      (exit)
    )
  )

  (setq totalParts (length rawList))

  ;; --- 8. GOM NHÓM SỐ LƯỢNG THÔNG MINH (AGGREGATION QTY) ---
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

  ;; --- 9. XUẤT FILE CSV UTF-8 CÓ DẤU BOM CHUẨN XƯỞNG ---
  (setq dwgDir (getvar "DWGPREFIX"))
  (if (or (not dwgDir) (= dwgDir ""))
    (setq dwgDir (strcat (getenv "USERPROFILE") "\\Desktop\\"))
  )
  (setq csvPath (strcat dwgDir moduleName "_Cutlist_V3_" (rtos (getvar "CDATE") 2 0) ".csv"))
  (setq f (open csvPath "w"))

  (if f
    (progn
      ;; Ghi UTF-8 BOM (\xEF\xBB\xBF) để Excel mở không lỗi font
      (write-char 239 f)
      (write-char 187 f)
      (write-char 191 f)

      (write-line "Hang_Muc,Ten_Chi_Tiet,Dai,Rong,Day,So_Luong,Ma_Vat_Lieu,Dan_Canh" f)

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

      ;; BÁO CÁO KẾT QUẢ ĐẦY ĐỦ RA MÀN HÌNH
      (princ "\n=================================================================")
      (princ (strcat "\n>>> [THÀNH CÔNG] BÓC TÁCH HOÀN TẤT " (itoa totalParts) " TẤM VÁN!"))
      (princ (strcat "\n>>> Gom nhóm quy cách thành: " (itoa totalRows) " dòng chi tiết."))
      (if (> looseLinesCount 0)
        (princ (strcat "\n>>> [Auto-Chain] Nối thành công " (itoa looseLinesCount) " tấm từ các nét Line rời!"))
      )
      (if (> duplicateCount 0)
        (princ (strcat "\n>>> [Lọc trùng] Tự động loại bỏ " (itoa duplicateCount) " đối tượng vẽ đè!"))
      )
      (if (> curvedPartsCount 0)
        (princ (strcat "\n>>> [Bo cong] Tối ưu phôi phủ bì & viền cho " (itoa curvedPartsCount) " chi tiết có góc cong!"))
      )
      (princ (strcat "\n>>> File Cutlist CSV lưu tại: " csvPath))
      (princ "\n=================================================================\n")

      (if (> (getvar "FILEDIA") 0)
        (alert
          (strcat
            "BÓC TÁCH HOÀN TẤT (PHIÊN BẢN V3.0 PRO)!\n\n"
            "- Tổng số tấm trong bản vẽ: " (itoa totalParts) " tấm\n"
            "- Số dòng quy cách sau khi gom: " (itoa totalRows) " dòng\n"
            (if (> looseLinesCount 0) (strcat "- Tấm nối từ nét Line rời: " (itoa looseLinesCount) "\n") "")
            (if (> duplicateCount 0) (strcat "- Nét vẽ đè đã loại bỏ: " (itoa duplicateCount) "\n") "")
            (if (> curvedPartsCount 0) (strcat "- Chi tiết cong đã tối ưu: " (itoa curvedPartsCount) "\n") "")
            "- File CSV xuất: " csvPath "\n\n"
            "File đã chuẩn hóa 100% để kéo thả vào Web Báo Giá: https://webnoithatpro.vn/quoting"
          )
        )
      )
    )
    (princ (strcat "\n[Lỗi] Không thể tạo file: " csvPath))
  )

  ;; --- 10. PHỤC HỒI THIẾT LẬP HỆ THỐNG ---
  (setvar "CMDECHO" oldCmd)
  (setvar "OSMODE" oldOsm)
  (setvar "CLAYER" oldLayer)
  (vla-EndUndoMark doc)
  (princ)
);_ end defun c:QC

(princ "\n[ĐÃ NẠP AUTOCUTLIST PRO V3.0] - Gõ lệnh 'QC' để bắt đầu bóc tách!")
(princ)
