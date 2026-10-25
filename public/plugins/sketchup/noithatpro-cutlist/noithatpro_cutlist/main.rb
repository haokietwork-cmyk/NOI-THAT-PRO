# ==============================================================================
# ENTRY POINT CỦA EXTENSION NOITHATPRO CUTLIST PRO CHO SKETCHUP
# Tên file: main.rb
# ==============================================================================

require 'json'
require_relative 'core/extractor'
require_relative 'core/exporter'
require_relative 'core/licensing'
require_relative 'ui/dialog'

module NoiThatPro
  module CutlistPro
    unless file_loaded?(__FILE__)
      # 1. Đăng ký Menu
      menu = UI.menu('Plugins')
      sub_menu = menu.add_submenu('NoiThatPro Nội Thất')
      
      cmd_cutlist = UI::Command.new('Bóc Tách Cutlist & Báo Giá (QC)') {
        DialogManager.show
      }
      cmd_cutlist.tooltip = 'Bóc tách chi tiết ván, nẹp chỉ viền và dự toán báo giá tự động'
      cmd_cutlist.status_bar_text = 'Bóc tách ván gỗ công nghiệp chuẩn xưởng mộc Việt Nam'
      
      sub_menu.add_item(cmd_cutlist)

      # 2. Đăng ký Toolbar
      toolbar = UI::Toolbar.new('NoiThatPro Tools')
      toolbar.add_item(cmd_cutlist)
      toolbar.restore

      file_loaded(__FILE__)
    end
  end
end
