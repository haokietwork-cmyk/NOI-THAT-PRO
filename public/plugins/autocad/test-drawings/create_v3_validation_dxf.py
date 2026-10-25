"""
Tạo file DXF chuẩn kiểm thử 7 tính năng nâng cấp V3.0 của AutoCutlist Pro
"""
import math

def create_v3_dxf(filename):
    lines = []
    
    # Header
    lines.extend([
        "0", "SECTION",
        "2", "HEADER",
        "9", "$INSUNITS", "70", "4", # mm
        "0", "ENDSEC",
        "0", "SECTION",
        "2", "TABLES",
        "0", "TABLE",
        "2", "LAYER",
        "70", "7",
    ])
    
    layers = [
        "HOI_TU", "DOT_TU", "CANH_TU", "NGAN_KEO", 
        "VAN_HAU_6", "MAT_BAN_CONG", "VAN_17_DAN2D1R"
    ]
    for lay in layers:
        lines.extend([
            "0", "LAYER",
            "2", lay,
            "70", "0",
            "62", "7",
            "6", "CONTINUOUS"
        ])
    lines.extend([
        "0", "ENDTAB",
        "0", "ENDSEC",
        "0", "SECTION",
        "2", "ENTITIES"
    ])
    
    # 1. Hồi tủ chuẩn 600x2400 (LWPOLYLINE)
    # Layer: HOI_TU
    lines.extend([
        "0", "LWPOLYLINE",
        "8", "HOI_TU",
        "90", "4",
        "70", "1", # Closed
        "10", "0.0", "20", "0.0",
        "10", "600.0", "20", "0.0",
        "10", "600.0", "20", "2400.0",
        "10", "0.0", "20", "2400.0"
    ])
    
    # 2. Hồi tủ vẽ đè (Duplicate) y hệt tại (0,0) -> Để test lọc trùng OVERKILL
    lines.extend([
        "0", "LWPOLYLINE",
        "8", "HOI_TU",
        "90", "4",
        "70", "1",
        "10", "0.0", "20", "0.0",
        "10", "600.0", "20", "0.0",
        "10", "600.0", "20", "2400.0",
        "10", "0.0", "20", "2400.0"
    ])
    
    # 3. Đợt tủ vẽ bằng 4 đoạn LINE rời rạc (566x500) -> Test Auto-Chain
    # Layer: DOT_TU
    lines.extend([
        "0", "LINE", "8", "DOT_TU", "10", "700.0", "20", "0.0", "11", "1266.0", "21", "0.0",
        "0", "LINE", "8", "DOT_TU", "10", "1266.0", "20", "0.0", "11", "1266.0", "21", "500.0",
        "0", "LINE", "8", "DOT_TU", "10", "1266.0", "20", "500.0", "11", "700.0", "21", "500.0",
        "0", "LINE", "8", "DOT_TU", "10", "700.0", "20", "500.0", "11", "700.0", "21", "0.0"
    ])
    
    # 4. Cánh tủ vân dọc (800 ngang x 500 cao) -> Test Grain Direction: Dai=500, Rong=800
    # Layer: CANH_TU
    lines.extend([
        "0", "LWPOLYLINE",
        "8", "CANH_TU",
        "90", "4",
        "70", "1",
        "10", "1400.0", "20", "0.0",
        "10", "2200.0", "20", "0.0",
        "10", "2200.0", "20", "500.0",
        "10", "1400.0", "20", "500.0"
    ])
    
    # 5. Mặt ngăn kéo vân ngang (800 ngang x 200 cao) -> Dai=800, Rong=200
    # Layer: NGAN_KEO
    lines.extend([
        "0", "LWPOLYLINE",
        "8", "NGAN_KEO",
        "90", "4",
        "70", "1",
        "10", "1400.0", "20", "600.0",
        "10", "2200.0", "20", "600.0",
        "10", "2200.0", "20", "800.0",
        "10", "1400.0", "20", "800.0"
    ])
    
    # 6. Tấm hậu 6mm (1200x2400) -> Test Smart Edge Banding: KHONG_DAN & day=6
    # Layer: VAN_HAU_6
    lines.extend([
        "0", "LWPOLYLINE",
        "8", "VAN_HAU_6",
        "90", "4",
        "70", "1",
        "10", "2300.0", "20", "0.0",
        "10", "3500.0", "20", "0.0",
        "10", "3500.0", "20", "2400.0",
        "10", "2300.0", "20", "2400.0"
    ])
    
    # 7. Mặt bàn bo góc cong (1200x800 có góc bo R=200, bulge = tan(90/4) = tan(22.5) = 0.41421356)
    # Đỉnh 1: (3600, 0), Đỉnh 2: (4800, 0), Đỉnh 3: (4800, 600) có bulge=0.41421356 nối tới (4600, 800), Đỉnh 4: (3600, 800)
    # Layer: MAT_BAN_CONG
    lines.extend([
        "0", "LWPOLYLINE",
        "8", "MAT_BAN_CONG",
        "90", "4",
        "70", "1",
        "10", "3600.0", "20", "0.0", "42", "0.0",
        "10", "4800.0", "20", "0.0", "42", "0.0",
        "10", "4800.0", "20", "600.0", "42", "0.41421356",
        "10", "4600.0", "20", "800.0", "42", "0.0",
        "10", "3600.0", "20", "800.0", "42", "0.0"
    ])
    
    # 8. Tấm chỉ định dán cạnh trực tiếp qua tag Layer: VAN_17_DAN2D1R (566x500)
    lines.extend([
        "0", "LWPOLYLINE",
        "8", "VAN_17_DAN2D1R",
        "90", "4",
        "70", "1",
        "10", "700.0", "20", "600.0",
        "10", "1266.0", "20", "600.0",
        "10", "1266.0", "20", "1100.0",
        "10", "700.0", "20", "1100.0"
    ])
    
    # End of DXF
    lines.extend([
        "0", "ENDSEC",
        "0", "EOF"
    ])
    
    with open(filename, "w", encoding="ascii") as f:
        f.write("\n".join(lines) + "\n")
    print(f"Created {filename} successfully!")

if __name__ == "__main__":
    create_v3_dxf("public/plugins/autocad/test-drawings/v3_comprehensive_suite.dxf")
