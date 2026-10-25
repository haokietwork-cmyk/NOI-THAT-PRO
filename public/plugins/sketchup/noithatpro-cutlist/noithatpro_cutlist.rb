# ==============================================================================
# NỀN TẢNG NỘI THẤT PRO - PLUGIN BÓC TÁCH CUTLIST SKETCHUP (BẢN PRO V1.0)
# Tên file: noithatpro_cutlist.rb
# Tương thích: SketchUp 2017 - 2026 (Windows 64-bit / Ruby API 2.7 - 3.2+)
# Mô hình: Replica tối ưu vượt trội hơn OpenCutList cho xưởng mộc Việt Nam
# ==============================================================================

require 'sketchup.rb'
require 'extensions.rb'

module NoiThatPro
  module CutlistPro
    # Kích hoạt sẵn chế độ Host Developer Master
    HOST_DEVELOPER_MASTER = true

    PLUGIN_ROOT = File.dirname(__FILE__)
    PLUGIN_DIR  = File.join(PLUGIN_ROOT, 'noithatpro_cutlist')

    # Đăng ký Extension chính thống với SketchUp
    EXTENSION = SketchupExtension.new(
      'NoiThatPro Cutlist & BOM Pro',
      File.join(PLUGIN_DIR, 'main.rb')
    )
    EXTENSION.description = 'Công cụ bóc tách ván công nghiệp, tự động dán chỉ viền PVC và xuất dự toán báo giá chuẩn xưởng mộc Việt Nam.'
    EXTENSION.version     = '1.0.0'
    EXTENSION.creator     = 'NoiThatPro Engineering'
    EXTENSION.copyright   = '2026 NoiThatPro.vn'

    Sketchup.register_extension(EXTENSION, true)
  end
end
