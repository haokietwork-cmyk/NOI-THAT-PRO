import { NextResponse } from "next/server";

/**
 * Endpoint kiểm tra phiên bản mới ngầm cho AutoPlot Flexible (.NET AutoCAD Plugin)
 * Khớp hoàn toàn với UpdateChecker.cs trong mã nguồn AutoCAD
 * GET /api/flexible-tool/version.json
 */
export async function GET() {
  const versionInfo = {
    latest_version: "2.3.0",
    release_date: "2026-11-02",
    download_url: "/downloads/AutoPlot_Flexible_v2.3_Setup.zip",
    web_store_url: "/cad-store",
    changelog: "Phát hành bản v2.3.0: Tương thích toàn diện AutoCAD 2014-2027 (Universal Build). Tích hợp động cơ Native Canvas Render Engine xem trước bản vẽ nội bộ siêu nét, loại bỏ 100% lỗi popup 'File Download' và lỗi mở trình duyệt Cốc Cốc, bổ sung nút hủy tiến trình in tức thời.",
    critical: false,
    available_modules: [
      { id: "AUTOPLOT", name: "AutoPlot Flexible", desc: "In gộp PDF hàng loạt chuẩn xưởng (Universal 2014-2026+)" },
      { id: "AUTOVIEWBASE", name: "AutoViewBase Flexible", desc: "Trích xuất hình chiếu 2D tự động từ 3D Solid" },
      { id: "AUTODIM", name: "AutoDim Flexible", desc: "Ghi kích thước thông minh" }
    ]
  };

  return NextResponse.json(versionInfo, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
