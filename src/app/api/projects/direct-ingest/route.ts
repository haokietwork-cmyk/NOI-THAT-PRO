import { NextResponse } from "next/server";

interface IngestItem {
  moduleName?: string;
  partName?: string;
  length: number;
  width: number;
  thickness: number;
  qty: number;
  materialCode?: string;
  edges?: string;
}

/**
 * API tiếp nhận Cutlist trực tiếp từ AutoCAD hoặc SketchUp (1-Click Direct Ingest)
 * Endpoint: POST /api/projects/direct-ingest
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectName, clientName, sourceApp, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy danh sách tấm chi tiết (items rỗng)" },
        { status: 400 }
      );
    }

    // Chuẩn hóa danh sách tấm chi tiết
    const cleanedItems = items.map((item: IngestItem, idx: number) => ({
      id: `cad_${Date.now()}_${idx}`,
      moduleName: item.moduleName || "Hạng mục CAD",
      partName: item.partName || `Chi_Tiet_${idx + 1}`,
      length: Number(item.length) || 100,
      width: Number(item.width) || 100,
      thickness: Number(item.thickness) || 17,
      qty: Math.max(1, Number(item.qty) || 1),
      materialCode: item.materialCode || "MDF_CHONG_AM_17",
      edges: item.edges || "4_CANH",
    }));

    // Tạo mã token tạm để trình duyệt tự động nạp dữ liệu vào /quoting
    const ingestId = `ingest_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: `Đã nạp thành công ${cleanedItems.length} chi tiết từ ${sourceApp || "AutoCAD"}!`,
      ingestId,
      projectName: projectName || "Dự án bóc tách từ CAD",
      clientName: clientName || "Khách hàng dự án",
      itemsCount: cleanedItems.length,
      sampleItems: cleanedItems.slice(0, 5),
      webQuotingUrl: `/quoting?source=cad&ingestId=${ingestId}`,
      receivedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
