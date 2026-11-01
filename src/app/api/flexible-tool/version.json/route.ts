import { NextResponse } from "next/server";

/**
 * Endpoint kiểm tra phiên bản mới ngầm cho AutoPlot Flexible (.NET AutoCAD Plugin)
 * Khớp hoàn toàn với UpdateChecker.cs trong mã nguồn AutoCAD
 * GET /api/flexible-tool/version.json
 */
export async function GET() {
  const versionInfo = {
    latest_version: "2.1.0",
    release_date: "2026-11-01",
    download_url: "/downloads/AutoPlot_Flexible_v2.0_Setup.zip",
    web_store_url: "/cad-store",
    changelog: "Phát hành bản thương mại v2.1.0: Đã tối ưu động cơ in Named View 100% không lệch lề, tự động nhận diện khổ giấy thực tế, tích hợp trọn bộ Flexible Tool (AutoPlot + AutoViewBase + AutoDim) và kết nối cổng kích hoạt bản quyền trực tuyến.",
    critical: false,
    available_modules: [
      { id: "AUTOPLOT", name: "AutoPlot Flexible", desc: "In gộp PDF hàng loạt chuẩn xưởng" },
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
