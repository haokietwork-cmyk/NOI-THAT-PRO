import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, checkBodySize } from "@/core/security/api-guard";
import { assertNoPiiInTelemetryProperties } from "@/core/monitoring/telemetry";

const TelemetryEventSchema = z.object({
  eventType: z.enum([
    "demo_started",
    "cutlist_imported",
    "quote_calculated",
    "quote_exported_a4",
    "bom_exported_excel",
    "share_link_created",
    "user_registered",
    "project_saved",
  ]),
  timestamp: z.string(),
  sessionId: z.string().min(4).max(64),
  properties: z
    .object({
      partCount: z.number().optional(),
      sheetCount: z.number().optional(),
      moduleCount: z.number().optional(),
      step: z.number().optional(),
      format: z.string().max(20).optional(),
      expiresDays: z.number().optional(),
      isCustomConfig: z.boolean().optional(),
      versionNo: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  // 1. Kiểm tra kích thước payload (tối đa 10KB)
  const text = await req.text();
  const contentLength = req.headers.get("content-length");
  const sizeCheck = checkBodySize(contentLength, text, 10 * 1024);
  if (!sizeCheck.valid) {
    return NextResponse.json({ error: "Payload vượt quá giới hạn 10KB" }, { status: 413 });
  }

  // 2. Rate limit: tối đa 120 events / phút
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous";
  const rateLimit = checkRateLimit(`telemetry_${ip}`, 120, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Quá nhiều sự kiện. Vui lòng thử lại sau." },
      { status: 429 }
    );
  }

  try {
    const body = JSON.parse(text);
    const parsed = TelemetryEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload telemetry không hợp lệ" }, { status: 400 });
    }

    // 3. Khẳng định không có PII
    assertNoPiiInTelemetryProperties(parsed.data.properties);

    // Sự kiện hợp lệ và ẩn danh hoàn toàn
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Lỗi xử lý telemetry" }, { status: 400 });
  }
}
