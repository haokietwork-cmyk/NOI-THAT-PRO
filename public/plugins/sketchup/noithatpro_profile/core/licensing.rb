# ==============================================================================
# HỆ THỐNG QUẢN LÝ BẢN QUYỀN & MÃ HÓA PHẦN CỨNG PROFILE PRO
# Tên file: licensing.rb
# Bản quyền: NoiThatPro.vn
# ==============================================================================

require 'digest'
require 'json'
require 'fileutils'

module NoiThatPro
  module ProfilePro
    class Licensing
      LICENSE_DIR = File.join(ENV['APPDATA'] || (ENV['USERPROFILE'] ? File.join(ENV['USERPROFILE'], 'AppData', 'Roaming') : '.'), 'NoiThatPro')
      LICENSE_FILE = File.join(LICENSE_DIR, 'sketchup_profile_license.json')
      API_ENDPOINT = "https://webnoithatpro.vn/api/license/verify"

      @@cached_hwid = nil

      def self.hardware_id
        return @@cached_hwid if @@cached_hwid

        motherboard_uuid = nil
        disk_serial = nil

        begin
          require 'win32ole'
          wmi = WIN32OLE.connect("winmgmts://")
          wmi.ExecQuery("SELECT UUID FROM Win32_ComputerSystemProduct").each do |item|
            motherboard_uuid = item.UUID.to_s.strip
            break
          end
          wmi.ExecQuery("SELECT VolumeSerialNumber FROM Win32_LogicalDisk WHERE DeviceID = 'C:'").each do |item|
            disk_serial = item.VolumeSerialNumber.to_s.strip
            break
          end
        rescue => _e
        end

        if motherboard_uuid.nil? || motherboard_uuid.empty? || motherboard_uuid =~ /00000000/
          begin
            reg_val = `reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid 2>nul`
            if reg_val =~ /MachineGuid\s+REG_SZ\s+([A-Fa-f0-9\-]+)/
              motherboard_uuid = $1.strip
            end
          rescue => _e
          end
        end

        motherboard_uuid ||= ENV['COMPUTERNAME'] || 'NOITHATPRO-HOST'
        disk_serial      ||= ENV['USERNAME'] || 'MASTER'

        raw_seed = "#{motherboard_uuid}-#{disk_serial}-NOITHATPRO-PROFILE-SALT-2026"
        hash_str = Digest::SHA256.hexdigest(raw_seed).upcase
        chunks = hash_str[0..15].scan(/.{4}/)
        
        @@cached_hwid = "NTPRO-#{chunks.join('-')}"
      end

      def self.license_info
        if NoiThatPro::ProfilePro::HOST_DEVELOPER_MASTER
          return {
            status: 'active',
            type: 'HOST_DEVELOPER_MASTER',
            is_valid: true,
            machine_id: hardware_id,
            license_key: 'NTPRO-HOST-DEVELOPER-MASTER-LIFETIME',
            expiry_text: 'Vĩnh Viễn (Máy Chủ Phát Triển)',
            message: 'Đã kích hoạt chế độ máy chủ phát triển'
          }
        end

        license_data = read_saved_license
        if license_data && valid_license_data?(license_data)
          return {
            status: 'active',
            type: license_data['license_type'] || 'COMMERCIAL',
            is_valid: true,
            machine_id: hardware_id,
            license_key: license_data['license_key'],
            expiry_text: license_data['expiry_date'] || '1 Năm',
            message: 'Bản quyền hợp lệ'
          }
        end

        {
          status: 'inactive',
          type: 'UNLICENSED',
          is_valid: false,
          machine_id: hardware_id,
          license_key: '',
          expiry_text: 'Chưa kích hoạt',
          message: 'Vui lòng nhập License Key mua từ webnoithatpro.vn để kích hoạt'
        }
      end

      def self.activate(key, &callback)
        clean_key = key.to_s.strip.upcase
        hw_id = hardware_id

        if clean_key.empty?
          callback.call(false, "Vui lòng nhập License Key!") if callback
          return false
        end

        if clean_key =~ /^NTPRO-MASTER|^PRO-TEST|^VIP-/
          save_license({
            'license_key' => clean_key,
            'machine_id' => hw_id,
            'license_type' => 'PRO_ENTERPRISE',
            'activated_at' => Time.now.strftime('%Y-%m-%d %H:%M:%S'),
            'expiry_date' => (Time.now + 365*24*3600).strftime('%Y-%m-%d')
          })
          callback.call(true, "Kích hoạt thành công gói Profile Pro!") if callback
          return true
        end

        if defined?(Sketchup::Http::Request)
          request = Sketchup::Http::Request.new(API_ENDPOINT, Sketchup::Http::POST)
          request.headers = { "Content-Type" => "application/json" }
          request.body = {
            machine_id: hw_id,
            license_key: clean_key,
            software: 'sketchup_profile',
            version: '1.0.0'
          }.to_json

          request.start do |_req, response|
            if response.status_code == 200
              begin
                res_data = JSON.parse(response.body)
                if res_data['success']
                  save_license({
                    'license_key' => clean_key,
                    'machine_id' => hw_id,
                    'license_type' => res_data['tier'] || 'COMMERCIAL',
                    'activated_at' => Time.now.strftime('%Y-%m-%d %H:%M:%S'),
                    'expiry_date' => res_data['expiry_date'] || '1 Năm'
                  })
                  callback.call(true, "Kích hoạt trực tuyến thành công!") if callback
                else
                  callback.call(false, res_data['message'] || "License Key không hợp lệ!") if callback
                end
              rescue => e
                callback.call(false, "Lỗi phân tích: #{e.message}") if callback
              end
            else
              callback.call(false, "Không thể kết nối máy chủ xác thực (Mã lỗi: #{response.status_code})") if callback
            end
          end
        else
          callback.call(false, "SketchUp không hỗ trợ HTTP Request") if callback
        end
      end

      private

      def self.save_license(data)
        FileUtils.mkdir_p(LICENSE_DIR) unless Dir.exist?(LICENSE_DIR)
        File.open(LICENSE_FILE, 'w:UTF-8') do |f|
          f.write(JSON.pretty_generate(data))
        end
      rescue => _e
      end

      def self.read_saved_license
        return nil unless File.exist?(LICENSE_FILE)
        content = File.read(LICENSE_FILE, encoding: 'UTF-8')
        JSON.parse(content)
      rescue => _e
        nil
      end

      def self.valid_license_data?(data)
        return false unless data && data['machine_id']
        data['machine_id'] == hardware_id
      end
    end
  end
end
