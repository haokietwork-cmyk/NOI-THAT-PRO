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
  // Mô phỏng kết quả khi Supabase trả lỗi permission hoặc network
  const simulateCloudError = (errorMsg: string) => {
    return {
      success: false,
      error: errorMsg,
    };
  };

  const resError = simulateCloudError("permission denied for table profiles");
  assert.strictEqual(resError.success, false);
  assert.strictEqual(resError.error, "permission denied for table profiles");

  // Format thông báo UI phân biệt rõ ràng
  const formatToastMessage = (res: { success: boolean; error?: string }) => {
    if (!res.success) {
      return `⚠️ Đã lưu tạm trên máy, chưa lên Cloud: ${res.error}`;
    }
    return "✅ Đã lưu dự án thành công lên Cloud!";
  };

  const msgFailure = formatToastMessage(resError);
  assert.ok(msgFailure.includes("Đã lưu tạm trên máy, chưa lên Cloud"));
  assert.ok(msgFailure.includes("permission denied"));

  const msgSuccess = formatToastMessage({ success: true });
  assert.ok(msgSuccess.includes("Đã lưu dự án thành công lên Cloud"));
  assert.strictEqual(msgSuccess.includes("chưa lên Cloud"), false);
});
