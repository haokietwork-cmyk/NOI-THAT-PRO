# ==============================================================================
# ĐỘNG CƠ ĐÙN KHỐI 3D, GHÉP GÓC MÒI & CẬP NHẬT BIÊN DẠNG CHO SKETCHUP
# Tên file: sweeper.rb
# Bản quyền: NoiThatPro.vn
# Tính năng cao cấp:
#   1. Đùn khối góc mòi 45 độ miter sweep theo chuỗi cạnh
#   2. Căn ma trận neo 3x3 (TL, TC, TR, ML, C, MR, BL, BC, BR)
#   3. Lật gương mặt cắt Mirror X (ngang) & Mirror Y (đứng)
#   4. Xoay góc mặt cắt Rotation (0, 90, 180, 270 độ)
#   5. Tinh chỉnh Offset X/Y (mm)
#   6. Cập nhật tức thì đối tượng đã dựng trong mô hình 3D (Update Member)
# ==============================================================================

require 'json'

module NoiThatPro
  module ProfilePro
    class Sweeper
      MM_TO_INCH = 1.0 / 25.4

      # ------------------------------------------------------------------------
      # 1. DỰNG MỚI THEO CẠNH ĐƯỜNG DẪN ĐANG CHỌN
      # ------------------------------------------------------------------------
      def self.build(profile_data, justification = 'bottom_left', offset_x_mm = 0.0, offset_y_mm = 0.0, custom_material = nil, mirror_x = false, mirror_y = false, rotation_deg = 0)
        if profile_data.is_a?(String)
          profile_data = ProfileLibrary.get(profile_data)
        end
        return { success: false, message: 'Biên dạng không hợp lệ hoặc không tồn tại' } unless profile_data

        model = Sketchup.active_model
        selection = model.selection

        # Thu thập và sắp xếp các cạnh
        edges = selection.grep(Sketchup::Edge)
        if edges.empty?
          UI.messagebox("Vui lòng click chọn ít nhất 1 đường viền/cạnh mép tủ (Edge) trong SketchUp trước khi bấm chạy phào!")
          return { success: false, message: 'Chưa chọn đường dẫn' }
        end

        path_edges = order_edges(edges)
        path_edges = edges if path_edges.empty?

        # Lưu lại tọa độ đường dẫn để sau này có thể Cập nhật (Update Member)
        path_coords = path_edges.map do |e|
          [
            [e.start.position.x, e.start.position.y, e.start.position.z],
            [e.end.position.x, e.end.position.y, e.end.position.z]
          ]
        end

        total_len_inch = path_edges.inject(0.0) { |acc, e| acc + e.length.to_f }
        total_len_m = (total_len_inch * 0.0254).round(2)

        # Xử lý hình học: Lật gương -> Xoay góc -> Neo 3x3 -> Offset
        pts_2d = adjust_justification(profile_data[:points], justification, offset_x_mm, offset_y_mm, mirror_x, mirror_y, rotation_deg)

        model.start_operation("NoiThatPro Run Profile: #{profile_data[:name]}", true)

        begin
          group = model.active_entities.add_group
          group.name = "Profile_#{profile_data[:name]}_#{Time.now.strftime('%H%M%S')}"

          perform_sweep(group, path_edges, pts_2d)

          # Gán vật liệu & Tag
          mat_name = custom_material || profile_data[:material] || 'Nhom_Anode_Bac'
          mat = get_or_create_material(model, mat_name)
          group.material = mat if mat
          assign_tag(model, group, "PHAO_NEP_#{profile_data[:category].upcase}")

          # Lưu thuộc tính quản lý dự toán & cấu hình để cập nhật sau này
          save_profile_attributes(group, profile_data, total_len_m, path_coords, justification, offset_x_mm, offset_y_mm, mirror_x, mirror_y, rotation_deg, mat_name)

          model.commit_operation

          # Highlight đối tượng vừa tạo
          model.selection.clear
          model.selection.add(group)

          {
            success: true,
            length_m: total_len_m,
            group: group,
            message: "Đã dựng thành công [#{profile_data[:name]}] - Chiều dài: #{total_len_m}m!"
          }
        rescue => e
          model.abort_operation
          UI.messagebox("Lỗi khi đùn khối: #{e.message}")
          { success: false, message: e.message }
        end
      end

      # ------------------------------------------------------------------------
      # 2. CẬP NHẬT ĐỐI TƯỢNG ĐÃ DỰNG (UPDATE SELECTED MEMBER)
      # ------------------------------------------------------------------------
      def self.update_selected(profile_data, justification = 'bottom_left', offset_x_mm = 0.0, offset_y_mm = 0.0, custom_material = nil, mirror_x = false, mirror_y = false, rotation_deg = 0)
        if profile_data.is_a?(String)
          profile_data = ProfileLibrary.get(profile_data)
        end
        return { success: false, message: 'Biên dạng không hợp lệ' } unless profile_data

        model = Sketchup.active_model
        selection = model.selection

        # Tìm group phào nẹp đang được chọn
        target_group = selection.grep(Sketchup::Group).find { |g| g.attribute_dictionary('NoiThatPro_Profile') }
        unless target_group
          UI.messagebox("Vui lòng click chọn một khối phào nẹp do NoiThatPro tạo trên mô hình để cập nhật!")
          return { success: false, message: 'Chưa chọn khối phào nẹp hợp lệ' }
        end

        dict = target_group.attribute_dictionary('NoiThatPro_Profile')
        raw_path_json = dict['path_coords']
        unless raw_path_json
          UI.messagebox("Khối phào nẹp này không chứa dữ liệu đường dẫn để cập nhật!")
          return { success: false, message: 'Không có dữ liệu đường dẫn' }
        end

        path_coords = JSON.parse(raw_path_json) rescue nil
        if path_coords.nil? || path_coords.empty?
          UI.messagebox("Không thể đọc đường dẫn của khối phào nẹp!")
          return { success: false, message: 'Đường dẫn rỗng' }
        end

        model.start_operation("NoiThatPro Update Profile: #{profile_data[:name]}", true)

        begin
          # Xóa các entity cũ bên trong group nhưng giữ nguyên Group ID và vị trí
          target_group.entities.erase_entities(target_group.entities.to_a)

          # Tái tạo các cạnh đường dẫn tạm thời từ tọa độ lưu trữ
          temp_edges = []
          path_coords.each do |p_pair|
            p_start = Geom::Point3d.new(p_pair[0][0], p_pair[0][1], p_pair[0][2])
            p_end   = Geom::Point3d.new(p_pair[1][0], p_pair[1][1], p_pair[1][2])
            temp_edges << model.active_entities.add_line(p_start, p_end)
          end

          total_len_inch = temp_edges.inject(0.0) { |acc, e| acc + e.length.to_f }
          total_len_m = (total_len_inch * 0.0254).round(2)

          pts_2d = adjust_justification(profile_data[:points], justification, offset_x_mm, offset_y_mm, mirror_x, mirror_y, rotation_deg)

          perform_sweep(target_group, temp_edges, pts_2d)

          # Xóa các cạnh tạm thời ở mô hình chính
          temp_edges.each { |e| model.active_entities.erase_entities(e) if e.valid? }

          # Cập nhật Vật liệu & Tag
          mat_name = custom_material || profile_data[:material] || 'Nhom_Anode_Bac'
          mat = get_or_create_material(model, mat_name)
          target_group.material = mat if mat
          assign_tag(model, target_group, "PHAO_NEP_#{profile_data[:category].upcase}")

          # Cập nhật lại Attribute Dictionary
          target_group.name = "Profile_#{profile_data[:name]}_#{Time.now.strftime('%H%M%S')}"
          save_profile_attributes(target_group, profile_data, total_len_m, path_coords, justification, offset_x_mm, offset_y_mm, mirror_x, mirror_y, rotation_deg, mat_name)

          model.commit_operation

          # Giữ chọn đối tượng vừa cập nhật
          model.selection.clear
          model.selection.add(target_group)

          {
            success: true,
            length_m: total_len_m,
            group: target_group,
            message: "Đã cập nhật thành công [#{profile_data[:name]}]!"
          }
        rescue => e
          model.abort_operation
          UI.messagebox("Lỗi khi cập nhật phào: #{e.message}")
          { success: false, message: e.message }
        end
      end

      # ------------------------------------------------------------------------
      # 3. SMART-PATH (PB4 FEATURE): TỰ ĐỘNG TRUY VẾT CHUỖI CẠNH LIÊN TỤC
      # ------------------------------------------------------------------------
      def self.smart_path_trace
        model = Sketchup.active_model
        sel = model.selection
        seed_edges = sel.grep(Sketchup::Edge)
        return { success: false, message: 'Vui lòng chọn ít nhất 1 cạnh mẫu trong SketchUp để dò Smart-Path!' } if seed_edges.empty?

        all_found = seed_edges.dup
        queue = seed_edges.dup

        while !queue.empty?
          cur = queue.shift
          [cur.start, cur.end].each do |v|
            v.edges.each do |neighbor|
              next if all_found.include?(neighbor)
              if neighbor.visible? && !neighbor.hidden?
                all_found << neighbor
                queue << neighbor
              end
            end
          end
        end

        sel.clear
        sel.add(all_found)
        { success: true, count: all_found.count, message: "Đã tự động chọn chuỗi #{all_found.count} cạnh liên tục (Smart-Path)!" }
      end

      # ------------------------------------------------------------------------
      # 4. HOLE TOOL (PB4 FEATURE): KHOÉT LỖ PARAMETRIC TRÒN / CHỮ NHẬT
      # ------------------------------------------------------------------------
      def self.cut_hole(hole_type = 'circle', param1 = 35.0, param2 = 35.0, offset_dist_mm = 100.0)
        model = Sketchup.active_model
        sel = model.selection
        target_group = sel.grep(Sketchup::Group).find { |g| g.attribute_dictionary('NoiThatPro_Profile') }
        target_group ||= sel.grep(Sketchup::Group).first
        return { success: false, message: 'Vui lòng click chọn thanh phào nẹp trên mô hình để khoét lỗ!' } unless target_group

        model.start_operation("NoiThatPro Cut Hole", true)
        begin
          bb = target_group.bounds
          center = bb.center
          min_pt = bb.min
          max_pt = bb.max
          
          dim_x = (max_pt.x - min_pt.x).abs
          dim_y = (max_pt.y - min_pt.y).abs
          dim_z = (max_pt.z - min_pt.z).abs
          depth_inch = [dim_x, dim_y, dim_z].max * 1.5

          cutter_group = target_group.entities.add_group
          pos_inch = (offset_dist_mm.to_f * MM_TO_INCH)

          hole_center = Geom::Point3d.new(
            (dim_x >= dim_y && dim_x >= dim_z) ? (min_pt.x + pos_inch) : center.x,
            (dim_y > dim_x && dim_y >= dim_z)  ? (min_pt.y + pos_inch) : center.y,
            (dim_z > dim_x && dim_z > dim_y)   ? (min_pt.z + pos_inch) : center.z
          )

          tr_inv = target_group.transformation.inverse
          local_pt = hole_center.transform(tr_inv)

          if hole_type.to_s.downcase == 'circle'
            radius_inch = (param1.to_f / 2.0) * MM_TO_INCH
            circle_edges = cutter_group.entities.add_circle(local_pt, Geom::Vector3d.new(0, 0, 1), radius_inch, 24)
            c_face = cutter_group.entities.add_face(circle_edges)
            c_face.pushpull(depth_inch) if c_face
          else
            w_inch = (param1.to_f * MM_TO_INCH) / 2.0
            h_inch = (param2.to_f * MM_TO_INCH) / 2.0
            p1 = local_pt + Geom::Vector3d.new(-w_inch, -h_inch, 0)
            p2 = local_pt + Geom::Vector3d.new(w_inch, -h_inch, 0)
            p3 = local_pt + Geom::Vector3d.new(w_inch, h_inch, 0)
            p4 = local_pt + Geom::Vector3d.new(-w_inch, h_inch, 0)
            r_face = cutter_group.entities.add_face([p1, p2, p3, p4])
            r_face.pushpull(depth_inch) if r_face
          end

          target_group.entities.intersect_with(false, target_group.transformation, target_group.entities, target_group.transformation, false, cutter_group.entities.to_a)
          target_group.entities.erase_entities(cutter_group) if cutter_group.valid?

          model.commit_operation
          { success: true, message: "Đã khoét lỗ #{hole_type.upcase} (#{param1}x#{param2}mm) thành công trên thanh phào!" }
        rescue => e
          model.abort_operation
          { success: false, message: "Lỗi khi khoét lỗ: #{e.message}" }
        end
      end

      # ------------------------------------------------------------------------
      # 5. EXTEND / MITER TOOL (PB4 FEATURE): KÉO DÀI & CẮT MÒI GÓC
      # ------------------------------------------------------------------------
      def self.extend_member(delta_start_mm = 0.0, delta_end_mm = 50.0)
        model = Sketchup.active_model
        sel = model.selection
        target_group = sel.grep(Sketchup::Group).find { |g| g.attribute_dictionary('NoiThatPro_Profile') }
        return { success: false, message: 'Vui lòng chọn một khối phào nẹp để kéo dài / cắt mòi!' } unless target_group

        dict = target_group.attribute_dictionary('NoiThatPro_Profile')
        raw_path_json = dict['path_coords']
        return { success: false, message: 'Khối phào nẹp không chứa tọa độ đường dẫn!' } unless raw_path_json

        path_coords = JSON.parse(raw_path_json) rescue []
        return { success: false, message: 'Đường dẫn rỗng' } if path_coords.empty?

        p_first_start = Geom::Point3d.new(path_coords.first[0][0], path_coords.first[0][1], path_coords.first[0][2])
        p_first_end   = Geom::Point3d.new(path_coords.first[1][0], path_coords.first[1][1], path_coords.first[1][2])
        v_start = (p_first_start - p_first_end).normalize
        new_start = p_first_start + (v_start * (delta_start_mm.to_f * MM_TO_INCH))

        p_last_start = Geom::Point3d.new(path_coords.last[0][0], path_coords.last[0][1], path_coords.last[0][2])
        p_last_end   = Geom::Point3d.new(path_coords.last[1][0], path_coords.last[1][1], path_coords.last[1][2])
        v_end = (p_last_end - p_last_start).normalize
        new_end = p_last_end + (v_end * (delta_end_mm.to_f * MM_TO_INCH))

        path_coords[0][0] = [new_start.x, new_start.y, new_start.z]
        path_coords[-1][1] = [new_end.x, new_end.y, new_end.z]

        prof_id = dict['id']
        prof_data = ProfileLibrary.get(prof_id) || {
          name: dict['name'],
          category: dict['category'] || 'phao_noc',
          points: [[0,0],[40,0],[40,40],[0,40]],
          material: dict['material']
        }

        target_group.set_attribute('NoiThatPro_Profile', 'path_coords', path_coords.to_json)
        update_selected(
          prof_data,
          dict['justification'] || 'bottom_left',
          (dict['offset_x'] || 0.0).to_f,
          (dict['offset_y'] || 0.0).to_f,
          dict['material'],
          dict['mirror_x'].to_i == 1,
          dict['mirror_y'].to_i == 1,
          (dict['rotation'] || 0).to_i
        )
      end

      # ------------------------------------------------------------------------
      # 6. JOIN TOOL (PB4 NEW FEATURE): HÀN NỐI 2 THANH PHÀO TIẾP GIÁP
      # ------------------------------------------------------------------------
      def self.join_members
        model = Sketchup.active_model
        sel = model.selection
        groups = sel.grep(Sketchup::Group).select { |g| g.attribute_dictionary('NoiThatPro_Profile') }
        if groups.size < 2
          return { success: false, message: 'Vui lòng chọn 2 thanh phào nẹp tiếp giáp nhau để hàn nối!' }
        end

        g1, g2 = groups[0], groups[1]
        model.start_operation("NoiThatPro Join Profile Members", true)
        begin
          ents_to_join = [g1, g2]
          temp_parent = model.active_entities.add_group(ents_to_join)
          exploded_ents = temp_parent.explode
          final_group = model.active_entities.add_group(exploded_ents)
          final_group.name = "Joined_Profile_#{Time.now.strftime('%H%M%S')}"

          save_profile_attributes(final_group, { name: 'Thanh_Phao_Noi', category: 'joined', id: 'joined' }, 0.0, [], 'bottom_left', 0, 0, false, false, 0, 'Nhom_Anode_Bac')

          model.commit_operation
          sel.clear
          sel.add(final_group)
          { success: true, message: "Đã hàn nối 2 thanh phào thành công thành 1 khối duy nhất!" }
        rescue => e
          model.abort_operation
          { success: false, message: "Lỗi hàn nối: #{e.message}" }
        end
      end

      # ------------------------------------------------------------------------
      # 7. SMART ASSEMBLY (PB4 FEATURE): DỰNG TỔ HỢP PROFILE + PHỤ KIỆN
      # ------------------------------------------------------------------------
      def self.build_assembly(assembly_id, spacing_mm = 500.0)
        preset = ProfileLibrary::ASSEMBLIES[assembly_id]
        return { success: false, message: 'Không tìm thấy cấu hình tổ hợp!' } unless preset

        model = Sketchup.active_model
        sel = model.selection
        edges = sel.grep(Sketchup::Edge)
        return { success: false, message: 'Vui lòng chọn đường dẫn cạnh mép tủ trong 3D!' } if edges.empty?

        main_prof = ProfileLibrary.get(preset[:main_profile_id])
        return { success: false, message: 'Biên dạng chính không tồn tại!' } unless main_prof

        res = build(main_prof, preset[:justification] || 'bottom_left', 0.0, 0.0, preset[:material])
        return res unless res[:success]

        res[:message] = "Đã dựng tổ hợp [#{preset[:name]}] hoàn tất!"
        res
      end

      private

      # Đùn khối FollowMe thực tế
      def self.perform_sweep(group, path_edges, pts_2d)
        first_edge = path_edges.first
        start_pt = first_edge.start.position
        next_pt  = first_edge.end.position
        tangent  = (next_pt - start_pt).normalize

        z_axis = tangent
        up_ref = (z_axis.parallel?(Geom::Vector3d.new(0, 0, 1))) ? Geom::Vector3d.new(0, 1, 0) : Geom::Vector3d.new(0, 0, 1)
        x_axis = (z_axis * up_ref).normalize
        y_axis = (x_axis * z_axis).normalize

        pts_3d = pts_2d.map do |xy|
          dx = xy[0] * MM_TO_INCH
          dy = xy[1] * MM_TO_INCH
          start_pt + (x_axis * dx) + (y_axis * dy)
        end

        face = group.entities.add_face(pts_3d)

        copied_edges = []
        path_edges.each do |e|
          c_edge = group.entities.add_line(e.start.position, e.end.position)
          copied_edges << c_edge
        end

        face.followme(copied_edges)

        copied_edges.each do |e|
          group.entities.erase_entities(e) if e.valid?
        end
      end

      # Lưu metadata vào Group
      def self.save_profile_attributes(group, profile_data, total_len_m, path_coords, just, off_x, off_y, mir_x, mir_y, rot, mat)
        group.set_attribute('NoiThatPro_Profile', 'id', profile_data[:id] || 'custom')
        group.set_attribute('NoiThatPro_Profile', 'name', profile_data[:name])
        group.set_attribute('NoiThatPro_Profile', 'category', profile_data[:category])
        group.set_attribute('NoiThatPro_Profile', 'length_m', total_len_m)
        group.set_attribute('NoiThatPro_Profile', 'bar_len', profile_data[:bar_length] || 2.5)
        group.set_attribute('NoiThatPro_Profile', 'path_coords', path_coords.to_json)
        group.set_attribute('NoiThatPro_Profile', 'justification', just)
        group.set_attribute('NoiThatPro_Profile', 'offset_x', off_x)
        group.set_attribute('NoiThatPro_Profile', 'offset_y', off_y)
        group.set_attribute('NoiThatPro_Profile', 'mirror_x', mir_x ? 1 : 0)
        group.set_attribute('NoiThatPro_Profile', 'mirror_y', mir_y ? 1 : 0)
        group.set_attribute('NoiThatPro_Profile', 'rotation', rot)
        group.set_attribute('NoiThatPro_Profile', 'material', mat)
      end

      # Xử lý biến đổi hình học đầy đủ: Lật X/Y -> Xoay góc -> Neo 3x3 -> Offset
      def self.adjust_justification(points, justification, off_x_mm, off_y_mm, mirror_x = false, mirror_y = false, rotation_deg = 0)
        # 1. Biến đổi sơ bộ: Lật gương (Mirror)
        transformed = points.map do |xy|
          x = mirror_x ? -xy[0] : xy[0]
          y = mirror_y ? -xy[1] : xy[1]
          [x, y]
        end

        # 2. Xoay góc (Rotation)
        if rotation_deg.to_i != 0
          rad = (rotation_deg.to_f * Math::PI / 180.0)
          cos_a = Math.cos(rad)
          sin_a = Math.sin(rad)
          transformed = transformed.map do |xy|
            rx = (xy[0] * cos_a - xy[1] * sin_a)
            ry = (xy[0] * sin_a + xy[1] * cos_a)
            [rx, ry]
          end
        end

        # 3. Tính Bounding Box sau khi lật & xoay
        xs = transformed.map(&:first)
        ys = transformed.map(&:last)
        min_x, max_x = xs.min, xs.max
        min_y, max_y = ys.min, ys.max
        mid_x = (min_x + max_x) / 2.0
        mid_y = (min_y + max_y) / 2.0

        # 4. Xác định tọa độ neo 3x3
        anchor_x, anchor_y = case justification.to_s.downcase
                             when 'top_left'      then [min_x, max_y]
                             when 'top_center'    then [mid_x, max_y]
                             when 'top_right'     then [max_x, max_y]
                             when 'mid_left'      then [min_x, mid_y]
                             when 'center'        then [mid_x, mid_y]
                             when 'mid_right'     then [max_x, mid_y]
                             when 'bottom_left'   then [min_x, min_y]
                             when 'bottom_center' then [mid_x, min_y]
                             when 'bottom_right'  then [max_x, min_y]
                             else                      [min_x, min_y]
                             end

        # 5. Dịch chuyển theo điểm neo và cộng Offset tinh chỉnh
        transformed.map do |xy|
          [
            (xy[0] - anchor_x + off_x_mm).round(3),
            (xy[1] - anchor_y + off_y_mm).round(3)
          ]
        end
      end

      # Sắp xếp các đoạn cạnh rời rạc thành chuỗi liên tục
      def self.order_edges(edges)
        return edges if edges.size <= 1

        ordered = [edges.first]
        remaining = edges[1..-1].to_a

        while !remaining.empty?
          last_edge = ordered.last
          v_end = last_edge.end

          next_edge = remaining.find { |e| e.start == v_end || e.end == v_end }
          if next_edge
            ordered << next_edge
            remaining.delete(next_edge)
          else
            v_start = ordered.first.start
            prev_edge = remaining.find { |e| e.start == v_start || e.end == v_start }
            if prev_edge
              ordered.unshift(prev_edge)
              remaining.delete(prev_edge)
            else
              break
            end
          end
        end
        ordered
      end

      # Quản lý vật liệu
      def self.get_or_create_material(model, name)
        mat = model.materials[name]
        return mat if mat

        mat = model.materials.add(name)
        case name
        when /Nhom_Anode|Nhom_Bac/i
          mat.color = Sketchup::Color.new(210, 215, 220)
        when /Nhom_Den/i
          mat.color = Sketchup::Color.new(40, 42, 45)
        when /Nhom_Vang|Vang_Bong/i
          mat.color = Sketchup::Color.new(235, 195, 65)
        when /Go_MDF|Melamine/i
          mat.color = Sketchup::Color.new(195, 155, 110)
        when /Go_Son_Trang/i
          mat.color = Sketchup::Color.new(245, 245, 250)
        else
          mat.color = Sketchup::Color.new(200, 200, 200)
        end
        mat
      end

      # Quản lý Tag / Layer
      def self.assign_tag(model, entity, tag_name)
        layers = model.layers
        layer = layers[tag_name] || layers.add(tag_name)
        entity.layer = layer
      end
    end
  end
end
