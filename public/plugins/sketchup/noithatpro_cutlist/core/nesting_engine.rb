# ==============================================================================
# THUẬT TOÁN XẾP VÁN 2D & SƠ ĐỒ CẮT TỰ ĐỘNG (GUILLOTINE 2D BIN PACKING)
# Tên file: nesting_engine.rb
# Bản quyền: NoiThatPro.vn
# Tính năng vượt trội OpenCutList:
#   1. Khổ ván tiêu chuẩn 1220 x 2440 mm
#   2. Gọt biên an toàn 10mm (vùng khả dụng 1200 x 2420 mm)
#   3. Mạch cưa máy cưa bàn trượt / CNC 4mm (Kerf)
#   4. Tôn trọng chiều vân gỗ (Khóa xoay với ván có vân, cho phép xoay với ván trơn/hậu)
#   5. Tính toán tỉ lệ sử dụng ván (Yield Efficiency %) và tọa độ trực quan 2D
# ==============================================================================

module NoiThatPro
  module CutlistPro
    class NestingEngine
      SHEET_WIDTH  = 1220 # mm
      SHEET_HEIGHT = 2440 # mm
      TRIM_MARGIN  = 10   # mm gọt biên
      SAW_KERF     = 4    # mm mạch cưa

      def self.pack(parts)
        # 1. Gom nhóm theo từng loại vật tư (MDF 17mm, Ván hậu 6mm...)
        by_material = {}
        parts.each do |p|
          mat = p[:material] || 'MDF_CHONG_AM_17'
          by_material[mat] ||= []
          
          qty = (p[:qty] || 1).to_i
          qty.times do |i|
            by_material[mat] << {
              part_name: p[:part_name],
              module_name: p[:module_name],
              length: p[:length].to_i,
              width: p[:width].to_i,
              thickness: p[:thickness].to_i,
              material: mat,
              has_grain: !(mat =~ /HAU|_6|TRON|WHITE/i), # Có vân gỗ hay không
              sub_id: "#{p[:part_name]}_#{i + 1}"
            }
          end
        end

        all_sheets = []
        global_sheet_idx = 1

        by_material.each do |mat, mat_parts|
          # Sắp xếp chi tiết theo diện tích giảm dần (Best Area Fit)
          sorted = mat_parts.sort_by { |p| -(p[:length] * p[:width]) }

          sheets = pack_single_material(sorted, mat)
          sheets.each do |s|
            s[:sheet_number] = global_sheet_idx
            global_sheet_idx += 1
            all_sheets << s
          end
        end

        {
          sheets: all_sheets,
          total_sheets: all_sheets.size,
          avg_efficiency: calculate_avg_efficiency(all_sheets)
        }
      end

      private

      def self.pack_single_material(parts, mat)
        sheets = []
        usable_w = SHEET_WIDTH - (TRIM_MARGIN * 2)  # 1200
        usable_h = SHEET_HEIGHT - (TRIM_MARGIN * 2) # 2420

        remaining = parts.dup

        while !remaining.empty?
          sheet = {
            material: mat,
            sheet_width: SHEET_WIDTH,
            sheet_height: SHEET_HEIGHT,
            trim: TRIM_MARGIN,
            kerf: SAW_KERF,
            placed_parts: [],
            total_part_area: 0.0
          }

          # Free Rectangles ban đầu (khu vực trống khả dụng)
          free_rects = [
            { x: TRIM_MARGIN, y: TRIM_MARGIN, w: usable_w, h: usable_h }
          ]

          placed_indices = []

          remaining.each_with_index do |part, idx|
            best_fit = find_best_rect(part, free_rects)
            if best_fit
              rect = best_fit[:rect]
              rotated = best_fit[:rotated]
              pw = rotated ? part[:length] : part[:width]
              ph = rotated ? part[:width] : part[:length]

              # Đặt chi tiết vào vị trí
              sheet[:placed_parts] << {
                part_name: part[:part_name],
                module_name: part[:module_name],
                x: rect[:x],
                y: rect[:y],
                w: pw,
                h: ph,
                rotated: rotated,
                grain: part[:has_grain] ? 'DOC' : 'TRON'
              }

              sheet[:total_part_area] += (pw * ph)
              placed_indices << idx

              # Bổ đôi khoảng trống theo thuật toán Guillotine
              split_free_rect(free_rects, rect, pw, ph)
            end
          end

          # Loại bỏ các chi tiết đã xếp
          placed_indices.reverse_each { |i| remaining.delete_at(i) }

          # Tính hiệu suất sử dụng ván
          sheet_area = (SHEET_WIDTH * SHEET_HEIGHT).to_f
          eff = (sheet[:total_part_area] / sheet_area) * 100.0
          sheet[:efficiency_pct] = eff.round(1)
          sheet[:waste_pct] = (100.0 - eff).round(1)

          sheets << sheet

          # Thoát hiểm nếu không thể nhét thêm được chi tiết nào
          if placed_indices.empty?
            # Chi tiết quá khổ ván tiêu chuẩn
            unfit = remaining.shift
            sheet[:placed_parts] << {
              part_name: "#{unfit[:part_name]} (QUÁ KHỔ)",
              module_name: unfit[:module_name],
              x: TRIM_MARGIN,
              y: TRIM_MARGIN,
              w: [unfit[:width], usable_w].min,
              h: [unfit[:length], usable_h].min,
              rotated: false,
              grain: 'OVERSIZE'
            }
            sheets << sheet
          end
        end

        sheets
      end

      # Tìm khoảng trống vừa vặn nhất (Best Fit)
      def self.find_best_rect(part, free_rects)
        w = part[:width]
        h = part[:length]
        can_rotate = !part[:has_grain] # Nếu ván không vân thì được xoay

        best = nil
        min_waste = Float::INFINITY

        free_rects.each do |r|
          # Thử hướng chuẩn (không xoay)
          if w <= r[:w] && h <= r[:h]
            waste = (r[:w] * r[:h]) - (w * h)
            if waste < min_waste
              min_waste = waste
              best = { rect: r, rotated: false }
            end
          end

          # Thử hướng xoay 90 độ (nếu được phép)
          if can_rotate && h <= r[:w] && w <= r[:h]
            waste = (r[:w] * r[:h]) - (w * h)
            if waste < min_waste
              min_waste = waste
              best = { rect: r, rotated: true }
            end
          end
        end

        best
      end

      # Phân rã khoảng trống sau khi cắt theo đường cắt Guillotine
      def self.split_free_rect(free_rects, rect, pw, ph)
        free_rects.delete(rect)

        # Khoảng trống bên phải chi tiết
        rw = rect[:w] - pw - SAW_KERF
        if rw > 40 # Bỏ qua phôi vụn nhỏ hơn 40mm
          free_rects << {
            x: rect[:x] + pw + SAW_KERF,
            y: rect[:y],
            w: rw,
            h: ph
          }
        end

        # Khoảng trống phía trên chi tiết
        rh = rect[:h] - ph - SAW_KERF
        if rh > 40
          free_rects << {
            x: rect[:x],
            y: rect[:y] + ph + SAW_KERF,
            w: rect[:w],
            h: rh
          }
        end
      end

      def self.calculate_avg_efficiency(sheets)
        return 0.0 if sheets.empty?
        sum = sheets.inject(0.0) { |acc, s| acc + s[:efficiency_pct] }
        (sum / sheets.size).round(1)
      end
    end
  end
end
