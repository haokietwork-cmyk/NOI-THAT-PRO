# ==============================================================================
# BỘ TÍNH TOÁN ĐỊNH MỨC & QUY ĐỔI CÂY NẸP PHÀO NỘI THẤT
# Tên file: estimator.rb
# Bản quyền: NoiThatPro.vn
# ==============================================================================

module NoiThatPro
  module ProfilePro
    class Estimator
      PRICE_MAP = {
        'phao_noc'   => 150000, # 150k/cây phào nóc
        'len_chan'   => 85000,  # 85k/cây len chân
        'nep_nhom'   => 65000,  # 65k/cây nẹp nhôm T/U/V
        'mang_led'   => 75000,  # 75k/cây máng nhôm LED
        'tay_nam'    => 120000, # 120k/cây tay nắm nhôm đúc / Gola
        'canh_kinh'  => 185000, # 185k/cây khung nhôm cánh kính
        'chi_tuong'  => 55000   # 55k/cây chỉ ô khung tranh tường
      }.freeze

      # Quét mô hình và tổng hợp toàn bộ phào nẹp đã dựng
      def self.scan_model(model = Sketchup.active_model)
        items = {}
        total_len_all = 0.0
        total_bars_all = 0
        total_cost_all = 0

        model.entities.grep(Sketchup::Group).each do |group|
          dict = group.attribute_dictionary('NoiThatPro_Profile')
          next unless dict

          p_id   = dict['id'] || 'custom'
          name   = dict['name'] || group.name
          cat    = dict['category'] || 'nep_nhom'
          len_m  = (dict['length_m'] || 0.0).to_f
          bar_len = (dict['bar_len'] || 2.5).to_f

          key = "#{p_id}_#{name}"
          if items[key]
            items[key][:length_m] += len_m
          else
            items[key] = {
              id: p_id,
              name: name,
              category: cat,
              length_m: len_m,
              bar_len: bar_len,
              unit_price: PRICE_MAP[cat] || 70000
            }
          end
        end

        # Tính số cây cần mua (kèm 5% hao hụt cắt góc 45 độ)
        list = items.values.map do |item|
          len = item[:length_m].round(2)
          total_len_all += len

          # Quy đổi ra số cây nguyên
          bars_to_buy = ((len * 1.05) / item[:bar_len]).ceil
          bars_to_buy = 1 if bars_to_buy == 0 && len > 0.05
          total_bars_all += bars_to_buy

          cost = bars_to_buy * item[:unit_price]
          total_cost_all += cost

          item.merge(
            length_m: len,
            bars_to_buy: bars_to_buy,
            cost: cost
          )
        end

        {
          items: list,
          total_length_m: total_len_all.round(2),
          total_bars: total_bars_all,
          total_cost: total_cost_all
        }
      end
    end
  end
end
