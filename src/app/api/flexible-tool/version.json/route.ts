import { NextResponse } from "next/server";

/**
 * Endpoint kiểm tra phiên bản mới ngầm cho AutoPlot Flexible (.NET AutoCAD Plugin)
 * Khớp hoàn toàn với UpdateChecker.cs trong mã nguồn AutoCAD
 * GET /api/flexible-tool/version.json
 */
export async function GET() {
  const versionInfo = {
    latest_version: "2.1.0",
    release_date: "2026-11-15",
    download_url: "/downloads/AutoPlot_Flexible_v2.0_Setup.zip",
    changelog: "Phát hành bản thương mại v2.0/v2.1: Tối ưu in gộp PDF hàng loạt, nhận diện khung Block động, khử trùng lặp không gian và tự động tạo Bookmark mục lục.",
    critical: false,
  };

  return NextResponse.json(versionInfo, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
