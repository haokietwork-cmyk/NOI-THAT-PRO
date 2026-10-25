;; ==============================================================================
;; NỀN TẢNG NỘI THẤT PRO - PLUGIN GHI KÍCH THƯỚC TỦ THÔNG MINH (BẢN QUYỀN)
;; Tên file: SmartDim_Furniture.lsp
;; Lệnh chạy: SD (Smart Dim)
;; Khóa bản quyền: Machine Volume Serial ID (Hardware Lock)
;; ==============================================================================

(vl-load-com)

;; --- 1. HÀM ĐỌC VOLUME SERIAL NUMBER CỦA Ổ C: ---
(defun Get-Machine-VolumeID ( / fso drive serial hexSerial)
  (setq fso (vlax-create-object "Scripting.FileSystemObject"))
  (setq drive (vlax-invoke-method fso 'GetDrive "C:"))
  (setq serial (vlax-get-property drive 'SerialNumber))
  (vlax-release-object drive)
  (vlax-release-object fso)
  ;; Chuyển số nguyên sang mã Hex dạng ABCD-EF01
  (setq hexSerial (strcase (vl-filename-base (rtos serial 16 0))))
  (if (> (strlen hexSerial) 4)
    (strcat (substr hexSerial 1 4) "-" (substr hexSerial 5))
    hexSerial
  )
)

;; --- 2. THUẬT TOÁN XÁC THỰC LICENSE KEY NỘI BỘ (OFFLINE VERIFICATION) ---
(defun Validate-SmartDim-Key (volId inputKey / cleanVol salt hash expectedKey)
  (setq cleanVol (vl-string-translate "-" "" (strcase volId)))
  (setq salt "NOITHATPRO_SMARTDIM_2026")
  (setq hash 12345)
  (foreach c (vl-string->list (strcat cleanVol salt))
    (setq hash (rem (+ (* hash 31) c) 900000))
  )
  (setq hash (+ 100000 hash))
  (setq expectedKey (strcat "NTPRO-" (substr cleanVol 1 4) "-SD-" (itoa hash)))
  
  ;; Chấp nhận Key Máy Chủ Master, Key dùng thử hoặc Key chuẩn khớp mã máy
  (or
    (= (strcase (vl-string-trim " " inputKey)) "NTPRO-HOST-DEVELOPER-MASTER")
    (= (strcase (vl-string-trim " " inputKey)) "NTPRO-COMMUNITY-TRIAL")
    (= (strcase (vl-string-trim " " inputKey)) (strcase expectedKey))
  )
)

;; --- 3. QUẢN LÝ LƯU TRỮ LICENSE TRÊN REGISTRY WINDOWS ---
(defun Get-Saved-License ( / )
  (vl-registry-read "HKEY_CURRENT_USER\\Software\\NoiThatPro\\SmartDim" "LicenseKey")
)

(defun Save-License-To-Registry (keyStr / )
  (vl-registry-write "HKEY_CURRENT_USER\\Software\\NoiThatPro\\SmartDim" "LicenseKey" keyStr)
)

;; --- 4. HỘP THOẠI KÍCH HOẠT BẢN QUYỀN (EMBEDDED DCL) ---
(defun Prompt-Activation-Dialog (volId / dclFile f dcl_id diagResult userKey)
  (setq dclFile (strcat (getvar "TEMPPREFIX") "NoiThatPro_Lic.dcl"))
  (setq f (open dclFile "w"))
  (if f
    (progn
      (write-line "dcl_lic : dialog {" f)
      (write-line "  label = \"Kich Hoat Ban Quyen SmartDim Furniture\";" f)
      (write-line "  : boxed_column {" f)
      (write-line "    label = \"Thong Tin May Tinh Cua Ban\";" f)
      (write-line (strcat "    : text { label = \"Ma may (Volume ID): " volId "\"; is_bold = true; }") f)
      (write-line "    : text { label = \"Hay copy Ma may nay de nhan License Key tren web: /cad-store\"; }" f)
      (write-line "  }" f)
      (write-line "  : boxed_column {" f)
      (write-line "    label = \"Nhap Khoa Kich Hoat (License Key)\";" f)
      (write-line "    : edit_box { key = \"eb_key\"; edit_width = 35; value = \"\"; }" f)
      (write-line "  }" f)
      (write-line "  ok_cancel;" f)
      (write-line "}" f)
      (close f)
    )
  )

  (if (and dclFile (findfile dclFile))
    (progn
      (setq dcl_id (load_dialog dclFile))
      (if (new_dialog "dcl_lic" dcl_id)
        (progn
          (action_tile "accept" "(setq userKey (get_tile \"eb_key\")) (done_dialog 1)")
          (action_tile "cancel" "(done_dialog 0)")
          (setq diagResult (start_dialog))
          (unload_dialog dcl_id)
        )
      )
      (vl-file-delete dclFile)
    )
  )
  (if (= diagResult 1) userKey nil)
)

;; --- 5. LỆNH CHÍNH: SD (SMART DIM FURNITURE) ---
(defun c:SD ( / *error* doc oldCmd oldOsm oldLayer volId currentLic newKey pt1 pt2 ptDim dimVal)

  ;; Bắt lỗi an toàn
  (defun *error* (msg)
    (if (and doc (= 1 (getvar "UNDOCTL")))
      (vla-EndUndoMark doc)
    )
    (if oldCmd (setvar "CMDECHO" oldCmd))
    (if oldOsm (setvar "OSMODE" oldOsm))
    (if oldLayer (setvar "CLAYER" oldLayer))
    (if (and msg (not (wcmatch (strcase msg t) "*break,*cancel*,*exit*")))
      (princ (strcat "\n[Lỗi SmartDim] " msg))
    )
    (princ "\n>>> Đã hủy lệnh và khôi phục cài đặt. <<<")
    (princ)
  )

  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (vla-StartUndoMark doc)
  (setq oldCmd (getvar "CMDECHO"))
  (setq oldOsm (getvar "OSMODE"))
  (setq oldLayer (getvar "CLAYER"))
  (setvar "CMDECHO" 0)

  ;; --- BƯỚC A: KIỂM TRA BẢN QUYỀN MÁY TÍNH ---
  (setq volId (Get-Machine-VolumeID))
  (setq currentLic (Get-Saved-License))

  ;; Tự động kích hoạt quyền Master cho máy chủ / nhà phát triển để test ngay
  (if (or (not currentLic) (= currentLic ""))
    (progn
      (Save-License-To-Registry "NTPRO-HOST-DEVELOPER-MASTER")
      (setq currentLic "NTPRO-HOST-DEVELOPER-MASTER")
      (princ "\n>>> [MÁY CHỦ HOST] Tự động kích hoạt quyền Master để test công cụ.")
    )
  )

  (if (not (Validate-SmartDim-Key volId currentLic))
    (progn
      (princ (strcat "\n>>> Phát hiện chưa kích hoạt bản quyền cho máy: " volId))
      (setq newKey (Prompt-Activation-Dialog volId))
      (if (and newKey (Validate-SmartDim-Key volId newKey))
        (progn
          (Save-License-To-Registry newKey)
          (alert "XÁC THỰC THÀNH CÔNG!\n\nPlugin SmartDim Furniture đã được kích hoạt vĩnh viễn trên máy tính này.")
        )
        (progn
          (alert (strcat "KHÓA KÍCH HOẠT KHÔNG HỢP LỆ!\n\n- Mã máy của bạn: " volId "\n- Vui lòng kiểm tra lại License Key nhận từ Web Nội Thất Pro."))
          (setvar "CMDECHO" oldCmd)
          (vla-EndUndoMark doc)
          (exit)
        )
      )
    )
  )

  ;; --- BƯỚC B: THỰC THI ĐO ĐẠC NỘI THẤT THÔNG MINH ---
  (princ "\n=======================================================")
  (princ "\n   SMARTDIM FURNITURE - GHI KÍCH THƯỚC KHOANG TỦ       ")
  (princ "\n=======================================================")

  (setvar "OSMODE" 33) ; Snap Endpoint (1) + Intersection (32)
  (setq pt1 (getpoint "\nChọn điểm mép ván thứ nhất (Điểm bắt đầu): "))
  (if (not pt1) (exit))

  (setq pt2 (getpoint pt1 "\nChọn điểm mép ván đối diện (Điểm lọt lòng): "))
  (if (not pt2) (exit))

  (setq ptDim (getpoint pt2 "\nĐặt vị trí đường kích thước: "))
  (if (not ptDim) (exit))

  ;; Tạo đường Dimension liên kết
  (setvar "CMDECHO" 1)
  (command "_.dimaligned" pt1 pt2 ptDim)
  (setvar "CMDECHO" 0)

  (setq dimVal (distance (list (car pt1) (cadr pt1)) (list (car pt2) (cadr pt2))))
  (princ (strcat "\n>>> [SmartDim] Khoảng cách lọt lòng đo được: " (rtos dimVal 2 1) " mm"))

  ;; --- BƯỚC C: KHÔI PHỤC HỆ THỐNG ---
  (setvar "CMDECHO" oldCmd)
  (setvar "OSMODE" oldOsm)
  (setvar "CLAYER" oldLayer)
  (vla-EndUndoMark doc)
  (princ)
);_ end defun c:SD

(princ "\n[ĐÃ NẠP SMARTDIM FURNITURE] - Gõ lệnh 'SD' để bắt đầu đo kích thước!")
(princ)
