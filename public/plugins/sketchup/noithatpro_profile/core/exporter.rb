# ==============================================================================
# BỘ XUẤT BẢNG KÊ VẬT TƯ PHÀO NẸP & MÁNG LED (.XLS & .CSV)
# Tên file: exporter.rb
# Bản quyền: NoiThatPro.vn
# Tính năng:
#   1. Xuất file Excel (.xls) định dạng bảng biểu mua nhôm / phào gỗ / máng LED
#   2. Xuất CSV UTF-8 có BOM tương thích Web Báo Giá
#   3. Tự động mở và bôi đen file trên Windows Explorer
# ==============================================================================

require 'fileutils'

module NoiThatPro
  module ProfilePro
    class Exporter
      def self.default_export_path(ext = '.xls')
        desktop = File.join(ENV['USERPROFILE'] || ENV['HOME'] || '.', 'Desktop')
        date_str = Time.now.strftime('%Y%m%d_%H%M%S')
        File.join(desktop, "Bang_Dat_Phao_Nep_LED_NoiThatPro_#{date_str}#{ext}")
      end

      # ------------------------------------------------------------------------
      # 1. XUẤT FILE EXCEL (.XLS SPREADSHEETML ĐẦY ĐỦ STYLE)
      # ------------------------------------------------------------------------
      def self.export_to_excel(estimation_data, custom_path = nil)
        return nil if estimation_data.nil? || estimation_data[:items].nil? || estimation_data[:items].empty?

        export_path = custom_path || default_export_path('.xls')
        time_str = Time.now.strftime('%d/%m/%Y %H:%M')

        File.open(export_path, 'wb:UTF-8') do |f|
          f.puts '<?xml version="1.0" encoding="UTF-8"?>'
          f.puts '<?mso-application progid="Excel.Sheet"?>'
          f.puts '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"'
          f.puts ' xmlns:o="urn:schemas-microsoft-com:office:office"'
          f.puts ' xmlns:x="urn:schemas-microsoft-com:office:excel"'
          f.puts ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"'
          f.puts ' xmlns:html="http://www.w3.org/TR/REC-html40">'

          # Định nghĩa Styles
          f.puts ' <Styles>'
          f.puts '  <Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#1E293B"/></Style>'
          f.puts '  <Style ss:ID="TitleStyle"><Font ss:FontName="Segoe UI" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/><Alignment ss:Horizontal="Left" ss:Vertical="Center"/></Style>'
          f.puts '  <Style ss:ID="SubTitleStyle"><Font ss:FontName="Segoe UI" ss:Size="10" ss:Italic="1" ss:Color="#64748B"/></Style>'
          f.puts '  <Style ss:ID="HeaderStyle"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0369A1" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#082F49"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataLeft"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataCenter"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataNumber"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataDecimal"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.00"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataMoney"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0 &quot;đ&quot;"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="TotalStyle"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/><Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0284C7"/><Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0284C7"/></Borders></Style>'
          f.puts ' </Styles>'

          # BẢNG ĐẶT VẬT TƯ
          f.puts ' <Worksheet ss:Name="Dat_Vat_Tu_Phao_Nep">'
          f.puts '  <Table ss:DefaultRowHeight="20">'
          f.puts '   <Column ss:Width="40"/>'   # STT
          f.puts '   <Column ss:Width="220"/>'  # Tên phào nẹp
          f.puts '   <Column ss:Width="110"/>'  # Phân loại
          f.puts '   <Column ss:Width="80"/>'   # Dài cây (m)
          f.puts '   <Column ss:Width="95"/>'   # Tổng mét dài
          f.puts '   <Column ss:Width="85"/>'   # Hao hụt
          f.puts '   <Column ss:Width="95"/>'   # Số cây đặt mua
          f.puts '   <Column ss:Width="110"/>'  # Đơn giá / cây
          f.puts '   <Column ss:Width="130"/>'  # Thành tiền

          # Tiêu đề
          f.puts '   <Row ss:Height="30">'
          f.puts '    <Cell ss:MergeAcross="8" ss:StyleID="TitleStyle"><Data ss:Type="String">BẢNG DỰ TOÁN &amp; ĐẶT MUA PHÀO NẸP NHÔM / MÁNG LED</Data></Cell>'
          f.puts '   </Row>'
          f.puts '   <Row ss:Height="18">'
          f.puts "    <Cell ss:MergeAcross=\"8\" ss:StyleID=\"SubTitleStyle\"><Data ss:Type=\"String\">Dự án: #{xml_escape(Sketchup.active_model.title.empty? ? 'Chưa đặt tên' : Sketchup.active_model.title)} | Xuất lúc: #{time_str} | Nền tảng: NoiThatPro.vn</Data></Cell>"
          f.puts '   </Row>'
          f.puts '   <Row ss:Height="10"/>'

          # Header Cột
          f.puts '   <Row ss:Height="24">'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">STT</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tên Phào / Nẹp / Máng LED</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Phân Loại</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Quy Cách Cây</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tổng Mét Dài (m)</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Hao Hụt</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Số Cây Cần Mua</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Đơn Giá / Cây</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Thành Tiền (VNĐ)</Data></Cell>'
          f.puts '   </Row>'

          # Dữ liệu từng loại phào nẹp
          estimation_data[:items].each_with_index do |item, idx|
            cat_label = case item[:category]
                        when 'phao_noc'   then 'Phào nóc / Cổ trần'
                        when 'len_chan'   then 'Len chân tủ / tường'
                        when 'nep_nhom'   then 'Nẹp chỉ nhôm trang trí'
                        when 'mang_led'   then 'Máng nhôm LED dây'
                        when 'tay_nam'    then 'Tay nắm nhôm / Gola'
                        when 'canh_kinh'  then 'Khung nhôm cánh kính'
                        when 'chi_tuong'  then 'Chỉ khung tranh PU/PS'
                        else 'Tự vẽ'
                        end

            f.puts '   <Row ss:Height="21">'
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"Number\">#{idx + 1}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataLeft\"><Data ss:Type=\"String\">#{xml_escape(item[:name])}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"String\">#{cat_label}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"String\">#{item[:bar_len]}m / cây</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataDecimal\"><Data ss:Type=\"Number\">#{item[:length_m]}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"String\">5% (Mòi)</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataNumber\"><Data ss:Type=\"Number\">#{item[:bars_to_buy]}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataMoney\"><Data ss:Type=\"Number\">#{item[:unit_price]}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataMoney\"><Data ss:Type=\"Number\">#{item[:cost]}</Data></Cell>"
            f.puts '   </Row>'
          end

          # Hàng Tổng Cộng
          f.puts '   <Row ss:Height="24">'
          f.puts '    <Cell ss:MergeAcross="3" ss:StyleID="TotalStyle"><Data ss:Type="String">TỔNG CỘNG TOÀN DỰ ÁN:</Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"Number\">#{estimation_data[:total_length_m]}</Data></Cell>"
          f.puts '    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"String\"></Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"Number\">#{estimation_data[:total_bars]}</Data></Cell>"
          f.puts '    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"String\"></Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"Number\">#{estimation_data[:total_cost]}</Data></Cell>"
          f.puts '   </Row>'

          # Chân trang ghi chú pháp lý
          f.puts '   <Row ss:Height="12"/>'
          f.puts '   <Row ss:Height="18">'
          f.puts '    <Cell ss:MergeAcross="8" ss:StyleID="SubTitleStyle"><Data ss:Type="String">* Lưu ý: Số lượng cây đặt hàng đã cộng thêm 5% hao hụt góc cắt mòi 45 độ theo tiêu chuẩn xưởng thi công nội thất.</Data></Cell>'
          f.puts '   </Row>'

          f.puts '  </Table>'
          f.puts ' </Worksheet>'
          f.puts '</Workbook>'
        end

        export_path
      rescue => e
        UI.messagebox("Lỗi khi xuất file Excel: #{e.message}")
        nil
      end

      # ------------------------------------------------------------------------
      # 2. XUẤT CSV (UTF-8 CÓ BOM) TƯƠNG THÍCH WEB BÁO GIÁ
      # ------------------------------------------------------------------------
      def self.export_to_csv(estimation_data, custom_path = nil)
        return nil if estimation_data.nil? || estimation_data[:items].nil? || estimation_data[:items].empty?

        export_path = custom_path || default_export_path('.csv')

        File.open(export_path, 'wb:UTF-8') do |f|
          # UTF-8 BOM
          f.write "\xEF\xBB\xBF"

          # Header 8 cột
          f.puts "STT,Ten_Phao_Nep,Chung_Loai,Quy_Cach_Cay_m,Tong_Met_Dai_m,Hao_Hut_Goc,So_Cay_Can_Mua,Don_Gia,Thanh_Tien"

          estimation_data[:items].each_with_index do |item, idx|
            f.puts [
              idx + 1,
              csv_escape(item[:name]),
              csv_escape(item[:category]),
              item[:bar_len],
              item[:length_m],
              "5%",
              item[:bars_to_buy],
              item[:unit_price],
              item[:cost]
            ].join(",")
          end
        end

        export_path
      rescue => e
        UI.messagebox("Lỗi khi xuất file CSV: #{e.message}")
        nil
      end

      # ------------------------------------------------------------------------
      # 3. MỞ VÀ BÔI ĐEN FILE TRONG WINDOWS EXPLORER
      # ------------------------------------------------------------------------
      def self.open_in_explorer(file_path)
        return unless file_path && File.exist?(file_path)
        if Gem.win_platform? || RUBY_PLATFORM =~ /mswin|mingw|windows/i
          win_path = file_path.tr('/', '\\')
          Thread.new do
            system("explorer.exe /select,\"#{win_path}\"")
          end
        end
      end

      private

      def self.xml_escape(str)
        return '' unless str
        str.to_s
           .gsub('&', '&amp;')
           .gsub('<', '&lt;')
           .gsub('>', '&gt;')
           .gsub('"', '&quot;')
           .gsub("'", '&apos;')
      end

      def self.csv_escape(str)
        return '""' unless str
        clean = str.to_s.gsub('"', '""')
        "\"#{clean}\""
      end
    end
  end
end
