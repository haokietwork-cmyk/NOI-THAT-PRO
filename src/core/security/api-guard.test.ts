import assert from "node:assert";
import test from "node:test";
import {
  checkRateLimit,
  checkBodySize,
  sanitizeLogData,
  DirectIngestRequestSchema,
  LicenseVerifyRequestSchema,
} from "./api-guard.ts";

test("api-guard: checkRateLimit chặn khi vượt quá hạn mức", () => {
  const ip = "192.168.1.100";
  // Cho phép 3 request trong 5000ms
  const r1 = checkRateLimit(ip, 3, 5000);
  assert.strictEqual(r1.allowed, true);
  assert.strictEqual(r1.remaining, 2);

  const r2 = checkRateLimit(ip, 3, 5000);
  assert.strictEqual(r2.allowed, true);
  assert.strictEqual(r2.remaining, 1);

  const r3 = checkRateLimit(ip, 3, 5000);
  assert.strictEqual(r3.allowed, true);
  assert.strictEqual(r3.remaining, 0);

  const r4 = checkRateLimit(ip, 3, 5000);
  assert.strictEqual(r4.allowed, false, "Request thứ 4 phải bị từ chối");
  assert.strictEqual(r4.remaining, 0);
  assert.ok(r4.resetMs > 0);
});

test("api-guard: checkBodySize từ chối payload vượt quá kích thước cho phép", () => {
  const bodyText = "a".repeat(1000);
  const ok = checkBodySize(null, bodyText, 2000);
  assert.strictEqual(ok.valid, true);
  assert.strictEqual(ok.actualBytes, 1000);

  const tooLarge = checkBodySize(null, bodyText, 500);
  assert.strictEqual(tooLarge.valid, false, "Phải từ chối khi payload vượt maxBytes");
});

test("api-guard: sanitizeLogData lọc sạch thông tin cá nhân PII", () => {
  const rawLog = {
    event: "CAD_INGEST",
    clientName: "Nguyễn Văn A",
    clientPhone: "0901234567",
    clientAddress: "123 Đường Lê Lợi, Q1, TP.HCM",
    email: "xuanthu@example.com",
    partsCount: 48,
    details: {
      phone: "0987654321",
      notes: "Cắt gấp trong ngày",
    },
  };

  const clean = sanitizeLogData(rawLog);
  assert.strictEqual(clean.event, "CAD_INGEST");
  assert.strictEqual(clean.clientName, "[REDACTED]");
  assert.strictEqual(clean.clientPhone, "[REDACTED]");
  assert.strictEqual(clean.clientAddress, "[REDACTED]");
  assert.strictEqual(clean.email, "[REDACTED]");
  assert.strictEqual(clean.partsCount, 48);
  assert.strictEqual(clean.details.phone, "[REDACTED]");
  assert.strictEqual(clean.details.notes, "Cắt gấp trong ngày");
});

test("api-guard: DirectIngestRequestSchema kiểm duyệt dữ liệu CAD chính xác", () => {
  // Hợp lệ
  const validPayload = {
    projectName: "Biệt thự Ecopark",
    clientName: "Anh Tuấn",
    sourceApp: "AutoCAD",
    items: [
      {
        moduleName: "Tủ bếp",
        partName: "Hông tủ",
        length: 800,
        width: 600,
        thickness: 17,
        qty: 2,
        materialCode: "MDF_17",
      },
    ],
  };

  const parsed = DirectIngestRequestSchema.safeParse(validPayload);
  assert.strictEqual(parsed.success, true);

  // Kích thước âm hoặc rỗng
  const invalidPayload = {
    projectName: "Lỗi",
    items: [
      {
        length: -100, // Chiều dài âm
        width: 0,     // Chiều rộng = 0
        thickness: 17,
        qty: -1,      // Số lượng âm
      },
    ],
  };

  const failParsed = DirectIngestRequestSchema.safeParse(invalidPayload);
  assert.strictEqual(failParsed.success, false);
});

test("api-guard: LicenseVerifyRequestSchema từ chối machineId bất thường", () => {
  const valid = {
    machineId: "DISK-48B1A2",
    licenseKey: "NTPRO-DISK-CAD-12345",
    pluginSlug: "autocad-cutlist",
  };
  assert.strictEqual(LicenseVerifyRequestSchema.safeParse(valid).success, true);

  // Ký tự nguy hiểm (SQL Injection / Path Traversal)
  const malicious = {
    machineId: "../../../etc/passwd",
    licenseKey: "KEY123",
  };
  assert.strictEqual(LicenseVerifyRequestSchema.safeParse(malicious).success, false);
});
