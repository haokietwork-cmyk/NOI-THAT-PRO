import { NextResponse } from "next/server";

/**
 * Endpoint kiểm tra phiên bản mới ngầm cho AutoPlot Flexible (.NET AutoCAD Plugin)
 * Khớp hoàn toàn với UpdateChecker.cs trong mã nguồn AutoCAD
 * GET /api/flexible-tool/version.json
 */
export async function GET() {
  const versionInfo = {
    latest_version: "2.2.0",
    release_date: "2026-11-02",
    download_url: "/downloads/AutoPlot_Flexible_v2.2_Setup.zip",
    web_store_url: "/cad-store",
    changelog: "Phát hành bản v2.2.0: Tương thích toàn diện AutoCAD 2014-2026+ (Universal Build), chuẩn hóa tỉ lệ phóng to X:1 theo quy chuẩn kỹ thuật (11:1, 8:1, 6:1...), tự động trích xuất tên và số hiệu bản vẽ từ khung tên CAD, tối ưu động cơ gộp PDF và hỗ trợ bộ nạp AutoPlot.lsp đa năng.",
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
