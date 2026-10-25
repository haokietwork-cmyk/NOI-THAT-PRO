# ==============================================================================
# ENTRY POINT CỦA EXTENSION NOITHATPRO PROFILE & MOULDING PRO CHO SKETCHUP
# Tên file: main.rb
# Tương thích: SketchUp 2017 - 2026
# Bản quyền: NoiThatPro.vn
# ==============================================================================

require 'json'
require_relative 'core/profile_library'
require_relative 'core/sweeper'
require_relative 'core/estimator'
require_relative 'core/licensing'
require_relative 'core/exporter'
require_relative 'ui/dialog'

module NoiThatPro
  module ProfilePro
    unless file_loaded?(__FILE__)
      # 1. Đăng ký Menu Plugin
      plugins_menu = UI.menu('Plugins')
      sub_menu = plugins_menu.add_submenu('NoiThatPro Nội Thất')
      
      cmd_profile = UI::Command.new('Dựng Phào Nẹp & LED (Profile Pro)') {
        DialogManager.show
      }
      cmd_profile.tooltip = 'Dựng phào nóc tủ, len chân, nẹp nhôm T/U/V, máng LED và tay nắm âm 1-click'
      cmd_profile.status_bar_text = 'Dựng phào nẹp định hình chuẩn xưởng mộc Việt Nam'
      
      sub_menu.add_item(cmd_profile)

      # 2. Đăng ký Toolbar
      toolbar = UI::Toolbar.new('NoiThatPro Profile Pro')
      toolbar.add_item(cmd_profile)
      toolbar.restore

      # 3. Đăng ký Context Menu (Chuột phải thông minh)
      UI.add_context_menu_handler do |context_menu|
        selection = Sketchup.active_model.selection
        edges = selection.grep(Sketchup::Edge)
        faces = selection.grep(Sketchup::Face)

        if edges.size > 0
          sub_ctx = context_menu.add_submenu('NoiThatPro Profile Pro')
          sub_ctx.add_item('Dựng Phào Nẹp theo cạnh đang chọn...') {
            DialogManager.show
          }
        elsif faces.size == 1
          sub_ctx = context_menu.add_submenu('NoiThatPro Profile Pro')
          sub_ctx.add_item('Trích xuất & Lưu Mặt Cắt Tự Vẽ...') {
            DialogManager.show
          }
        end
      end

      file_loaded(__FILE__)
    end
  end
end
