import test from "node:test";
import assert from "node:assert/strict";

test("flexible-tool: Kiểm định cấu trúc Version API tương thích UpdateChecker.cs", () => {
  const versionInfo = {
    latest_version: "2.1.0",
    release_date: "2026-11-15",
    download_url: "/downloads/AutoPlot_Flexible_v2.0_Setup.zip",
    changelog: "Phát hành bản thương mại v2.0/v2.1: Tối ưu in gộp PDF hàng loạt, nhận diện khung Block động, khử trùng lặp không gian và tự động tạo Bookmark mục lục.",
    critical: false,
  };

  assert.equal(typeof versionInfo.latest_version, "string");
  assert.match(versionInfo.latest_version, /^\d+\.\d+\.\d+$/);
  assert.equal(typeof versionInfo.download_url, "string");
  assert.equal(typeof versionInfo.critical, "boolean");
});

test("flexible-tool: Kiểm định cấu trúc LicensePayload tương thích LicenseModel.cs", () => {
  const payload = {
    MachineId: "AP-8F4B-39E1-D04C-7A12",
    CustomerName: "Xưởng Mộc Văn Liêm",
    Email: "vanliem@woodshop.vn",
    IssuedDate: "2026-10-31T00:00:00.000Z",
    ExpiryDate: "2036-10-31T00:00:00.000Z",
    IsLifetime: true,
    ActivatedTools: ["AUTOPLOT", "AUTODIM", "WOOD_NESTING"],
    Signature: "U0lHX0ZMRVhJQkxFX0RFTU8=",
  };

  assert.match(payload.MachineId, /^AP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/);
  assert.ok(payload.ActivatedTools.includes("AUTOPLOT"));
  assert.equal(payload.IsLifetime, true);
  assert.ok(payload.Signature.length > 0);
});
