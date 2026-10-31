import assert from "node:assert";
import test from "node:test";
import {
  scrubPiiFromString,
  sanitizeMonitoringData,
  logSanitizedError,
  logSanitizedWarn,
} from "./error-logger.ts";

test("error-logger: scrubPiiFromString loại bỏ SĐT và Email trong chuỗi", () => {
  const input = "Lỗi xử lý đơn cho khách 0912345678 tại email lienhe@khachhang.com";
  const scrubbed = scrubPiiFromString(input);

  assert.strictEqual(scrubbed.includes("0912345678"), false);
  assert.strictEqual(scrubbed.includes("lienhe@khachhang.com"), false);
  assert.strictEqual(scrubbed, "Lỗi xử lý đơn cho khách [PHONE_REDACTED] tại email [EMAIL_REDACTED]");
});

test("error-logger: sanitizeMonitoringData che giấu các khóa nhạy cảm trong object", () => {
  const context = {
    projectId: "proj-123",
    clientName: "Nguyễn Văn B",
    clientPhone: "0987654321",
    clientAddress: "Số 45 Đường Hoàng Diệu, Hà Nội",
    totalQuote: 26865218,
    nested: {
      accountNumber: "1234567890",
      notes: "Gặp anh Tuấn số 0909123456",
    },
  };

  const cleaned = sanitizeMonitoringData(context);

  assert.strictEqual(cleaned.projectId, "proj-123");
  assert.strictEqual(cleaned.clientName, "[REDACTED]");
  assert.strictEqual(cleaned.clientPhone, "[REDACTED]");
  assert.strictEqual(cleaned.clientAddress, "[REDACTED]");
  assert.strictEqual(cleaned.totalQuote, 26865218);
  assert.strictEqual(cleaned.nested.accountNumber, "[REDACTED]");
  assert.strictEqual(cleaned.nested.notes.includes("0909123456"), false);
});

test("error-logger: sanitizeMonitoringData xử lý Error instance có PII trong stack/message", () => {
  const customError = new Error("Thất bại khi gửi SMS tới 0912334455");
  const cleaned = sanitizeMonitoringData(customError);

  assert.strictEqual(cleaned.name, "Error");
  assert.strictEqual(cleaned.message.includes("0912334455"), false);
  assert.strictEqual(cleaned.message, "Thất bại khi gửi SMS tới [PHONE_REDACTED]");
});

test("error-logger: logSanitizedError sinh errorId duy nhất và context đã sạch", () => {
  const res = logSanitizedError("Lỗi tính toán", new Error("test"), {
    clientPhone: "0911223344",
    moduleCount: 4,
  });

  assert.ok(res.errorId.startsWith("err_"));
  assert.strictEqual(res.sanitizedContext.clientPhone, "[REDACTED]");
  assert.strictEqual(res.sanitizedContext.moduleCount, 4);
});
