# ==============================================================================
# NoiThatPro SketchUp MCP Bridge
# Model Context Protocol (MCP) Live Integration Bridge for SketchUp 2024/2025/2026
# Allows Antigravity & AI Agents to inspect, automate, and control SketchUp live
# ==============================================================================

require 'sketchup.rb'
require 'socket'
require 'json'

module NoiThatPro
  module MCPBridge
    PORT = 9898
    HOST = '127.0.0.1'

    @server = nil
    @timer_id = nil
    @running = false

    def self.start
      return if @running

      begin
        @server = TCPServer.new(HOST, PORT)
        @server.listen(10)
        @running = true
        puts "[NoiThatPro MCP Bridge] Server started on http://#{HOST}:#{PORT}"

        # Start non-blocking polling timer on SketchUp main UI thread
        # Interval: 50ms (20 checks/sec) - zero impact on SketchUp performance
        @timer_id = UI.start_timer(0.05, true) do
          process_requests
        end

        UI.set_toolbar_status("NoiThatPro MCP Bridge: ACTIVE on port #{PORT}") rescue nil
      rescue => e
        puts "[NoiThatPro MCP Bridge] Failed to start server: #{e.message}"
        @running = false
      end
    end

    def self.stop
      if @timer_id
        UI.stop_timer(@timer_id)
        @timer_id = nil
      end
      if @server
        begin
          @server.close
        rescue => e
        end
        @server = nil
      end
      @running = false
      puts "[NoiThatPro MCP Bridge] Server stopped."
    end

    def self.running?
      @running
    end

    def self.process_requests
      return unless @server && @running

      # Process any pending connections non-blockingly
      loop do
        client = nil
        begin
          client = @server.accept_nonblock
        rescue IO::WaitReadable, Errno::EWOULDBLOCK, Errno::EAGAIN
          break # No more incoming connections this tick
        rescue => e
          puts "[NoiThatPro MCP Bridge] Accept error: #{e.message}"
          break
        end

        next unless client

        begin
          # Read HTTP Request Line
          req_line = client.gets
          next unless req_line

          parts = req_line.strip.split(' ')
          method = parts[0] || 'GET'
          raw_path = parts[1] || '/'
          path = raw_path.split('?').first

          # Read Headers
          headers = {}
          content_length = 0
          while (line = client.gets)
            line = line.strip
            break if line.empty?
            if line =~ /^Content-Length:\s*(\d+)/i
              content_length = $1.to_i
            end
            if line =~ /^([^:]+):\s*(.*)$/
              headers[$1.downcase] = $2
            end
          end

          # Read Body if POST / PUT
          body_str = ''
          if content_length > 0
            body_str = client.read(content_length)
          end

          body_json = {}
          if !body_str.empty?
            begin
              body_json = JSON.parse(body_str)
            rescue => e
              body_json = { 'raw' => body_str }
            end
          end

          # Dispatch endpoint safely on main thread
          res_data = handle_route(method, path, body_json)
          send_http_response(client, 200, res_data)
        rescue => e
          puts "[NoiThatPro MCP Bridge] Handler error: #{e.message}\n#{e.backtrace.first(3).join("\n")}"
          send_http_response(client, 500, { success: false, error: e.message, backtrace: e.backtrace.first(5) })
        ensure
          begin
            client.close
          rescue
          end
        end
      end
    end

    def self.send_http_response(client, status_code, data)
      body = JSON.generate(data)
      status_text = status_code == 200 ? "OK" : "Error"
      client.write "HTTP/1.1 #{status_code} #{status_text}\r\n"
      client.write "Content-Type: application/json; charset=utf-8\r\n"
      client.write "Access-Control-Allow-Origin: *\r\n"
      client.write "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
      client.write "Access-Control-Allow-Headers: Content-Type\r\n"
      client.write "Content-Length: #{body.bytesize}\r\n"
      client.write "Connection: close\r\n\r\n"
      client.write body
    end

    def self.handle_route(method, path, body)
      if method == 'OPTIONS'
        return { ok: true }
      end

      model = Sketchup.active_model

      case path
      when '/', '/status'
        return get_status(model)

      when '/eval'
        code = body['code'] || body['script'] || ''
        return eval_ruby_code(code)

      when '/selection'
        return get_selection(model)

      when '/select'
        return set_selection(model, body)

      when '/create_box'
        return create_box(model, body)

      when '/create_face'
        return create_face(model, body)

      when '/screenshot'
        return capture_screenshot(model, body)

      when '/run_cutlist'
        return run_cutlist(model, body)

      when '/run_profile'
        return run_profile(model, body)

      when '/open_dialog'
        return open_dialog(body)

      else
        return { success: false, error: "Endpoint not found: #{path}" }
      end
    end

    # =========================================================================
    # ROUTE HANDLERS
    # =========================================================================

    def self.get_status(model)
      if !model
        return {
          connected: true,
          sketchup_version: Sketchup.version,
          has_active_model: false
        }
      end

      ents = model.active_entities
      sel = model.selection
      bounds = model.bounds

      {
        connected: true,
        sketchup_version: Sketchup.version,
        is_pro: Sketchup.is_pro?,
        model_title: model.title.empty? ? "Untitled" : model.title,
        model_path: model.path,
        entity_count: ents.count,
        selection_count: sel.count,
        layers_count: model.layers.count,
        materials_count: model.materials.count,
        definitions_count: model.definitions.count,
        bounds_mm: {
          width: (bounds.width.to_mm).round(1),
          height: (bounds.height.to_mm).round(1),
          depth: (bounds.depth.to_mm).round(1)
        }
      }
    end

    def self.eval_ruby_code(code)
      if code.nil? || code.strip.empty?
        return { success: false, error: "Empty code provided" }
      end

      begin
        result = eval(code, TOPLEVEL_BINDING)
        {
          success: true,
          result: result.inspect,
          class: result.class.name
        }
      rescue => e
        {
          success: false,
          error: e.message,
          backtrace: e.backtrace.first(5)
        }
      end
    end

    def self.get_selection(model)
      return { success: false, error: "No active model" } unless model

      items = []
      model.selection.each do |ent|
        item = {
          entity_id: ent.entityID,
          type: ent.class.name,
          layer: ent.layer.name
        }

        if ent.is_a?(Sketchup::ComponentInstance)
          item[:name] = ent.name
          item[:definition_name] = ent.definition.name
          b = ent.bounds
          item[:bounds_mm] = {
            width: b.width.to_mm.round(1),
            depth: b.depth.to_mm.round(1),
            height: b.height.to_mm.round(1)
          }
        elsif ent.is_a?(Sketchup::Group)
          item[:name] = ent.name
          b = ent.bounds
          item[:bounds_mm] = {
            width: b.width.to_mm.round(1),
            depth: b.depth.to_mm.round(1),
            height: b.height.to_mm.round(1)
          }
        elsif ent.is_a?(Sketchup::Face)
          item[:area_m2] = (ent.area * 0.00064516).round(4)
        elsif ent.is_a?(Sketchup::Edge)
          item[:length_mm] = ent.length.to_mm.round(1)
        end

        items << item
      end

      {
        success: true,
        count: items.count,
        selection: items
      }
    end

    def self.set_selection(model, body)
      return { success: false, error: "No active model" } unless model

      sel = model.selection
      if body['clear'] == true || body['action'] == 'clear'
        sel.clear
        return { success: true, count: 0, message: "Cleared selection" }
      end

      ids = body['entity_ids'] || body['ids'] || []
      target_entities = []

      model.active_entities.each do |e|
        target_entities << e if ids.include?(e.entityID)
      end

      sel.clear
      sel.add(target_entities) if target_entities.any?

      {
        success: true,
        count: sel.count,
        selected_ids: sel.map(&:entityID)
      }
    end

    def self.create_box(model, body)
      return { success: false, error: "No active model" } unless model

      w = (body['width_mm'] || 500.0).to_f.mm
      d = (body['depth_mm'] || body['length_mm'] || 500.0).to_f.mm
      h = (body['height_mm'] || body['thickness_mm'] || 17.0).to_f.mm
      x = (body['x_mm'] || 0.0).to_f.mm
      y = (body['y_mm'] || 0.0).to_f.mm
      z = (body['z_mm'] || 0.0).to_f.mm
      name = body['name'] || "Box_#{body['width_mm']}x#{body['length_mm'] || body['depth_mm']}x#{body['height_mm']}"

      model.start_operation("MCP: Tạo Hộp 3D", true)
      group = model.active_entities.add_group
      group.name = name

      pts = [
        Geom::Point3d.new(x, y, z),
        Geom::Point3d.new(x + w, y, z),
        Geom::Point3d.new(x + w, y + d, z),
        Geom::Point3d.new(x, y + d, z)
      ]
      face = group.entities.add_face(pts)
      face.pushpull(h)

      # Optional Layer/Tag
      if body['layer']
        layer = model.layers[body['layer']] || model.layers.add(body['layer'])
        group.layer = layer
      end

      # Optional Material
      if body['material']
        mat = model.materials[body['material']] || model.materials.add(body['material'])
        group.material = mat
      end

      model.commit_operation

      {
        success: true,
        entity_id: group.entityID,
        name: group.name,
        bounds_mm: {
          width: group.bounds.width.to_mm.round(1),
          depth: group.bounds.depth.to_mm.round(1),
          height: group.bounds.height.to_mm.round(1)
        }
      }
    end

    def self.create_face(model, body)
      return { success: false, error: "No active model" } unless model

      pts_arr = body['points_mm'] || body['points'] || []
      return { success: false, error: "Requires at least 3 points in points_mm" } if pts_arr.length < 3

      push_h = (body['pushpull_mm'] || 0.0).to_f.mm

      model.start_operation("MCP: Tạo Face 3D", true)
      group = model.active_entities.add_group
      group.name = body['name'] || "Face_Polygonal"

      geom_pts = pts_arr.map do |p|
        Geom::Point3d.new((p[0] || 0.0).to_f.mm, (p[1] || 0.0).to_f.mm, (p[2] || 0.0).to_f.mm)
      end

      face = group.entities.add_face(geom_pts)
      if push_h != 0.0
        face.pushpull(push_h)
      end

      model.commit_operation

      {
        success: true,
        entity_id: group.entityID,
        name: group.name,
        area_m2: (face.area * 0.00064516).round(4)
      }
    end

    def self.capture_screenshot(model, body)
      return { success: false, error: "No active model" } unless model

      w = body['width'] || 1280
      h = body['height'] || 800

      temp_dir = ENV['TEMP'] || ENV['TMP'] || 'C:/Windows/Temp'
      filename = body['filename'] || "sketchup_mcp_snap_#{Time.now.to_i}.png"
      file_path = File.join(temp_dir, filename).gsub('\\', '/')

      view = model.active_view
      view.zoom_extents if body['zoom_extents'] == true

      keys = {
        :filename => file_path,
        :width => w,
        :height => h,
        :antialias => true,
        :compression => 0.9,
        :transparent => false
      }

      success = view.write_image(keys)
      if success && File.exist?(file_path)
        {
          success: true,
          file_path: file_path,
          width: w,
          height: h
        }
      else
        {
          success: false,
          error: "Failed to write image from active view"
        }
      end
    end

    def self.run_cutlist(model, body)
      if defined?(NoiThatPro::Cutlist::Extractor)
        only_selected = body['only_selected'] == true
        items = NoiThatPro::Cutlist::Extractor.extract_cutlist(model, only_selected)
        return {
          success: true,
          item_count: items.count,
          items: items
        }
      else
        # Try loading cutlist plugin
        loader = File.expand_path('../noithatpro_cutlist/main.rb', __FILE__)
        if File.exist?(loader)
          load loader
          if defined?(NoiThatPro::Cutlist::Extractor)
            items = NoiThatPro::Cutlist::Extractor.extract_cutlist(model, body['only_selected'] == true)
            return { success: true, item_count: items.count, items: items }
          end
        end
        { success: false, error: "NoiThatPro Cutlist plugin is not loaded in this SketchUp session" }
      end
    end

    def self.run_profile(model, body)
      if defined?(NoiThatPro::Profile::Sweeper)
        id = body['profile_id'] || 'PHAO_NOC_HIEN_DAI_40x40'
        just = body['justification'] || 'bottom_left'
        ox = (body['offset_x'] || 0.0).to_f
        oy = (body['offset_y'] || 0.0).to_f
        mat = body['material'] || 'Nhom_Anode_Bac'
        mx = body['mirror_x'] == true
        my = body['mirror_y'] == true
        rot = (body['rotation'] || 0).to_i

        res = NoiThatPro::Profile::Sweeper.sweep_active_profile(id, just, ox, oy, mat, mx, my, rot)
        return { success: true, result: res }
      else
        { success: false, error: "NoiThatPro Profile plugin is not loaded in this SketchUp session" }
      end
    end

    def self.open_dialog(body)
      type = (body['plugin'] || 'cutlist').downcase
      if type.include?('cutlist')
        if defined?(NoiThatPro::Cutlist) && NoiThatPro::Cutlist.respond_to?(:show_dialog)
          NoiThatPro::Cutlist.show_dialog
          return { success: true, message: "Opened NoiThatPro Cutlist dialog" }
        end
      elsif type.include?('profile')
        if defined?(NoiThatPro::Profile) && NoiThatPro::Profile.respond_to?(:show_dialog)
          NoiThatPro::Profile.show_dialog
          return { success: true, message: "Opened NoiThatPro Profile dialog" }
        end
      end
      { success: false, error: "Could not open dialog for #{type}" }
    end

  end # module MCPBridge
end # module NoiThatPro

# Auto-start on load
NoiThatPro::MCPBridge.start

# Menu Item in Extensions
unless file_loaded?(__FILE__)
  menu = UI.menu("Extensions").add_submenu("NoiThatPro MCP Bridge")
  menu.add_item("Khởi Động Lại Server (:9898)") {
    NoiThatPro::MCPBridge.stop
    NoiThatPro::MCPBridge.start
    UI.messagebox("NoiThatPro MCP Bridge đang chạy tại http://127.0.0.1:9898")
  }
  menu.add_item("Kiểm Tra Trạng Thái") {
    status = NoiThatPro::MCPBridge.running? ? "Đang chạy (:9898)" : "Đã dừng"
    UI.messagebox("Trạng thái MCP Bridge: #{status}")
  }
  file_loaded?(__FILE__)
end
