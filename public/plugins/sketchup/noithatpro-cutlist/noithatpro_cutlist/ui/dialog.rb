# ==============================================================================
# ĐIỀU KHIỂN CỬA SỔ GIAO DIỆN HTMLDIALOG CHO SKETCHUP
# Tên file: dialog.rb
# Tương thích: SketchUp 2017+ (UI::HtmlDialog)
# ==============================================================================

module NoiThatPro
  module CutlistPro
    class DialogManager
      @dialog = nil
      @extractor = nil
      @last_result = nil

      def self.show
        if @dialog && @dialog.visible?
          @dialog.bring_to_front
          refresh_data
          return
        end

        options = {
          dialog_title:    "NoiThatPro - Bóc Tách Cutlist & Báo Giá Pro",
          preferences_key: "NoiThatPro_Cutlist_Dialog",
          scrollable:      true,
          resizable:       true,
          width:           1080,
          height:          750,
          min_width:       850,
          min_height:      550,
          style:           UI::HtmlDialog::STYLE_DIALOG
        }

        @dialog = UI::HtmlDialog.new(options)
        html_file = File.join(File.dirname(__FILE__), 'index.html')
        @dialog.set_file(html_file)

        register_callbacks
        @dialog.show
      end

      def self.register_callbacks
        @dialog.add_action_callback("app_ready") do |_context|
          refresh_data
        end

        @dialog.add_action_callback("refresh") do |_context, selection_only|
          refresh_data(selection_only == true)
        end

        @dialog.add_action_callback("export_csv") do |_context|
          # Kiểm tra quyền xuất file
          lic = Licensing.license_info
          unless lic[:is_valid]
            js = "onLicenseRequired();"
            @dialog.execute_script(js)
            UI.messagebox("Vui lòng kích hoạt bản quyền để xuất file CSV dự toán!")
            next
          end

          if @last_result && @last_result[:parts] && !@last_result[:parts].empty?
            file_path = Exporter.export_to_csv(@last_result[:parts])
            if file_path
              # Gửi thông báo thành công về giao diện HTML
              js = "onExportSuccess(#{file_path.to_json}, 'CSV');"
              @dialog.execute_script(js)

              # Mở thư mục Explorer
              Exporter.open_in_explorer(file_path)
            end
          else
            UI.messagebox("Chưa có dữ liệu chi tiết tấm để xuất CSV!")
          end
        end

        @dialog.add_action_callback("export_excel") do |_context|
          # Kiểm tra quyền xuất file
          lic = Licensing.license_info
          unless lic[:is_valid]
            js = "onLicenseRequired();"
            @dialog.execute_script(js)
            UI.messagebox("Vui lòng kích hoạt bản quyền để xuất file Excel đặt ván xưởng!")
            next
          end

          if @last_result && @last_result[:parts] && !@last_result[:parts].empty?
            file_path = Exporter.export_to_excel(@last_result[:parts], @last_result[:summary])
            if file_path
              js = "onExportSuccess(#{file_path.to_json}, 'Excel');"
              @dialog.execute_script(js)
              Exporter.open_in_explorer(file_path)
            end
          else
            UI.messagebox("Chưa có dữ liệu chi tiết tấm để xuất Excel!")
          end
        end

        @dialog.add_action_callback("activate_license") do |_context, key|
          Licensing.activate(key) do |success, message|
            info = Licensing.license_info
            js = "onActivationResult(#{success.to_json}, #{message.to_json}, #{info.to_json});"
            @dialog.execute_script(js)
          end
        end

        @dialog.add_action_callback("open_web_quoting") do |_context|
          UI.openURL("https://webnoithatpro.vn/quoting")
        end

        @dialog.add_action_callback("open_web_store") do |_context|
          UI.openURL("https://webnoithatpro.vn/pricing")
        end
      end

      def self.refresh_data(selection_only = false)
        return unless @dialog

        @extractor ||= Extractor.new
        @last_result = @extractor.extract(selection_only)
        license_info = Licensing.license_info

        # Chuyển dữ liệu sang JSON và đẩy sang JS trong HtmlDialog
        json_payload = {
          parts: @last_result[:parts],
          summary: @last_result[:summary],
          total_raw: @last_result[:total_raw_parts],
          license: license_info
        }.to_json

        # Gọi hàm JS trong HTML
        js = "renderCutlistData(#{json_payload});"
        @dialog.execute_script(js)
      end
    end
  end
end
