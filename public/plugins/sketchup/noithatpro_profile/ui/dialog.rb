# ==============================================================================
# ĐIỀU KHIỂN CỬA SỔ GIAO DIỆN HTMLDIALOG CHO NOITHATPRO PROFILE PRO
# Tên file: dialog.rb
# Tương thích: SketchUp 2017 - 2026 (UI::HtmlDialog)
# ==============================================================================

require 'json'

module NoiThatPro
  module ProfilePro
    class DialogManager
      @dialog = nil

      def self.show
        if @dialog && @dialog.visible?
          @dialog.bring_to_front
          refresh_state
          return
        end

        options = {
          dialog_title:    "NoiThatPro - Dựng Phào Nẹp & LED Định Hình Pro",
          preferences_key: "NoiThatPro_Profile_Dialog",
          scrollable:      true,
          resizable:       true,
          width:           1080,
          height:          750,
          min_width:       880,
          min_height:      560,
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
          refresh_state
        end

        # Chạy phào nẹp theo cạnh đường dẫn đang chọn trong mô hình
        @dialog.add_action_callback("build_profile") do |_context, profile_id, justification, offset_x, offset_y, material, mirror_x, mirror_y, rotation_deg|
          profile_data = ProfileLibrary.get(profile_id)
          unless profile_data
            UI.messagebox("Không tìm thấy biên dạng phào nẹp: #{profile_id}")
            next
          end

          result = Sweeper.build(
            profile_data,
            justification || 'bottom_left',
            (offset_x || 0.0).to_f,
            (offset_y || 0.0).to_f,
            (material && !material.empty?) ? material : nil,
            mirror_x == true,
            mirror_y == true,
            (rotation_deg || 0).to_i
          )

          est = Estimator.scan_model
          payload = {
            result: {
              success: result[:success],
              length_m: result[:length_m] || 0.0,
              message: result[:message]
            },
            estimation: est
          }

          js = "onBuildFinished(#{payload.to_json});"
          @dialog.execute_script(js)
        end

        # Cập nhật khối phào nẹp đã dựng đang chọn trên mô hình (Update Member)
        @dialog.add_action_callback("update_profile") do |_context, profile_id, justification, offset_x, offset_y, material, mirror_x, mirror_y, rotation_deg|
          profile_data = ProfileLibrary.get(profile_id)
          unless profile_data
            UI.messagebox("Không tìm thấy biên dạng phào nẹp: #{profile_id}")
            next
          end

          result = Sweeper.update_selected(
            profile_data,
            justification || 'bottom_left',
            (offset_x || 0.0).to_f,
            (offset_y || 0.0).to_f,
            (material && !material.empty?) ? material : nil,
            mirror_x == true,
            mirror_y == true,
            (rotation_deg || 0).to_i
          )

          est = Estimator.scan_model
          payload = {
            result: {
              success: result[:success],
              length_m: result[:length_m] || 0.0,
              message: result[:message]
            },
            estimation: est
          }

          js = "onBuildFinished(#{payload.to_json});"
          @dialog.execute_script(js)
        end

        # Trích xuất mặt cắt từ một Face đang được chọn trong 3D
        @dialog.add_action_callback("save_custom_face") do |_context, custom_name|
          model = Sketchup.active_model
          face = model.selection.grep(Sketchup::Face).first
          unless face
            UI.messagebox("Vui lòng click chọn 1 mặt phẳng (Face) trong mô hình SketchUp trước khi bấm tạo mặt cắt tự vẽ!")
            next
          end

          name = (custom_name && !custom_name.to_s.strip.empty?) ? custom_name.to_s.strip : "Mat_Cat_Tu_Ve_#{Time.now.strftime('%H%M%S')}"
          custom_data = ProfileLibrary.create_from_face(face, name)
          if custom_data
            custom_id = "CUSTOM_#{Time.now.to_i}"
            ProfileLibrary.register_custom(custom_id, custom_data)
            
            js = "onCustomProfileAdded(#{custom_data.merge(id: custom_id).to_json});"
            @dialog.execute_script(js)
            UI.messagebox("Đã trích xuất và thêm mặt cắt [#{name}] thành công vào Thư viện!")
          else
            UI.messagebox("Không thể trích xuất mặt cắt từ Face đã chọn!")
          end
        end

        # Xóa mặt cắt tự vẽ khỏi thư viện
        @dialog.add_action_callback("delete_custom_profile") do |_context, profile_id|
          deleted = ProfileLibrary.delete_custom(profile_id)
          if deleted
            js = "onCustomProfileDeleted(#{profile_id.to_json});"
            @dialog.execute_script(js)
            UI.messagebox("Đã xóa mặt cắt tự vẽ khỏi Thư viện!")
          end
        end

        # Quét lại mô hình và cập nhật số mét dài / số cây cần mua
        @dialog.add_action_callback("refresh_estimation") do |_context|
          est = Estimator.scan_model
          js = "onEstimationUpdated(#{est.to_json});"
          @dialog.execute_script(js)
        end

        # Xuất file Excel dự toán & đặt mua phào nẹp
        @dialog.add_action_callback("export_excel") do |_context|
          lic = Licensing.license_info
          unless lic[:is_valid]
            js = "onLicenseRequired();"
            @dialog.execute_script(js)
            UI.messagebox("Vui lòng kích hoạt bản quyền để xuất Bảng dự toán phào nẹp sang Excel!")
            next
          end

          est = Estimator.scan_model
          if est[:items].empty?
            UI.messagebox("Trong mô hình hiện chưa có phào nẹp nào do NoiThatPro dựng để xuất Excel!")
            next
          end

          file_path = Exporter.export_to_excel(est)
          if file_path
            js = "onExportSuccess(#{file_path.to_json}, 'Excel');"
            @dialog.execute_script(js)
            Exporter.open_in_explorer(file_path)
          end
        end

        # Xuất file CSV dự toán
        @dialog.add_action_callback("export_csv") do |_context|
          lic = Licensing.license_info
          unless lic[:is_valid]
            js = "onLicenseRequired();"
            @dialog.execute_script(js)
            UI.messagebox("Vui lòng kích hoạt bản quyền để xuất file CSV!")
            next
          end

          est = Estimator.scan_model
          if est[:items].empty?
            UI.messagebox("Chưa có phào nẹp nào trong mô hình để xuất CSV!")
            next
          end

          file_path = Exporter.export_to_csv(est)
          if file_path
            js = "onExportSuccess(#{file_path.to_json}, 'CSV');"
            @dialog.execute_script(js)
            Exporter.open_in_explorer(file_path)
          end
        end

        # Smart-Path: Tự động truy vết chuỗi cạnh
        @dialog.add_action_callback("smart_path_select") do |_context|
          res = Sweeper.smart_path_trace
          js = "onSmartPathResult(#{res.to_json});"
          @dialog.execute_script(js)
        end

        # Hole Tool: Khoét lỗ Parametric
        @dialog.add_action_callback("cut_hole") do |_context, hole_type, p1, p2, offset_dist|
          res = Sweeper.cut_hole(hole_type, p1, p2, offset_dist)
          js = "onHoleResult(#{res.to_json});"
          @dialog.execute_script(js)
        end

        # Extend / Miter Tool: Kéo dài & Cắt mòi
        @dialog.add_action_callback("extend_member") do |_context, d_start, d_end|
          res = Sweeper.extend_member(d_start, d_end)
          js = "onExtendResult(#{res.to_json});"
          @dialog.execute_script(js)
        end

        # Join Tool: Hàn nối 2 thanh phào
        @dialog.add_action_callback("join_members") do |_context|
          res = Sweeper.join_members
          js = "onJoinResult(#{res.to_json});"
          @dialog.execute_script(js)
        end

        # Build Assembly: Dựng tổ hợp
        @dialog.add_action_callback("build_assembly") do |_context, asm_id, spacing|
          res = Sweeper.build_assembly(asm_id, (spacing || 500.0).to_f)
          est = Estimator.scan_model
          payload = { result: res, estimation: est }
          js = "onBuildFinished(#{payload.to_json});"
          @dialog.execute_script(js)
        end

        # Kích hoạt License key
        @dialog.add_action_callback("activate_license") do |_context, key|
          Licensing.activate(key) do |success, message|
            info = Licensing.license_info
            js = "onActivationResult(#{success.to_json}, #{message.to_json}, #{info.to_json});"
            @dialog.execute_script(js)
          end
        end

        # Mở trang web tính năng
        @dialog.add_action_callback("open_web_quoting") do |_context|
          UI.openURL("https://webnoithatpro.vn/quoting")
        end

        @dialog.add_action_callback("open_web_store") do |_context|
          UI.openURL("https://webnoithatpro.vn/pricing")
        end
      end

      def self.refresh_state
        return unless @dialog

        profiles = ProfileLibrary.all_profiles
        assemblies = ProfileLibrary.all_assemblies
        lic = Licensing.license_info
        est = Estimator.scan_model

        payload = {
          profiles: profiles,
          assemblies: assemblies,
          license: lic,
          estimation: est
        }

        js = "initProfilePro(#{payload.to_json});"
        @dialog.execute_script(js)
      end
    end
  end
end
