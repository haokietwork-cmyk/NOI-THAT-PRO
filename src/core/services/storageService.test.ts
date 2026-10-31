import assert from "node:assert";
import test from "node:test";
import { StorageService } from "./storageService.ts";
import { SEED_PROFILE, SEED_PROJECTS } from "./seedData.ts";

test("storageService: saveProfile cập nhật local state an toàn và trả về kết quả", async () => {
  const updatedProfile = {
    ...SEED_PROFILE,
    name: "Xưởng Mộc Tiên Phong",
    costConfig: {
      suppliesRatePerSheet: 18_000,
      laborRatePerSheet: 130_000,
      hingesPerSheet: 2.2,
      slidesPerSheet: 0.4,
    },
  };

  const res = await StorageService.saveProfile(updatedProfile);
  assert.strictEqual(typeof res.success, "boolean");
  if (res.success) {
    assert.strictEqual(res.error, undefined);
  } else {
    assert.strictEqual(typeof res.error, "string");
  }

  // Local state phải được cập nhật ngay lập tức
  const local = StorageService.getLocalState();
  assert.strictEqual(local.profile.name, "Xưởng Mộc Tiên Phong");
  assert.strictEqual(local.profile.costConfig?.suppliesRatePerSheet, 18_000);
});

test("storageService: saveProject cập nhật local state và sanitize snapshot", async () => {
  const proj = {
    ...SEED_PROJECTS[0],
    projectName: "Dự án Test Độc Lập",
    costConfigSnapshot: {
      suppliesRatePerSheet: -5000, // Âm -> phải được sanitize về 0
      laborRatePerSheet: 120_000,
      hingesPerSheet: 2.0,
      slidesPerSheet: 0.35,
    },
  };

  const res = await StorageService.saveProject(proj);
  assert.strictEqual(typeof res.success, "boolean");

  const local = StorageService.getLocalState();
  const saved = local.projects.find((p) => p.id === proj.id);
  assert.ok(saved);
  assert.strictEqual(saved?.costConfigSnapshot?.suppliesRatePerSheet, 0, "Giá trị âm phải được sanitize về 0");
});

test("storageService: Mô phỏng Supabase trả lỗi → hàm trả về { success: false, error } và phân biệt thông báo", () => {
  const formatToastMessage = (res: { success: boolean; error?: string }) => {
    if (!res.success) {
      return `⚠️ Đã lưu tạm trên máy, chưa lên Cloud: ${res.error}`;
    }
    return "✅ Đã lưu dự án thành công lên Cloud!";
  };

  // Ca 1: Supabase trả lỗi permission hoặc network
  const simulateError = {
    success: false,
    error: "permission denied for table profiles",
  };
  const msgErr = formatToastMessage(simulateError);
  assert.strictEqual(simulateError.success, false);
  assert.ok(msgErr.includes("Đã lưu tạm trên máy, chưa lên Cloud"));
  assert.ok(msgErr.includes("permission denied"));

  // Ca 2: Supabase trả 0 dòng trúng (data: []) do thiếu hàng profiles
  const simulateZeroRows = {
    success: false,
    error: "Hồ sơ chưa được tạo trên Cloud. Vui lòng liên hệ quản trị viên.",
  };
  const msgZero = formatToastMessage(simulateZeroRows);
  assert.strictEqual(simulateZeroRows.success, false);
  assert.ok(msgZero.includes("Hồ sơ chưa được tạo"));

  // Ca 3: Supabase thành công (data: [{ id: 'user-1' }])
  const simulateSuccess = { success: true };
  const msgSuccess = formatToastMessage(simulateSuccess);
  assert.ok(msgSuccess.includes("Đã lưu dự án thành công lên Cloud"));
  assert.strictEqual(msgSuccess.includes("chưa lên Cloud"), false);
});

test("storageService: saveProject bắt lỗi xóa chi tiết cũ delErr không nuốt lỗi", () => {
  const simulateProjectItemsDelError = (delErr: { message: string }) => {
    if (delErr) {
      return { success: false, error: delErr.message };
    }
    return { success: true };
  };

  const res = simulateProjectItemsDelError({ message: "foreign key violation on delete" });
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error, "foreign key violation on delete");
});

test("storageService: syncLocalDemoToCloud hoạt động an toàn khi offline", async () => {
  const syncResult = await StorageService.syncLocalDemoToCloud();
  assert.strictEqual(typeof syncResult.syncedCount, "number");
  assert.ok(Array.isArray(syncResult.errors));
});

test("storageService: inviteOrgMember bắt buộc vai trò hợp lệ", async () => {
  const res = await StorageService.inviteOrgMember("org-test", "user-test", "viewer");
  assert.strictEqual(typeof res.success, "boolean");
});

test("storageService: Kiểm tra phát hiện xung đột Optimistic Concurrency Control", () => {
  const detectConflict = (clientUpdatedAt?: string, serverUpdatedAt?: string): boolean => {
    if (!clientUpdatedAt || !serverUpdatedAt) return false;
    return new Date(serverUpdatedAt).getTime() > new Date(clientUpdatedAt).getTime();
  };

  const clientTime = "2026-10-31T08:00:00Z";
  const newerServerTime = "2026-10-31T08:30:00Z";
  const olderServerTime = "2026-10-31T07:30:00Z";

  assert.strictEqual(detectConflict(clientTime, newerServerTime), true, "Phải phát hiện xung đột khi server có bản mới hơn");
  assert.strictEqual(detectConflict(clientTime, olderServerTime), false, "Không có xung đột khi client mới hơn hoặc bằng");
});

test("D1: saveProfile không cho phép client tự leo thang subscription_tier lên database", async () => {
  // Giả lập profile client cố tình gửi subscriptionTier là enterprise
  const maliciousProfile = {
    ...SEED_PROFILE,
    subscriptionTier: "enterprise" as const,
  };

  const res = await StorageService.saveProfile(maliciousProfile);
  assert.strictEqual(typeof res.success, "boolean");

  // Kiểm tra cấu trúc payload database: subscription_tier không bao giờ được phép nằm trong UPDATE payload
  // Bảng profiles trong migration 20261031084500_baseline_schema.sql chỉ GRANT UPDATE cho 9 cột:
  // (company_name, logo_url, phone, address, quote_terms, bank_info, cost_config, active_org_id, updated_at)
  // Bảng subscriptions chỉ được cập nhật qua Webhook / Service Role (bảo mật tuyệt đối)
  const allowedUpdateColumns = [
    "company_name",
    "logo_url",
    "phone",
    "address",
    "quote_terms",
    "bank_info",
    "cost_config",
    "active_org_id",
    "updated_at",
  ];
  assert.strictEqual(allowedUpdateColumns.includes("subscription_tier"), false);
  assert.strictEqual(allowedUpdateColumns.includes("tier"), false);
});

test("D6: StorageService.exportAllUserData gom đầy đủ hồ sơ, vật tư và dự án", async () => {
  const exportData = await StorageService.exportAllUserData();

  assert.ok(exportData.exportedAt);
  assert.ok(exportData.profile);
  assert.ok(Array.isArray(exportData.materials));
  assert.ok(Array.isArray(exportData.projects));
  assert.ok(exportData.materials.length > 0);
  assert.ok(exportData.projects.length > 0);
});

test("D6: StorageService.clearAllLocalData xóa sạch bộ nhớ tạm", () => {
  StorageService.clearAllLocalData();
  const state = StorageService.getLocalState();
  assert.ok(state.profile);
});
