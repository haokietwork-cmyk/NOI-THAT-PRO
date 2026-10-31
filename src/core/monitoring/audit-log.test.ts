import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeAuditDetails,
  formatAuditActionVi,
  recordLocalAuditLog,
} from "./audit-log.ts";

describe("audit-log: Quản lý nhật ký thay đổi dự án (P1 - H2)", () => {
  test("sanitizeAuditDetails loại bỏ hoàn toàn các trường chứa thông tin cá nhân PII", () => {
    const rawDetails = {
      client_name: "Anh Tuấn",
      client_phone: "0988123456",
      customer_address: "Vinhomes Smart City",
      old_status: "draft",
      new_status: "approved",
      old_total_quote: 25_000_000,
      new_total_quote: 26_865_218,
      note: "Gọi cho anh Tuấn 0912345678 để báo giá",
    };

    const cleaned = sanitizeAuditDetails(rawDetails);

    // 1. Phải xóa sạch các trường nhạy cảm
    assert.equal(cleaned.client_name, undefined);
    assert.equal(cleaned.client_phone, undefined);
    assert.equal(cleaned.customer_address, undefined);

    // 2. Các trường kỹ thuật phải được giữ nguyên
    assert.equal(cleaned.old_status, "draft");
    assert.equal(cleaned.new_status, "approved");
    assert.equal(cleaned.old_total_quote, 25_000_000);
    assert.equal(cleaned.new_total_quote, 26_865_218);

    // 3. Chuỗi tự do có chứa SĐT phải được khử PII
    assert.match(cleaned.note, /\[PHONE_REDACTED\]/);
  });

  test("formatAuditActionVi cung cấp nhãn tiếng Việt chuẩn xác", () => {
    const f1 = formatAuditActionVi("BOM_FROZEN");
    assert.ok(f1.label.includes("Đóng băng hợp đồng"));

    const f2 = formatAuditActionVi("PRICE_CHANGED");
    assert.ok(f2.label.includes("đơn giá"));

    const f3 = formatAuditActionVi("STATUS_CHANGED");
    assert.ok(f3.label.includes("trạng thái"));

    const f4 = formatAuditActionVi("REVISION_CREATED");
    assert.ok(f4.label.includes("bản sửa đổi"));
  });

  test("recordLocalAuditLog sinh log an toàn với ID và timestamp", () => {
    const entry = recordLocalAuditLog(
      "proj-test-1",
      "STATUS_CHANGED",
      { old_status: "draft", new_status: "quoted" },
      "usr-1"
    );

    assert.ok(entry.id.startsWith("audit-"));
    assert.equal(entry.projectId, "proj-test-1");
    assert.equal(entry.action, "STATUS_CHANGED");
    assert.equal(entry.details.old_status, "draft");
    assert.equal(entry.details.new_status, "quoted");
    assert.ok(entry.createdAt);
  });
});
