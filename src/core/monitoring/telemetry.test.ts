import test from "node:test";
import assert from "node:assert/strict";
import {
  trackFunnelEvent,
  assertNoPiiInTelemetryProperties,
  getOrCreateAnonymousSessionId,
  type FunnelEventType,
} from "./telemetry.ts";

test("telemetry: getOrCreateAnonymousSessionId sinh mã phiên ngẫu nhiên ẩn danh", () => {
  const sid = getOrCreateAnonymousSessionId();
  assert.ok(sid.length >= 8);
  assert.ok(typeof sid === "string");
  // Đảm bảo không chứa thông tin email hoặc số điện thoại
  assert.ok(!sid.includes("@"));
});

test("telemetry: assertNoPiiInTelemetryProperties cho phép các thuộc tính số liệu kỹ thuật hợp lệ", () => {
  const validProps = {
    partCount: 48,
    sheetCount: 18.5,
    moduleCount: 4,
    step: 2,
    format: "pdf",
    isCustomConfig: false,
    versionNo: 1,
  };

  assert.doesNotThrow(() => {
    assertNoPiiInTelemetryProperties(validProps);
  });
});

test("telemetry: assertNoPiiInTelemetryProperties chặn đứng tên khách hàng, SĐT và địa chỉ", () => {
  assert.throws(() => {
    assertNoPiiInTelemetryProperties({
      clientName: "Nguyễn Văn A",
    });
  }, /Từ khóa PII\/bí mật bị cấm/);

  assert.throws(() => {
    assertNoPiiInTelemetryProperties({
      phone: "0912345678",
    });
  }, /Từ khóa PII\/bí mật bị cấm/);

  assert.throws(() => {
    assertNoPiiInTelemetryProperties({
      note: "Giao tại 123 Phố Huế, Hà Nội liên hệ 0987654321",
    });
  }, /Phát hiện chuỗi giống SĐT/);

  assert.throws(() => {
    assertNoPiiInTelemetryProperties({
      contact: "user@example.com",
    });
  }, /Phát hiện email/);
});

test("telemetry: assertNoPiiInTelemetryProperties bảo vệ bí mật kinh doanh giá vốn và markup", () => {
  assert.throws(() => {
    assertNoPiiInTelemetryProperties({
      totalCost: 16281950,
    });
  }, /Từ khóa PII\/bí mật bị cấm/);

  assert.throws(() => {
    assertNoPiiInTelemetryProperties({
      profitMargin: 1.65,
    });
  }, /Từ khóa PII\/bí mật bị cấm/);
});

test("telemetry: trackFunnelEvent ghi nhận đầy đủ 8 sự kiện phễu cốt lõi", () => {
  const funnelEvents: FunnelEventType[] = [
    "demo_started",
    "cutlist_imported",
    "quote_calculated",
    "quote_exported_a4",
    "bom_exported_excel",
    "share_link_created",
    "user_registered",
    "project_saved",
  ];

  for (const ev of funnelEvents) {
    const res = trackFunnelEvent(ev, { partCount: 10, step: 1 });
    assert.equal(res.eventType, ev);
    assert.ok(res.timestamp);
    assert.ok(res.sessionId);
    assert.equal(res.properties?.partCount, 10);
  }
});
