# ==============================================================================
# BỘ XUẤT FILE CUTLIST CHUYÊN NGHIỆP: EXCEL (.XLS) & CSV (UTF-8 BOM)
# Tên file: exporter.rb
# Bản quyền: NoiThatPro.vn
# Tính năng:
#   1. Xuất file Excel (.xls) có định dạng bảng biểu, màu sắc, công thức tính tổng
#   2. Xuất file CSV (UTF-8 có BOM) tương thích 100% với Web Báo Giá & CNC Nesting
#   3. Tự động bôi đen mở file trong Windows Explorer
# ==============================================================================

module NoiThatPro
  module CutlistPro
    class Exporter

      # ------------------------------------------------------------------------
      # 1. XUẤT FILE EXCEL (.XLS CHUẨN XML SPREADSHEET ĐẦY ĐỦ STYLE)
      # ------------------------------------------------------------------------
      def self.export_to_excel(parts, summary = {}, custom_path = nil)
        return nil if parts.nil? || parts.empty?

        export_path = custom_path || default_export_path('.xls')
        time_str = Time.now.strftime('%d/%m/%Y %H:%M')

        File.open(export_path, 'wb:UTF-8') do |f|
          # Header XML Spreadsheet
          f.puts '<?xml version="1.0" encoding="UTF-8"?>'
          f.puts '<?mso-application progid="Excel.Sheet"?>'
          f.puts '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"'
          f.puts ' xmlns:o="urn:schemas-microsoft-com:office:office"'
          f.puts ' xmlns:x="urn:schemas-microsoft-com:office:excel"'
          f.puts ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"'
          f.puts ' xmlns:html="http://www.w3.org/TR/REC-html40">'

          # Định nghĩa Style màu sắc, đường viền và font chữ
          f.puts ' <Styles>'
          f.puts '  <Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#1E293B"/></Style>'
          f.puts '  <Style ss:ID="TitleStyle"><Font ss:FontName="Segoe UI" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/><Alignment ss:Horizontal="Left" ss:Vertical="Center"/></Style>'
          f.puts '  <Style ss:ID="SubTitleStyle"><Font ss:FontName="Segoe UI" ss:Size="10" ss:Italic="1" ss:Color="#64748B"/></Style>'
          f.puts '  <Style ss:ID="HeaderStyle"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0F766E" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#042F2E"/></Borders></Style>'
          f.puts '  <Style ss:ID="SectionStyle"><Font ss:FontName="Segoe UI" ss:Size="12" ss:Bold="1" ss:Color="#0F766E"/><Interior ss:Color="#F0FDFA" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#99F6E4"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataLeft"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataCenter"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataNumber"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataDecimal"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0.000"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="DataMoney"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0 &quot;đ&quot;"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>'
          f.puts '  <Style ss:ID="TotalStyle"><Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/><Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0284C7"/><Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0284C7"/></Borders></Style>'
          f.puts ' </Styles>'

          # --------------------------------------------------------------------
          # SHEET 1: DANH MỤC CẮT VÁN CHI TIẾT
          # --------------------------------------------------------------------
          f.puts ' <Worksheet ss:Name="Danh_Muc_Tam_Cat">'
          f.puts '  <Table ss:DefaultRowHeight="20">'
          f.puts '   <Column ss:Width="35"/>'   # STT
          f.puts '   <Column ss:Width="140"/>'  # Hạng mục
          f.puts '   <Column ss:Width="160"/>'  # Tên chi tiết
          f.puts '   <Column ss:Width="65"/>'   # Dài
          f.puts '   <Column ss:Width="65"/>'   # Rộng
          f.puts '   <Column ss:Width="50"/>'   # Dày
          f.puts '   <Column ss:Width="45"/>'   # SL
          f.puts '   <Column ss:Width="75"/>'   # S 1 tấm
          f.puts '   <Column ss:Width="85"/>'   # Tổng S
          f.puts '   <Column ss:Width="140"/>'  # Mã vật tư
          f.puts '   <Column ss:Width="100"/>'  # Dán chỉ
          f.puts '   <Column ss:Width="70"/>'   # Mét chỉ
          f.puts '   <Column ss:Width="90"/>'   # Ghi chú

          # Tiêu đề bảng
          f.puts '   <Row ss:Height="30">'
          f.puts '    <Cell ss:MergeAcross="12" ss:StyleID="TitleStyle"><Data ss:Type="String">BẢNG KÊ BÓC TÁCH VẬT TƯ &amp; QUY CÁCH CẮT VÁN NỘI THẤT</Data></Cell>'
          f.puts '   </Row>'
          f.puts '   <Row ss:Height="18">'
          f.puts "    <Cell ss:MergeAcross=\"12\" ss:StyleID=\"SubTitleStyle\"><Data ss:Type=\"String\">Thời gian xuất: #{time_str} | Phần mềm: NoiThatPro Cutlist &amp; BOM V1.0</Data></Cell>"
          f.puts '   </Row>'
          f.puts '   <Row ss:Height="10"/>'

          # Header Cột
          f.puts '   <Row ss:Height="24">'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">STT</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Hạng Mục</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tên Chi Tiết</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dài (mm)</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Rộng (mm)</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dày</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">SL</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">S (m²)</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tổng S (m²)</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Mã Vật Tư</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Dán Chỉ PVC</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Mét Chỉ</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Ghi Chú</Data></Cell>'
          f.puts '   </Row>'

          total_area_all = 0.0
          total_edge_all = 0.0

          parts.each_with_index do |p, idx|
            single_area = (p[:length] * p[:width]) / 1_000_000.0
            total_part_area = single_area * p[:qty]
            total_area_all += total_part_area

            # Tính mét chỉ
            edge_mm = 0
            case p[:edges]
            when '4_CANH' then edge_mm = 2 * (p[:length] + p[:width])
            when '1_DAI' then edge_mm = p[:length]
            when '2_DAI' then edge_mm = 2 * p[:length]
            when '2_DAI_1_RONG' then edge_mm = 2 * p[:length] + p[:width]
            when 'KHONG_DAN' then edge_mm = 0
            else edge_mm = p[:length]
            end
            part_edge_m = (edge_mm * p[:qty] * 1.08) / 1000.0
            total_edge_all += part_edge_m

            note_text = p[:has_curve] ? "Bo Cong R" : ""

            f.puts '   <Row ss:Height="20">'
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"Number\">#{idx + 1}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataLeft\"><Data ss:Type=\"String\">#{xml_escape(p[:module_name])}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataLeft\"><Data ss:Type=\"String\">#{xml_escape(p[:part_name])}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataNumber\"><Data ss:Type=\"Number\">#{p[:length]}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataNumber\"><Data ss:Type=\"Number\">#{p[:width]}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"Number\">#{p[:thickness]}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"Number\">#{p[:qty]}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataDecimal\"><Data ss:Type=\"Number\">#{single_area.round(3)}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataDecimal\"><Data ss:Type=\"Number\">#{total_part_area.round(3)}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataLeft\"><Data ss:Type=\"String\">#{xml_escape(p[:material])}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"String\">#{xml_escape(p[:edges])}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataDecimal\"><Data ss:Type=\"Number\">#{part_edge_m.round(2)}</Data></Cell>"
            f.puts "    <Cell ss:StyleID=\"DataCenter\"><Data ss:Type=\"String\">#{xml_escape(note_text)}</Data></Cell>"
            f.puts '   </Row>'
          end

          # Dòng Tổng Cộng (Total)
          f.puts '   <Row ss:Height="22">'
          f.puts '    <Cell ss:MergeAcross="7" ss:StyleID="TotalStyle"><Data ss:Type="String">TỔNG CỘNG:</Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"Number\">#{total_area_all.round(3)}</Data></Cell>"
          f.puts '    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"String\"></Data></Cell>'
          f.puts '    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"String\"></Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"Number\">#{total_edge_all.round(2)}</Data></Cell>"
          f.puts '    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"String\"></Data></Cell>'
          f.puts '   </Row>'

          f.puts '  </Table>'
          f.puts ' </Worksheet>'

          # --------------------------------------------------------------------
          # SHEET 2: TỔNG HỢP VẬT TƯ ĐẶT MUA ĐẠI LÝ (SUMMARY SHEET)
          # --------------------------------------------------------------------
          f.puts ' <Worksheet ss:Name="Tong_Hop_Dat_Hang">'
          f.puts '  <Table ss:DefaultRowHeight="22">'
          f.puts '   <Column ss:Width="40"/>'
          f.puts '   <Column ss:Width="220"/>'
          f.puts '   <Column ss:Width="110"/>'
          f.puts '   <Column ss:Width="110"/>'
          f.puts '   <Column ss:Width="110"/>'
          f.puts '   <Column ss:Width="140"/>'

          f.puts '   <Row ss:Height="30">'
          f.puts '    <Cell ss:MergeAcross="5" ss:StyleID="TitleStyle"><Data ss:Type="String">TỔNG HỢP VẬT TƯ ĐẶT HÀNG ĐẠI LÝ &amp; DỰ TOÁN GIÁ VỐN</Data></Cell>'
          f.puts '   </Row>'
          f.puts '   <Row ss:Height="18">'
          f.puts '    <Cell ss:MergeAcross="5" ss:StyleID="SubTitleStyle"><Data ss:Type="String">Khổ ván chuẩn: 1220 x 2440 mm (2.977 m²) | Hệ số hao hụt ván: 15% | Hao hụt chỉ: 8%</Data></Cell>'
          f.puts '   </Row>'
          f.puts '   <Row ss:Height="10"/>'

          # Header Sheet 2
          f.puts '   <Row ss:Height="24">'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">STT</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Loại Vật Tư / Công Việc</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Khối Lượng Net</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Số Lượng Đặt Mua</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Đơn Vị Tính</Data></Cell>'
          f.puts '    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Ghi Chú</Data></Cell>'
          f.puts '   </Row>'

          # Dòng 1: Ván 17mm
          f.puts '   <Row>'
          f.puts '    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">1</Data></Cell>'
          f.puts '    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Ván MDF 17mm chống ẩm (Thùng, Cánh)</Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"DataDecimal\"><Data ss:Type=\"Number\">#{summary[:net_area_17] || 0}</Data></Cell>"
          f.puts "    <Cell ss:StyleID=\"DataNumber\"><Data ss:Type=\"Number\">#{summary[:total_sheets_17] || 0}</Data></Cell>"
          f.puts '    <Cell ss:StyleID="DataCenter"><Data ss:Type="String">Tấm (1220x2440)</Data></Cell>'
          f.puts '    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Đã gồm 15% hao hụt</Data></Cell>'
          f.puts '   </Row>'

          # Dòng 2: Ván Hậu 6mm
          f.puts '   <Row>'
          f.puts '    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">2</Data></Cell>'
          f.puts '    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Ván Hậu MDF 6mm (Đáy kéo, Hậu tủ)</Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"DataDecimal\"><Data ss:Type=\"Number\">#{summary[:net_area_6] || 0}</Data></Cell>"
          f.puts "    <Cell ss:StyleID=\"DataNumber\"><Data ss:Type=\"Number\">#{summary[:total_sheets_6] || 0}</Data></Cell>"
          f.puts '    <Cell ss:StyleID="DataCenter"><Data ss:Type="String">Tấm (1220x2440)</Data></Cell>'
          f.puts '    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Đã gồm 15% hao hụt</Data></Cell>'
          f.puts '   </Row>'

          # Dòng 3: Chỉ dán cạnh PVC
          f.puts '   <Row>'
          f.puts '    <Cell ss:StyleID="DataCenter"><Data ss:Type="Number">3</Data></Cell>'
          f.puts '    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Chỉ dán cạnh PVC 21x1.0mm</Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"DataDecimal\"><Data ss:Type=\"Number\">#{summary[:total_edge_meters] || 0}</Data></Cell>"
          f.puts "    <Cell ss:StyleID=\"DataNumber\"><Data ss:Type=\"Number\">#{summary[:total_edge_rolls] || 0}</Data></Cell>"
          f.puts '    <Cell ss:StyleID="DataCenter"><Data ss:Type="String">Cuộn (100m)</Data></Cell>'
          f.puts '    <Cell ss:StyleID="DataLeft"><Data ss:Type="String">Đã gồm 8% hao hụt chỉ</Data></Cell>'
          f.puts '   </Row>'

          f.puts '   <Row ss:Height="12"/>'

          # Bảng Ước Tính Giá Vốn Xưởng
          f.puts '   <Row>'
          f.puts '    <Cell ss:MergeAcross="3" ss:StyleID="SectionStyle"><Data ss:Type="String">DỰ TOÁN GIÁ THÀNH XƯỞNG (THAM KHẢO)</Data></Cell>'
          f.puts '    <Cell ss:MergeAcross="1" ss:StyleID="SectionStyle"><Data ss:Type="String"></Data></Cell>'
          f.puts '   </Row>'

          f.puts '   <Row>'
          f.puts '    <Cell ss:MergeAcross="2" ss:StyleID="DataLeft"><Data ss:Type="String">Tổng Giá Vốn Sản Xuất (Vật tư + Nhân công)</Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"DataMoney\"><Data ss:Type=\"Number\">#{summary[:estimated_cost] || 0}</Data></Cell>"
          f.puts '    <Cell ss:MergeAcross="1" ss:StyleID="DataLeft"><Data ss:Type="String">Chi phí tại xưởng</Data></Cell>'
          f.puts '   </Row>'

          f.puts '   <Row>'
          f.puts '    <Cell ss:MergeAcross="2" ss:StyleID="DataLeft"><Data ss:Type="String">Báo Giá Đề Xuất Gửi Khách Hàng (Biên lợi nhuận 35%)</Data></Cell>'
          f.puts "    <Cell ss:StyleID=\"TotalStyle\"><Data ss:Type=\"Number\">#{summary[:client_quote] || 0}</Data></Cell>"
          f.puts '    <Cell ss:MergeAcross="1" ss:StyleID="DataLeft"><Data ss:Type="String">Giá chốt hợp đồng</Data></Cell>'
          f.puts '   </Row>'

          f.puts '  </Table>'
          f.puts ' </Worksheet>'

          f.puts '</Workbook>'
        end

        export_path
      rescue => e
        UI.messagebox("Lỗi xuất file Excel: #{e.message}")
        nil
      end

      # ------------------------------------------------------------------------
      # 2. XUẤT FILE CSV CHUẨN 8 CỘT (UTF-8 BOM CHO WEB & CNC)
      # ------------------------------------------------------------------------
      def self.export_to_csv(parts, custom_path = nil)
        return nil if parts.nil? || parts.empty?

        export_path = custom_path || default_export_path('.csv')
        
        File.open(export_path, 'wb:UTF-8') do |f|
          f.write("\xEF\xBB\xBF") # UTF-8 BOM
          f.puts("Hang_Muc,Ten_Chi_Tiet,Dai,Rong,Day,So_Luong,Ma_Vat_Lieu,Dan_Canh")

          parts.each do |p|
            line = [
              p[:module_name],
              p[:part_name],
              p[:length],
              p[:width],
              p[:thickness],
              p[:qty],
              p[:material],
              p[:edges]
            ].join(",")
            f.puts(line)
          end
        end

        export_path
      rescue => e
        UI.messagebox("Lỗi xuất file CSV: #{e.message}")
        nil
      end

      # Mở thư mục Explorer trên Windows
      def self.open_in_explorer(file_path)
        return unless file_path && File.exist?(file_path)
        win_path = file_path.tr('/', '\\')
        system("explorer /select,\"#{win_path}\"")
      end

      private

      def self.default_export_path(extension = '.csv')
        model = Sketchup.active_model
        dir = if model && !model.path.empty?
                File.dirname(model.path)
              else
                File.join(ENV['USERPROFILE'] || ENV['HOME'], 'Desktop')
              end
        
        timestamp = Time.now.strftime('%Y%m%d_%H%M%S')
        File.join(dir, "NoiThatPro_Cutlist_#{timestamp}#{extension}")
      end

      def self.xml_escape(str)
        str.to_s.gsub('&', '&amp;').gsub('<', '&lt;').gsub('>', '&gt;').gsub('"', '&quot;')
      end
    end
  end
end
