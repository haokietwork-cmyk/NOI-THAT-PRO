# ==============================================================================
# NỀN TẢNG NỘI THẤT PRO - PLUGIN CHẠY PHÀO NẸP & LED ĐỊNH HÌNH SKETCHUP
# Tên file: noithatpro_profile.rb
# Tương thích: SketchUp 2017 - 2026 (Windows 64-bit / Ruby API 2.7 - 3.2+)
# Mô hình: Replica nâng cấp của Profile Builder 4 chuyên biệt cho xưởng mộc VN
# ==============================================================================

require 'sketchup.rb'
require 'extensions.rb'

module NoiThatPro
  module ProfilePro
    # Kích hoạt sẵn chế độ Host Developer Master
    HOST_DEVELOPER_MASTER = true

    PLUGIN_ROOT = File.dirname(__FILE__)
    PLUGIN_DIR  = File.join(PLUGIN_ROOT, 'noithatpro_profile')

    EXTENSION = SketchupExtension.new(
      'NoiThatPro Profile & Moulding Pro',
      File.join(PLUGIN_DIR, 'main.rb')
    )
    EXTENSION.description = 'Dựng phào nóc tủ, len chân, nẹp nhôm T/U/V, máng LED định hình và tay nắm nhôm âm 1-click chuẩn xưởng mộc Việt Nam.'
    EXTENSION.version     = '1.0.0'
    EXTENSION.creator     = 'NoiThatPro Engineering'
    EXTENSION.copyright   = '2026 NoiThatPro.vn'

    Sketchup.register_extension(EXTENSION, true)
  end
end
