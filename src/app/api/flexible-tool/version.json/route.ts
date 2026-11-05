import { NextResponse } from "next/server";

/**
 * Endpoint kiểm tra phiên bản mới ngầm cho AutoPlot Flexible (.NET AutoCAD Plugin)
 * Khớp hoàn toàn với UpdateChecker.cs trong mã nguồn AutoCAD
 * GET /api/flexible-tool/version.json
 */
export async function GET() {
  const versionInfo = {
    latest_version: "2.3.2",
    release_date: "2026-11-05",
    download_url: "https://auto-moc.vercel.app/downloads/AutoPlot_Flexible_v2.3_Setup.zip",
    web_store_url: "/cad-store",
    changelog: "Phát hành bản v2.3.2 Universal (AutoCAD 2014-2027): Bổ sung hỗ trợ Pickfirst (Implied Selection) thông minh; tự động nhận diện khung vẽ trên Layer 0/Defpoints; khắc phục triệt để hiện tượng cửa sổ Modeless làm mất tương tác AutoCAD; chuẩn hóa khổ giấy A4/A3/A2/A1/A0 chính xác theo tỷ lệ vẽ; tích hợp bộ đệm xem trước bản vẽ Native Canvas Engine siêu nét; tự động kiểm tra phiên bản mới ngầm an toàn qua TLS 1.2.",
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
