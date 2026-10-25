# ==============================================================================
# THƯ VIỆN BIÊN DẠNG MẶT CẮT PHÀO NẸP & PHỤ KIỆN CHUẨN XƯỞNG VIỆT NAM (28 MẪU)
# Tên file: profile_library.rb
# Bản quyền: NoiThatPro.vn
# ==============================================================================

module NoiThatPro
  module ProfilePro
    class ProfileLibrary
      PROFILES = {
        # ======================================================================
        # 1. PHÀO NÓC TỦ BẾP & CỔ TRẦN
        # ======================================================================
        'PHAO_NOC_HIEN_DAI_40x40' => {
          name: 'Phào Nóc Hộp Hiện Đại 40x40',
          category: 'phao_noc',
          width: 40.0,
          height: 40.0,
          material: 'Go_MDF_Phu_Melamine',
          bar_length: 2.44,
          points: [
            [0.0, 0.0], [40.0, 0.0], [40.0, 40.0], [0.0, 40.0]
          ],
          description: 'Phào nóc hộp chữ nhật phẳng hiện đại che khe hở kịch trần tủ.'
        },

        'PHAO_NOC_CO_DIEN_60x60' => {
          name: 'Phào Nóc Tân Cổ Điển Giật Cấp 60x60',
          category: 'phao_noc',
          width: 60.0,
          height: 60.0,
          material: 'Go_Son_Trang',
          bar_length: 2.44,
          points: [
            [0.0, 0.0], [60.0, 0.0], [60.0, 15.0], [50.0, 15.0],
            [50.0, 30.0], [35.0, 45.0], [20.0, 45.0], [20.0, 60.0], [0.0, 60.0]
          ],
          description: 'Phào nóc giật cấp giọt nước sang trọng cho tủ áo và tủ bếp tân cổ điển.'
        },

        'PHAO_CO_TRAN_PU_80x80' => {
          name: 'Phào Cổ Trần PU Tân Cổ Điển 80x80',
          category: 'phao_noc',
          width: 80.0,
          height: 80.0,
          material: 'Go_Son_Trang',
          bar_length: 2.4,
          points: [
            [0.0, 0.0], [80.0, 0.0], [80.0, 18.0], [65.0, 30.0],
            [50.0, 50.0], [30.0, 65.0], [18.0, 80.0], [0.0, 80.0]
          ],
          description: 'Phào chỉ cổ trần PU lòng máng mềm mại giáp ranh giữa tủ và trần thạch cao.'
        },

        'PHAO_CO_TRAN_PU_100x100' => {
          name: 'Phào Cổ Trần Biệt Thự Cổ Điển 100x100',
          category: 'phao_noc',
          width: 100.0,
          height: 100.0,
          material: 'Go_Son_Trang',
          bar_length: 2.4,
          points: [
            [0.0, 0.0], [100.0, 0.0], [100.0, 22.0], [85.0, 25.0],
            [80.0, 45.0], [60.0, 70.0], [35.0, 85.0], [20.0, 100.0], [0.0, 100.0]
          ],
          description: 'Phào trần kích thước lớn 100x100mm cho phòng khách, phòng ngủ master biệt thự.'
        },

        # ======================================================================
        # 2. LEN CHÂN TỦ & LEN CHÂN TƯỜNG
        # ======================================================================
        'LEN_CHAN_TU_100x15' => {
          name: 'Len Chân Tủ Nhôm Chống Nước 100x15',
          category: 'len_chan',
          width: 15.0,
          height: 100.0,
          material: 'Nhom_Anode_Bac',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [15.0, 0.0], [15.0, 95.0], [12.0, 100.0],
            [0.0, 100.0], [0.0, 8.0], [3.0, 5.0], [3.0, 0.0]
          ],
          description: 'Len chân tủ bếp bằng nhôm anode có rãnh gài gioăng cao su chống nước tràn gầm.'
        },

        'LEN_CHAN_TU_80x17' => {
          name: 'Len Chân Tủ Gỗ MDF 80x17',
          category: 'len_chan',
          width: 17.0,
          height: 80.0,
          material: 'Go_MDF_Chong_Am_17',
          bar_length: 2.44,
          points: [
            [0.0, 0.0], [17.0, 0.0], [17.0, 80.0], [0.0, 80.0]
          ],
          description: 'Len chân tủ gỗ công nghiệp MDF chống ẩm vát giấu chân tăng chỉnh.'
        },

        'LEN_CHAN_TUONG_GO_60x12' => {
          name: 'Len Chân Tường Gỗ Gờ Tròn 60x12',
          category: 'len_chan',
          width: 12.0,
          height: 60.0,
          material: 'Go_MDF_Phu_Melamine',
          bar_length: 2.44,
          points: [
            [0.0, 0.0], [12.0, 0.0], [12.0, 52.0], [8.0, 58.0],
            [4.0, 60.0], [0.0, 60.0]
          ],
          description: 'Len chân tường gỗ công nghiệp bo vát mép trên chống bám bụi bẩn sàn.'
        },

        'LEN_CHAN_TUONG_NHOM_40x10' => {
          name: 'Len Chân Tường Nhôm Âm 40x10',
          category: 'len_chan',
          width: 10.0,
          height: 40.0,
          material: 'Nhom_Den_Nham',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [10.0, 0.0], [10.0, 40.0], [0.0, 40.0]
          ],
          description: 'Len chân tường nhôm mỏng phong cách Minimalist hiện đại.'
        },

        # ======================================================================
        # 3. CHỈ NHÔM TRANG TRÍ (T / U / V / L)
        # ======================================================================
        'NEP_NHOM_CHU_T_14' => {
          name: 'Chỉ Nhôm Chữ T14 Che Khe Ván',
          category: 'nep_nhom',
          width: 14.0,
          height: 7.0,
          material: 'Nhom_Vang_Bong',
          bar_length: 2.5,
          points: [
            [-7.0, 7.0], [7.0, 7.0], [7.0, 5.5], [1.0, 5.5],
            [1.0, 0.0], [-1.0, 0.0], [-1.0, 5.5], [-7.0, 5.5]
          ],
          description: 'Nẹp nhôm T14 che khe tiếp giáp giữa 2 tấm ván hoặc vách ốp.'
        },

        'NEP_NHOM_CHU_T_20' => {
          name: 'Chỉ Nhôm Chữ T20 Bản Rộng',
          category: 'nep_nhom',
          width: 20.0,
          height: 8.0,
          material: 'Nhom_Vang_Bong',
          bar_length: 2.5,
          points: [
            [-10.0, 8.0], [10.0, 8.0], [10.0, 6.5], [1.2, 6.5],
            [1.2, 0.0], [-1.2, 0.0], [-1.2, 6.5], [-10.0, 6.5]
          ],
          description: 'Nẹp nhôm T20 che khe co ngót sàn gỗ hoặc phân tách 2 loại sàn.'
        },

        'NEP_NHOM_CHU_U_10' => {
          name: 'Chỉ Nhôm Âm Chữ U10',
          category: 'nep_nhom',
          width: 10.0,
          height: 10.0,
          material: 'Nhom_Den_Nham',
          bar_length: 2.5,
          points: [
            [0.0, 10.0], [1.2, 10.0], [1.2, 1.2], [8.8, 1.2],
            [8.8, 10.0], [10.0, 10.0], [10.0, 0.0], [0.0, 0.0]
          ],
          description: 'Chỉ âm chữ U10 soi âm vào cánh tủ hoặc vách nan trang trí.'
        },

        'NEP_NHOM_CHU_U_20' => {
          name: 'Chỉ Nhôm Âm Chữ U20 Rãnh Lớn',
          category: 'nep_nhom',
          width: 20.0,
          height: 10.0,
          material: 'Nhom_Den_Nham',
          bar_length: 2.5,
          points: [
            [0.0, 10.0], [1.5, 10.0], [1.5, 1.5], [18.5, 1.5],
            [18.5, 10.0], [20.0, 10.0], [20.0, 0.0], [0.0, 0.0]
          ],
          description: 'Chỉ nhôm chữ U bản rộng 20mm tạo điểm nhấn rãnh sâu sang trọng.'
        },

        'NEP_NHOM_CHU_V_20' => {
          name: 'Nẹp Góc Ngoài Chữ V20x20',
          category: 'nep_nhom',
          width: 20.0,
          height: 20.0,
          material: 'Nhom_Vang_Bong',
          bar_length: 2.5,
          points: [
            [0.0, 0.0], [20.0, 0.0], [20.0, 1.2], [1.2, 1.2],
            [1.2, 20.0], [0.0, 20.0]
          ],
          description: 'Nẹp nhôm V20 bảo vệ góc ngoài của hồi tủ hoặc cột vách tránh mẻ cạnh.'
        },

        'NEP_NHOM_CHU_V_30' => {
          name: 'Nẹp Góc Ngoài Chữ V30x30',
          category: 'nep_nhom',
          width: 30.0,
          height: 30.0,
          material: 'Nhom_Vang_Bong',
          bar_length: 2.5,
          points: [
            [0.0, 0.0], [30.0, 0.0], [30.0, 1.5], [1.5, 1.5],
            [1.5, 30.0], [0.0, 30.0]
          ],
          description: 'Nẹp nhôm V30 góc lớn bảo vệ cạnh bàn ăn, quầy bar hoặc vách ốp đá.'
        },

        'NEP_KET_THUC_CHU_L_20' => {
          name: 'Nẹp Chữ L Kết Thúc Sàn & Tủ 20x10',
          category: 'nep_nhom',
          width: 20.0,
          height: 10.0,
          material: 'Nhom_Anode_Bac',
          bar_length: 2.5,
          points: [
            [0.0, 0.0], [20.0, 0.0], [20.0, 1.5], [1.5, 1.5],
            [1.5, 10.0], [0.0, 10.0]
          ],
          description: 'Nẹp chữ L che mép kết thúc sàn gỗ hoặc viền chân tủ trang trí.'
        },

        # ======================================================================
        # 4. MÁNG NHÔM ĐỊNH HÌNH LED DÂY
        # ======================================================================
        'MANG_LED_NHOM_AM_17' => {
          name: 'Máng LED Âm Tủ Bếp Có Tai 17.5x7mm',
          category: 'mang_led',
          width: 24.5,
          height: 7.0,
          material: 'Nhom_Anode_Bac',
          bar_length: 3.0,
          points: [
            [-12.25, 7.0], [-8.75, 7.0], [-8.75, 1.0], [8.75, 1.0],
            [8.75, 7.0], [12.25, 7.0], [12.25, 5.5], [10.0, 5.5],
            [10.0, 0.0], [-10.0, 0.0], [-10.0, 5.5], [-12.25, 5.5]
          ],
          description: 'Máng nhôm LED có tai che mép rãnh phay đáy tủ bếp trên và đợt tủ áo.'
        },

        'MANG_LED_NHOM_NOI_17' => {
          name: 'Máng LED Gắn Nổi Không Tai 17x8mm',
          category: 'mang_led',
          width: 17.5,
          height: 8.0,
          material: 'Nhom_Anode_Bac',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [17.5, 0.0], [17.5, 8.0], [16.0, 8.0],
            [16.0, 1.2], [1.5, 1.2], [1.5, 8.0], [0.0, 8.0]
          ],
          description: 'Máng nhôm LED dạng hộp chữ nhật gắn nổi bằng pát kẹp hoặc dán keo.'
        },

        'MANG_LED_GOC_V_45' => {
          name: 'Máng LED Góc V 45 Độ Hắt Sáng',
          category: 'mang_led',
          width: 16.0,
          height: 16.0,
          material: 'Nhom_Anode_Bac',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [16.0, 0.0], [16.0, 1.5], [2.0, 1.5],
            [1.5, 2.0], [1.5, 16.0], [0.0, 16.0]
          ],
          description: 'Máng nhôm LED góc V chiếu hắt chéo 45 độ gắn góc đáy tủ và kính ốp bếp.'
        },

        'MANG_LED_AM_DAY_TU_12' => {
          name: 'Máng LED Siêu Mỏng Âm Đợt Ván 12x4mm',
          category: 'mang_led',
          width: 14.0,
          height: 4.5,
          material: 'Nhom_Anode_Bac',
          bar_length: 3.0,
          points: [
            [-7.0, 4.5], [-5.5, 4.5], [-5.5, 1.0], [5.5, 1.0],
            [5.5, 4.5], [7.0, 4.5], [7.0, 3.5], [6.0, 3.5],
            [6.0, 0.0], [-6.0, 0.0], [-6.0, 3.5], [-7.0, 3.5]
          ],
          description: 'Máng LED siêu mỏng chỉ sâu 4.5mm âm vào đợt ván 17mm không lo thủng ván.'
        },

        # ======================================================================
        # 5. HỆ TAY NẮM KHÔNG TAY (NHÔM GOLA TỦ BẾP HIỆN ĐẠI)
        # ======================================================================
        'NHOM_GOLA_CHU_C' => {
          name: 'Nhôm Gola Chữ C (Ngăn Kéo Giữa)',
          category: 'tay_nam',
          width: 26.0,
          height: 73.0,
          material: 'Nhom_Den_Nham',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [15.0, 0.0], [20.0, 10.0], [20.0, 25.0],
            [10.0, 36.5], [20.0, 48.0], [20.0, 63.0], [15.0, 73.0],
            [0.0, 73.0], [2.0, 40.0], [0.0, 0.0]
          ],
          description: 'Thanh nhôm Gola chữ C gắn giữa 2 hàng ngăn kéo tủ bếp để thò tay mở 2 chiều.'
        },

        'NHOM_GOLA_CHU_L' => {
          name: 'Nhôm Gola Chữ L (Sát Mặt Đá Bếp)',
          category: 'tay_nam',
          width: 26.0,
          height: 57.0,
          material: 'Nhom_Den_Nham',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [16.0, 0.0], [20.0, 12.0], [20.0, 30.0],
            [10.0, 45.0], [10.0, 57.0], [0.0, 57.0], [0.0, 0.0]
          ],
          description: 'Thanh nhôm Gola chữ L gắn mép trên thùng tủ bếp dưới, sát dưới mặt đá bếp.'
        },

        # ======================================================================
        # 6. TAY NẮM NHÔM ĐÚC ÂM CÁNH TỦ
        # ======================================================================
        'TAY_NAM_NHOM_CHU_J' => {
          name: 'Tay Nắm Nhôm Âm Chữ J (Ván 17mm)',
          category: 'tay_nam',
          width: 22.0,
          height: 38.0,
          material: 'Nhom_Den_Nham',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [17.5, 0.0], [17.5, 18.0], [22.0, 18.0],
            [22.0, 24.0], [17.5, 24.0], [17.5, 38.0], [13.0, 38.0],
            [13.0, 26.0], [5.0, 26.0], [0.0, 20.0]
          ],
          description: 'Tay nắm nhôm chữ J gài mép trên cánh tủ bếp dưới hoặc hộc kéo.'
        },

        'TAY_NAM_NHOM_CHU_K' => {
          name: 'Tay Nắm Nhôm Âm Chữ K Lọt Lòng',
          category: 'tay_nam',
          width: 20.0,
          height: 42.0,
          material: 'Nhom_Anode_Bac',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [17.5, 0.0], [17.5, 15.0], [20.0, 20.0],
            [20.0, 35.0], [16.0, 42.0], [12.0, 42.0], [15.0, 35.0],
            [15.0, 22.0], [0.0, 22.0]
          ],
          description: 'Tay nắm nhôm chữ K phẳng mặt cánh phong cách tối giản không lộ gờ.'
        },

        # ======================================================================
        # 7. KHUNG NHÔM CÁNH KÍNH TỦ ÁO CAO CẤP
        # ======================================================================
        'KHUNG_NHOM_CANH_KINH_20x20' => {
          name: 'Khung Nhôm Cánh Kính Slim 20x20',
          category: 'canh_kinh',
          width: 20.0,
          height: 20.0,
          material: 'Nhom_Den_Nham',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [20.0, 0.0], [20.0, 14.0], [14.0, 14.0],
            [14.0, 19.0], [8.0, 19.0], [8.0, 14.0], [2.0, 14.0],
            [2.0, 20.0], [0.0, 20.0]
          ],
          description: 'Thanh nhôm cánh kính viền siêu mỏng 20x20 có hèm ngậm kính cường lực 5mm.'
        },

        'KHUNG_NHOM_CANH_KINH_20x45' => {
          name: 'Khung Nhôm Cánh Kính Tiêu Chuẩn 20x45',
          category: 'canh_kinh',
          width: 20.0,
          height: 45.0,
          material: 'Nhom_Den_Nham',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [20.0, 0.0], [20.0, 38.0], [14.0, 38.0],
            [14.0, 43.0], [8.0, 43.0], [8.0, 38.0], [2.0, 38.0],
            [2.0, 45.0], [0.0, 45.0]
          ],
          description: 'Thanh nhôm cánh kính bản 45mm chịu lực tốt cho cánh tủ áo kịch trần cao 2.8m.'
        },

        'KHUNG_NHOM_CANH_KINH_CO_TAY_NAM' => {
          name: 'Khung Nhôm Cánh Kính Liền Tay Nắm Móc',
          category: 'canh_kinh',
          width: 26.0,
          height: 45.0,
          material: 'Nhom_Den_Nham',
          bar_length: 3.0,
          points: [
            [0.0, 0.0], [20.0, 0.0], [26.0, 15.0], [24.0, 22.0],
            [20.0, 18.0], [20.0, 38.0], [14.0, 38.0], [14.0, 43.0],
            [8.0, 43.0], [8.0, 38.0], [2.0, 38.0], [2.0, 45.0], [0.0, 45.0]
          ],
          description: 'Khung nhôm cánh kính tích hợp gờ móc tay nắm liền khối suốt chiều dài cánh.'
        },

        # ======================================================================
        # 8. CHỈ KHUNG TRANH TƯỜNG TÂN CỔ ĐIỂN (PHÀO PU / PS)
        # ======================================================================
        'CHI_KHUNG_TRANH_40x15' => {
          name: 'Chỉ Phào Lưng Tường Tân Cổ Điển 40x15',
          category: 'chi_tuong',
          width: 40.0,
          height: 15.0,
          material: 'Go_Son_Trang',
          bar_length: 2.4,
          points: [
            [-20.0, 0.0], [20.0, 0.0], [20.0, 5.0], [15.0, 10.0],
            [8.0, 15.0], [-8.0, 15.0], [-15.0, 10.0], [-20.0, 5.0]
          ],
          description: 'Chỉ phân tầng hoặc chạy viền lưng tường phòng ngủ, phòng khách tân cổ điển.'
        },

        'CHI_VIEN_O_TUONG_25x12' => {
          name: 'Chỉ Viền Ô Tranh Tường Tân Cổ Điển 25x12',
          category: 'chi_tuong',
          width: 25.0,
          height: 12.0,
          material: 'Go_Son_Trang',
          bar_length: 2.4,
          points: [
            [-12.5, 0.0], [12.5, 0.0], [12.5, 4.0], [9.0, 8.0],
            [4.0, 12.0], [-4.0, 12.0], [-9.0, 8.0], [-12.5, 4.0]
          ],
          description: 'Chỉ ô tường tinh tế đóng khung tranh và vách đầu giường tân cổ điển.'
        }
      }.freeze

      CUSTOM_DIR = File.join(ENV['APPDATA'] || (ENV['USERPROFILE'] ? File.join(ENV['USERPROFILE'], 'AppData', 'Roaming') : '.'), 'NoiThatPro')
      CUSTOM_FILE = File.join(CUSTOM_DIR, 'custom_profiles.json')

      @@custom_profiles = nil

      def self.all_profiles
        ensure_custom_loaded
        result = {}
        PROFILES.each do |k, v|
          result[k] = v.merge(id: k)
        end
        @@custom_profiles.each do |k, v|
          result[k] = v.merge(id: k)
        end
        result
      end

      # ========================================================================
      # TỔ HỢP THÔNG MINH (SMART ASSEMBLIES - VƯỢT TRỘI PROFILE BUILDER 4)
      # ========================================================================
      ASSEMBLIES = {
        'ASM_PHAO_NOC_CO_DIEN' => {
          id: 'ASM_PHAO_NOC_CO_DIEN',
          name: 'Tổ Hợp Phào Nóc Tân Cổ Điển + Hoa Góc Đúc 90°',
          category: 'assembly',
          main_profile_id: 'PHAO_NOC_CO_DIEN_60x60',
          justification: 'bottom_left',
          material: 'Go_Son_Trang',
          corner_component: 'Hoa_Van_Goc_Duc_90',
          spacing_mm: 0,
          description: 'Phào nóc tân cổ điển kèm khối hoa văn góc đúc vuông 90 độ tại các điểm góc.'
        },
        'ASM_MANG_LED_TAI_LO_XO' => {
          id: 'ASM_MANG_LED_TAI_LO_XO',
          name: 'Tổ Hợp Máng LED Định Hình + Tai Kẹp Lò Xo + Nắp Bịt',
          category: 'assembly',
          main_profile_id: 'LED_AM_CO_TAI_25x7',
          justification: 'top_center',
          material: 'Nhom_Anode_Bac',
          clip_component: 'Tai_Kep_Inox_Lo_Xo',
          spacing_mm: 500,
          end_caps: true,
          description: 'Máng nhôm LED lắp âm kèm tai kẹp lò xo phân bổ 500mm/chiếc và 2 nắp bịt đầu.'
        },
        'ASM_CANH_KINH_SLIM_BAN_LE' => {
          id: 'ASM_CANH_KINH_SLIM_BAN_LE',
          name: 'Tổ Hợp Khung Nhôm Cánh Kính Slim + Bản Lề Góc 180°',
          category: 'assembly',
          main_profile_id: 'CANH_KINH_SLIM_20x20',
          justification: 'bottom_left',
          material: 'Nhom_Den',
          corner_component: 'Ke_Goc_Bat_Vit_Slim',
          spacing_mm: 0,
          description: 'Khung nhôm cánh kính cao cấp kèm ke góc bắt vít ẩn và bản lề chuyên dụng.'
        },
        'ASM_GOLA_J_KE_GOC' => {
          id: 'ASM_GOLA_J_KE_GOC',
          name: 'Tổ Hợp Gola Chữ J + Ke Góc Nhôm 90° + Nắp Chụp',
          category: 'assembly',
          main_profile_id: 'GOLA_CHU_J_NHOM',
          justification: 'top_left',
          material: 'Nhom_Anode_Bac',
          corner_component: 'Ke_Goc_Gola_90',
          spacing_mm: 0,
          end_caps: true,
          description: 'Hệ tay nắm Gola chữ J cánh tủ dưới kèm ke góc liên kết 90 độ và nắp bịt đầu hồi.'
        }
      }.freeze

      def self.all_assemblies
        ASSEMBLIES.values
      end

      def self.get(id)
        ensure_custom_loaded
        id_str = id.to_s
        item = PROFILES[id_str] || @@custom_profiles[id_str]
        return nil unless item
        item.merge(id: id_str)
      end

      def self.register_custom(id, profile_data)
        ensure_custom_loaded
        id_str = id.to_s
        @@custom_profiles[id_str] = profile_data.merge(id: id_str)
        save_custom_profiles
      end

      def self.delete_custom(id)
        ensure_custom_loaded
        id_str = id.to_s
        if @@custom_profiles.key?(id_str)
          deleted = @@custom_profiles.delete(id_str)
          save_custom_profiles
          return deleted
        end
        nil
      end

      # Trích xuất biên dạng tự do từ một Face đang được chọn trong SketchUp
      def self.create_from_face(face, custom_name = 'Custom_Profile')
        return nil unless face && face.is_a?(Sketchup::Face)

        loop = face.outer_loop
        vertices = loop.vertices

        trans = Geom::Transformation.new(face.bounds.corner(0), face.normal)
        inv_trans = trans.inverse

        pts_2d = vertices.map do |v|
          pt_local = inv_trans * v.position
          [(pt_local.x * 25.4).round(1), (pt_local.y * 25.4).round(1)]
        end

        bb = face.bounds
        width_mm = (bb.width * 25.4).round(1)
        height_mm = (bb.height * 25.4).round(1)

        {
          name: custom_name,
          category: 'tu_ve',
          width: width_mm,
          height: height_mm,
          material: 'Nhom_Tuy_Chon',
          bar_length: 2.5,
          points: pts_2d,
          description: "Mặt cắt tự định nghĩa bóc từ đối tượng 3D (#{width_mm}x#{height_mm}mm)."
        }
      end

      private

      def self.ensure_custom_loaded
        return if @@custom_profiles
        @@custom_profiles = {}
        if File.exist?(CUSTOM_FILE)
          begin
            require 'json'
            content = File.read(CUSTOM_FILE, encoding: 'UTF-8')
            parsed = JSON.parse(content)
            if parsed.is_a?(Hash)
              parsed.each do |k, v|
                # Convert string keys to symbols where needed
                v_sym = v.transform_keys(&:to_sym) rescue v
                @@custom_profiles[k.to_s] = v_sym
              end
            end
          rescue => _e
          end
        end
      end

      def self.save_custom_profiles
        require 'json'
        require 'fileutils'
        FileUtils.mkdir_p(CUSTOM_DIR) unless Dir.exist?(CUSTOM_DIR)
        File.open(CUSTOM_FILE, 'w:UTF-8') do |f|
          f.write(JSON.pretty_generate(@@custom_profiles))
        end
      rescue => _e
      end
    end
  end
end
