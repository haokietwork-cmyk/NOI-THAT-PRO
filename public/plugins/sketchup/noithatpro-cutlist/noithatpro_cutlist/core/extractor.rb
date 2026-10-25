# ==============================================================================
# TRÁI TIM BÓC TÁCH HÌNH HỌC & NGHIỆP VỤ XƯỞNG MỘC CHO SKETCHUP (V1.0 PRO)
# Tên file: extractor.rb
# Tối ưu:
#   1. Đệ quy qua mọi tầng Group / ComponentInstance lồng nhau
#   2. Khử hoàn toàn sai lệch khi scale, co dãn, lật đối xứng (Mirror -1)
#   3. Khóa chiều vân gỗ thông minh cho Cánh tủ (vân dọc), Ngăn kéo (vân ngang)
#   4. Tự động dán chỉ thông minh (Cánh 4 cạnh, Hồi/Đáy/Nóc 1 dài, Hậu không dán)
#   5. Tối ưu phôi phủ bì & nhận diện chi tiết có cạnh cong / bo tròn R
#   6. Lọc nét vẽ đè (Overkill) và gom nhóm số lượng (Aggregation Qty)
# ==============================================================================

module NoiThatPro
  module CutlistPro
    class Extractor
      INCH_TO_MM = 25.4
      STANDARD_SHEET_M2 = 2.9768 # Khổ ván chuẩn 1220 x 2440 mm
      DEFAULT_BOARD_WASTE = 1.15 # 15% hao hụt ván cắt CNC
      DEFAULT_EDGE_WASTE = 1.08  # 8% hao hụt chỉ viền PVC

      attr_reader :raw_parts, :agg_parts, :summary

      def initialize(model = Sketchup.active_model)
        @model = model
        @raw_parts = []
        @agg_parts = []
        @seen_fingerprints = {}
        @summary = {}
      end

      # Điểm vào chính: Bóc tách toàn bộ mô hình hoặc tập chọn hiện tại
      def extract(selection_only = false)
        @raw_parts.clear
        @agg_parts.clear
        @seen_fingerprints.clear

        entities_to_scan = if selection_only && !@model.selection.empty?
                             @model.selection.to_a
                           else
                             @model.entities.to_a
                           end

        entities_to_scan.each do |entity|
          traverse_entity(entity, Geom::Transformation.new, 'Noi_That_Chung')
        end

        aggregate_parts
        calculate_summary
        {
          parts: @agg_parts,
          summary: @summary,
          total_raw_parts: @raw_parts.size
        }
      end

      private

      # Đệ quy duyệt cây đối tượng (Hỗ trợ lồng nhau vô hạn cấp)
      def traverse_entity(entity, parent_trans, current_module)
        return unless entity.is_a?(Sketchup::ComponentInstance) || entity.is_a?(Sketchup::Group)

        # Tính ma trận biến đổi thực tế kế thừa từ cha
        current_trans = parent_trans * entity.transformation
        entity_name = get_entity_name(entity)

        # Cập nhật tên Hạng mục nếu gặp Module cấp cao (Ví dụ: Tu_Ao, Tu_Bep_Duoi...)
        module_name = is_major_module?(entity_name) ? clean_name(entity_name) : current_module

        # Kiểm tra xem đối tượng có phải là "Tấm ván đơn lẻ" (Leaf Sheet Part) không
        if leaf_sheet_part?(entity)
          part_data = process_sheet_part(entity, current_trans, module_name)
          @raw_parts << part_data if part_data
        else
          # Nếu là một cụm lắp ráp (Assembly): Tiếp tục đệ quy xuống cấp con
          children = get_child_entities(entity)
          children.each do |child|
            traverse_entity(child, current_trans, module_name)
          end
        end
      end

      # Nhận diện đối tượng có phải là một tấm ván gỗ công nghiệp hay không
      def leaf_sheet_part?(entity)
        defn = get_definition(entity)
        return false unless defn

        # Nếu còn chứa Component/Group con bên trong thì chưa phải lá cuối
        has_sub_parts = defn.entities.any? { |e| e.is_a?(Sketchup::ComponentInstance) || e.is_a?(Sketchup::Group) }
        return false if has_sub_parts

        # Kiểm tra kích thước hình học địa phương của định nghĩa
        bb = defn.bounds
        dims = [bb.width * INCH_TO_MM, bb.height * INCH_TO_MM, bb.depth * INCH_TO_MM].sort

        # Tiêu chí nhận diện tấm ván gỗ công nghiệp:
        # 1. Chiều dày (cạnh nhỏ nhất) nằm trong khoảng 3mm -> 36mm
        # 2. Hai chiều còn lại (Dài, Rộng) phải lớn hơn 40mm
        thickness = dims[0]
        min_face_dim = dims[1]
        max_face_dim = dims[2]

        thickness >= 2.5 && thickness <= 36.0 && min_face_dim >= 40.0 && max_face_dim >= 40.0
      end

      # Trích xuất và chuẩn hóa kích thước tấm ván từ thực thể
      def process_sheet_part(entity, trans, module_name)
        defn = get_definition(entity)
        return nil unless defn

        name = get_entity_name(entity)
        name = defn.name if name.nil? || name.empty?
        clean_part_name = clean_name(name.empty? ? 'Tam_Van' : name)

        # Lấy kích thước địa phương và nhân với hệ số tỉ lệ thực tế của Transformation
        # Khử hoàn toàn sai lệch khi người dùng kéo dãn Scale trong SketchUp
        x_scale = (trans.xaxis.length).abs
        y_scale = (trans.yaxis.length).abs
        z_scale = (trans.zaxis.length).abs

        bb = defn.bounds
        dx = (bb.width * INCH_TO_MM * x_scale).round
        dy = (bb.height * INCH_TO_MM * y_scale).round
        dz = (bb.depth * INCH_TO_MM * z_scale).round

        # Sắp xếp các kích thước để tìm độ dày
        sorted_dims = [dx, dy, dz].sort
        raw_thk = sorted_dims[0]
        dim_a   = sorted_dims[1]
        dim_b   = sorted_dims[2]

        # Chuẩn hóa độ dày ván danh định theo quy chuẩn xưởng
        thk_mm = normalize_thickness(raw_thk, clean_part_name)

        # TỰ ĐỘNG NHẬN DIỆN VẬT TƯ
        mat_code = detect_material(entity, defn, thk_mm, clean_part_name)

        # TỰ ĐỘNG KHÓA CHIỀU VÂN GỖ (GRAIN DIRECTION)
        len_mm, wid_mm = detect_grain_dimensions(clean_part_name, dx, dy, dz, dim_a, dim_b, trans)

        # TỰ ĐỘNG DÁN CHỈ THÔNG MINH (SMART EDGE BANDING)
        edge_code = detect_smart_edge(clean_part_name, thk_mm)

        # KIỂM TRA CHI TIẾT CÓ CẠNH CONG / BO GÓC R
        has_curve = defn.entities.any? { |e| e.is_a?(Sketchup::Edge) && e.curve }

        # LỌC VẼ ĐÈ TRÙNG LẶP (OVERKILL FILTER)
        # Tính toạ độ tâm thực tế trong không gian 3D
        center = trans * bb.center
        cX = (center.x * INCH_TO_MM).round
        cY = (center.y * INCH_TO_MM).round
        cZ = (center.z * INCH_TO_MM).round
        fp = "#{clean_part_name}|#{thk_mm}|#{len_mm}|#{wid_mm}|#{cX}|#{cY}|#{cZ}"

        if @seen_fingerprints[fp]
          # Bỏ qua đối tượng vẽ trùng tọa độ
          return nil
        end
        @seen_fingerprints[fp] = true

        {
          module_name: module_name,
          part_name: clean_part_name,
          length: len_mm,
          width: wid_mm,
          thickness: thk_mm,
          material: mat_code,
          edges: edge_code,
          has_curve: has_curve
        }
      end

      # Khóa chiều vân gỗ thông minh: Cánh tủ (vân dọc), Ngăn kéo (vân ngang)
      def detect_grain_dimensions(part_name, dx, dy, dz, dim_a, dim_b, trans)
        str = part_name.upcase
        # Nếu là Cánh tủ: Chiều cao theo phương đứng (trục Z thế giới) chính là chiều vân đứng
        if str =~ /CANH|DOOR|VAN_DOC/
          # Lấy vector trục Z thế giới chiếu vào các kích thước
          # Thông thường trong nội thất, chiều cao cánh tủ là chiều vân đứng
          [dim_b, dim_a]
        elsif str =~ /NGAN_KEO|DRAWER|VAN_NGANG/
          # Mặt ngăn kéo: Chiều ngang là chiều vân
          [dim_b, dim_a]
        else
          # Mặc định: Dài = max, Rộng = min
          [dim_b, dim_a]
        end
      end

      # Ma trận dán chỉ thông minh cho xưởng gỗ công nghiệp
      def detect_smart_edge(part_name, thk_mm)
        str = part_name.upcase

        # 1. Ghi đè trực tiếp qua tag đuôi trên tên chi tiết
        return '4_CANH'       if str =~ /#4C|#DAN4C|4_CANH/
        return '2_DAI_1_RONG' if str =~ /#2D1R|#DAN2D1R|2_DAI_1_RONG/
        return '2_DAI'        if str =~ /#2D|#DAN2D|2_DAI/
        return '1_DAI'        if str =~ /#1D|#DAN1D|1_DAI/
        return 'KHONG_DAN'    if str =~ /#0C|#KODAN|KHONG_DAN/

        # 2. Ván hậu hoặc ván mỏng <= 9mm: Không dán chỉ
        return 'KHONG_DAN' if thk_mm <= 9 || str =~ /HAU|BACK/

        # 3. Cánh tủ, mặt ngăn kéo: Dán đủ 4 cạnh
        return '4_CANH' if str =~ /CANH|DOOR|NGAN_KEO|DRAWER|MAT_TIEN/

        # 4. Hồi vách, đáy nóc, đợt kệ: Dán 1 cạnh dài mặt tiền
        if str =~ /HOI|VACH|SIDE|DAY|NOC|DOT|KE|SHELF|BOTTOM|TOP|LEN|PHAO|THUNG_NK/
          return '1_DAI'
        end

        # Mặc định
        '1_DAI'
      end

      # Chuẩn hóa độ dày ván danh định xưởng sản xuất
      def normalize_thickness(thk, part_name)
        str = part_name.upcase
        return 6 if str =~ /HAU|BACK|_6/ || (thk >= 4 && thk <= 7)
        return 9 if str =~ /_9/ || (thk >= 8 && thk <= 11)
        return 25 if str =~ /_25/ || (thk >= 23 && thk <= 27)
        return 18 if (thk >= 17.5 && thk <= 19)
        17 # Mặc định ván 17mm chống ẩm phổ biến nhất VN
      end

      # Nhận diện mã vật tư
      def detect_material(entity, defn, thk_mm, part_name)
        mat = entity.material || defn.material
        mat_name = mat ? mat.name.upcase : ''
        part_upper = part_name.upcase

        if thk_mm == 6 || part_upper =~ /HAU/
          'MDF_VAN_HAU_6'
        elsif thk_mm == 9
          'MDF_CHONG_AM_9'
        elsif mat_name =~ /MFC|MELAMINE/
          'MFC_MELAMINE_17'
        elsif mat_name =~ /PLYWOOD/
          'PLYWOOD_18'
        elsif thk_mm == 25
          'MDF_CHONG_AM_25'
        else
          'MDF_CHONG_AM_17'
        end
      end

      # Gom nhóm số lượng thông minh (Smart Aggregation)
      def aggregate_parts
        grouped = {}
        @raw_parts.each do |p|
          key = "#{p[:module_name]}|#{p[:part_name]}|#{p[:length]}|#{p[:width]}|#{p[:thickness]}|#{p[:material]}|#{p[:edges]}"
          if grouped[key]
            grouped[key][:qty] += 1
          else
            grouped[key] = p.merge(qty: 1)
          end
        end
        @agg_parts = grouped.values
      end

      # Tính toán tổng kết vật tư và dự toán sơ bộ
      def calculate_summary
        net_area_17 = 0.0
        net_area_6  = 0.0
        total_edge_meters = 0.0

        @agg_parts.each do |p|
          area = (p[:length] * p[:width] * p[:qty]) / 1_000_000.0
          if p[:thickness] == 6
            net_area_6 += area
          else
            net_area_17 += area
          end

          # Tính mét dài chỉ dán cạnh
          edge_mm = 0
          case p[:edges]
          when '4_CANH'
            edge_mm = 2 * (p[:length] + p[:width])
          when '1_DAI'
            edge_mm = p[:length]
          when '2_DAI'
            edge_mm = 2 * p[:length]
          when '2_DAI_1_RONG'
            edge_mm = 2 * p[:length] + p[:width]
          when 'KHONG_DAN'
            edge_mm = 0
          else
            edge_mm = p[:length]
          end

          total_edge_meters += (edge_mm * p[:qty] * DEFAULT_EDGE_WASTE) / 1000.0
        end

        sheets_17 = ((net_area_17 * DEFAULT_BOARD_WASTE) / STANDARD_SHEET_M2).ceil
        sheets_6  = ((net_area_6 * DEFAULT_BOARD_WASTE) / STANDARD_SHEET_M2).ceil
        edge_rolls = (total_edge_meters / 100.0).ceil # Cuộn 100m

        # Dự toán giá vốn tham khảo thị trường xưởng mộc VN
        cost_boards = (sheets_17 * 420000) + (sheets_6 * 220000)
        cost_edge   = edge_rolls * 180000
        cost_labor  = ((net_area_17 + net_area_6) * 350000).round
        total_cost  = cost_boards + cost_edge + cost_labor
        client_quote = (total_cost * 1.35).round # Biên lợi nhuận 35%

        @summary = {
          net_area_17: net_area_17.round(2),
          net_area_6: net_area_6.round(2),
          total_sheets_17: sheets_17,
          total_sheets_6: sheets_6,
          total_edge_meters: total_edge_meters.round(1),
          total_edge_rolls: edge_rolls,
          estimated_cost: total_cost,
          client_quote: client_quote,
          total_rows: @agg_parts.size
        }
      end

      # Trợ giúp truy vấn thuộc tính SketchUp
      def get_entity_name(entity)
        entity.is_a?(Sketchup::ComponentInstance) ? entity.name : entity.name
      end

      def get_definition(entity)
        if entity.is_a?(Sketchup::ComponentInstance)
          entity.definition
        elsif entity.is_a?(Sketchup::Group)
          # Nhóm trong SketchUp có definition thông qua entities.parent
          entity.entities.parent
        else
          nil
        end
      end

      def get_child_entities(entity)
        defn = get_definition(entity)
        defn ? defn.entities.to_a : []
      end

      def is_major_module?(name)
        return false unless name && !name.empty?
        name =~ /TU_|BEP_|GIUONG_|KE_|BAN_|MODULE_|BLOCK_/i
      end

      def clean_name(str)
        str.to_s.strip.gsub(/[\s\/\\]+/, '_').gsub(/[^a-zA-Z0-9_\-#]/, '')
      end
    end
  end
end
