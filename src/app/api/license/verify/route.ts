import { NextResponse } from "next/server";

/**
 * API xác thực bản quyền License Key từ AutoCAD AutoLISP
 * Lisp gửi MachineID và LicenseKey qua POST request
 */
export async function POST(request: Request) {
  try {
    const { machineId, licenseKey, pluginSlug } = await request.json();

    if (!machineId || !licenseKey) {
      return NextResponse.json(
        { valid: false, message: "Thiếu MachineID hoặc LicenseKey" },
        { status: 400 }
      );
    }

    // Kiểm tra tính hợp lệ của Key (hỗ trợ cả chuẩn NTPRO-[VOL]-[CMD]-[HASH] và NT-LISP-)
    const cleanId = String(machineId || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
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
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
