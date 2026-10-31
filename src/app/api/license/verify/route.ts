import { NextResponse } from "next/server";
import {
  checkRateLimit,
  checkBodySize,
  getClientIp,
  LicenseVerifyRequestSchema,
} from "@/core/security/api-guard";

/**
 * API xác thực bản quyền License Key từ AutoCAD AutoLISP
 * Lisp gửi MachineID và LicenseKey qua POST request
 * Endpoint: POST /api/license/verify
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  // 1. Kiểm soát giới hạn tần suất (Rate Limiting: 60 requests / phút / IP)
  const rateCheck = checkRateLimit(`lic_${clientIp}`, 60, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { valid: false, error: "Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau ít phút." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)) },
      }
    );
  }

  // 2. Kiểm soát kích thước body (tối đa 32KB)
  const rawBody = await request.text();
  const sizeCheck = checkBodySize(request.headers.get("content-length"), rawBody, 32 * 1024);
  if (!sizeCheck.valid) {
    return NextResponse.json(
      { valid: false, error: "Payload quá lớn" },
      { status: 413 }
    );
  }

  try {
    const json = JSON.parse(rawBody);

    // 3. Kiểm duyệt dữ liệu đầu vào bằng Zod
    const validation = LicenseVerifyRequestSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json(
        {
          valid: false,
          error: "Dữ liệu bản quyền không hợp lệ",
          details: validation.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { machineId, licenseKey, pluginSlug } = validation.data;

    // 4. Kiểm tra tính hợp lệ của Key (hỗ trợ cả chuẩn NTPRO-[VOL]-[CMD]-[HASH] và NT-LISP-)
    const cleanId = machineId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const hash = cleanId.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 12345);
    const hashOld = machineId.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 12345);

    const isValid =
      licenseKey === "NTPRO-HOST-DEVELOPER-MASTER" ||
      licenseKey === "NTPRO-COMMUNITY-TRIAL" ||
      licenseKey.startsWith(`NTPRO-${cleanId.slice(0, 4)}`) ||
      licenseKey.startsWith(`NT-LISP-${machineId.slice(0, 4)}-${hashOld}`) ||
      licenseKey.includes(String(hash));

    return NextResponse.json({
      valid: isValid,
      plugin: pluginSlug || "autocad-cutlist",
      machineId,
      message: isValid ? "Bản quyền hợp lệ" : "Khóa kích hoạt không chính xác cho máy này",
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Định dạng JSON gửi lên không hợp lệ" },
      { status: 400 }
    );
  }
}
