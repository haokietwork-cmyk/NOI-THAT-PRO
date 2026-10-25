const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\KIET_PC\\.gemini\\antigravity\\mcp\\sketchup';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const tools = [
  {
    name: 'status',
    description: 'Kiểm tra trạng thái kết nối SketchUp và thông tin mô hình 3D (Tên file, kích thước tổng thể bounds mm, số lượng entities, materials, layers).',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'eval',
    description: 'Thực thi mã lệnh Ruby trực tiếp trong phiên SketchUp đang chạy và trả về kết quả (Full Ruby API access: Sketchup.active_model...).',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Đoạn mã Ruby cần thực thi trong SketchUp'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'get_selection',
    description: 'Lấy thông tin chi tiết các đối tượng 3D đang được quét chọn trong SketchUp (ComponentInstance, Group, Face, Edge, Bounding box mm, Layer...).',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'set_selection',
    description: 'Chọn đối tượng 3D theo Entity ID hoặc xóa vùng chọn hiện tại trong SketchUp.',
    parameters: {
      type: 'object',
      properties: {
        entity_ids: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Mảng chứa entityID của các đối tượng cần chọn'
        },
        clear: {
          type: 'boolean',
          description: 'Nếu true sẽ xóa toàn bộ vùng chọn (deselect all)'
        }
      }
    }
  },
  {
    name: 'create_box',
    description: 'Tạo một khối hộp chữ nhật hoặc tấm ván 3D chính xác kích thước mm trong SketchUp.',
    parameters: {
      type: 'object',
      properties: {
        width_mm: { type: 'number', description: 'Chiều rộng phôi (X) tính bằng mm (VD: 600)' },
        length_mm: { type: 'number', description: 'Chiều dài phôi (Y) tính bằng mm (VD: 800)' },
        height_mm: { type: 'number', description: 'Chiều cao / độ dày ván (Z) tính bằng mm (VD: 17)' },
        x_mm: { type: 'number', description: 'Tọa độ X điểm gốc (mặc định 0)' },
        y_mm: { type: 'number', description: 'Tọa độ Y điểm gốc (mặc định 0)' },
        z_mm: { type: 'number', description: 'Tọa độ Z điểm gốc (mặc định 0)' },
        name: { type: 'string', description: 'Tên định danh cho đối tượng (VD: Tu_Ao_Hoi_Trai)' },
        layer: { type: 'string', description: 'Tên Layer / Tag phân loại (VD: Van_MDF_17mm)' },
        material: { type: 'string', description: 'Tên vật liệu bề mặt (VD: Go_MDF_Phu_Melamine)' }
      },
      required: ['width_mm', 'length_mm', 'height_mm']
    }
  },
  {
    name: 'create_face',
    description: 'Tạo một mặt phẳng 2D từ danh sách các điểm 3D [X, Y, Z] (mm) và tùy chọn đùn khối 3D (pushpull).',
    parameters: {
      type: 'object',
      properties: {
        points_mm: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' }
          },
          description: 'Danh sách ít nhất 3 điểm [X, Y, Z] mm tạo thành mặt kín (VD: [[0,0,0], [500,0,0], [500,300,0], [0,300,0]])'
        },
        pushpull_mm: {
          type: 'number',
          description: 'Chiều cao đùn khối thành 3D tính bằng mm (VD: 17.0)'
        },
        name: { type: 'string', description: 'Tên nhóm đối tượng' }
      },
      required: ['points_mm']
    }
  },
  {
    name: 'screenshot',
    description: 'Chụp ảnh màn hình Viewport 3D đang hiển thị trong SketchUp và lưu ra file PNG độ nét cao.',
    parameters: {
      type: 'object',
      properties: {
        width: { type: 'integer', description: 'Chiều rộng ảnh pixel (mặc định 1280)' },
        height: { type: 'integer', description: 'Chiều cao ảnh pixel (mặc định 800)' },
        zoom_extents: { type: 'boolean', description: 'Tự động zoom bao quát toàn bộ mô hình trước khi chụp' }
      }
    }
  },
  {
    name: 'run_cutlist',
    description: 'Kích hoạt bộ máy bóc tách Cutlist & Xếp ván 2D Nesting trực tiếp trên mô hình 3D đang mở trong SketchUp.',
    parameters: {
      type: 'object',
      properties: {
        only_selected: {
          type: 'boolean',
          description: 'Nếu true chỉ bóc tách các cụm chi tiết đang được chọn; false sẽ bóc tách toàn bộ mô hình.'
        }
      }
    }
  },
  {
    name: 'run_profile',
    description: 'Đùn biên dạng phào nẹp (trong kho 28 mẫu chuẩn Việt Nam) chạy dọc theo các cạnh đường dẫn 3D đang chọn.',
    parameters: {
      type: 'object',
      properties: {
        profile_id: { type: 'string', description: 'Mã biên dạng (VD: PHAO_NOC_HIEN_DAI_40x40, MANG_LED_NHOM_AM_17, NHOM_GOLA_CHU_C)' },
        justification: { type: 'string', description: 'Điểm neo 3x3 (top_left, top_center, top_right, mid_left, center, mid_right, bottom_left, bottom_center, bottom_right)' },
        offset_x: { type: 'number', description: 'Độ lệch ngang mm' },
        offset_y: { type: 'number', description: 'Độ lệch đứng mm' },
        material: { type: 'string', description: 'Vật liệu hoàn thiện' },
        mirror_x: { type: 'boolean', description: 'Lật ngang X' },
        mirror_y: { type: 'boolean', description: 'Lật đứng Y' },
        rotation: { type: 'integer', description: 'Góc xoay độ (0, 90, 180, 270)' }
      },
      required: ['profile_id']
    }
  },
  {
    name: 'open_dialog',
    description: 'Mở trực tiếp cửa sổ giao diện Cutlist Pro hoặc Profile Pro bên trong SketchUp trên màn hình máy tính.',
    parameters: {
      type: 'object',
      properties: {
        plugin: {
          type: 'string',
          enum: ['cutlist', 'profile'],
          description: 'Chọn plugin cần mở (cutlist hoặc profile)'
        }
      },
      required: ['plugin']
    }
  }
];

tools.forEach(t => {
  const filePath = path.join(dir, t.name + '.json');
  fs.writeFileSync(filePath, JSON.stringify(t, null, 2), 'utf8');
  console.log('Created tool schema:', t.name + '.json');
});

const instructions = `# SketchUp MCP Server Instructions

## Overview
Connects Antigravity AI assistant with live running instances of Trimble SketchUp (2024 / 2025 / 2026) on the user's local machine via port 9898.

## Available Tools
- \`status\`: Inspect active SketchUp model, version, bounds, and entity statistics.
- \`eval\`: Run arbitrary Ruby code in SketchUp's live session.
- \`get_selection\`: Inspect selected components/faces in 3D.
- \`set_selection\`: Programmatically select or clear selection.
- \`create_box\`: Generate precise 3D panels/boxes (mm).
- \`create_face\`: Generate 2D polygonal faces and extrude them.
- \`screenshot\`: Capture high-res viewport screenshot as PNG.
- \`run_cutlist\`: Execute Cutlist & 2D Nesting analysis live.
- \`run_profile\`: Extrude phào nẹp/moulding along 3D edges.
- \`open_dialog\`: Launch Cutlist Pro or Profile Pro HTML dialogs.
`;

fs.writeFileSync(path.join(dir, 'instructions.md'), instructions, 'utf8');
console.log('Created instructions.md successfully');
