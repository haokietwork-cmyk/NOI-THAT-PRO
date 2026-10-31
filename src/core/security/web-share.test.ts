import test from "node:test";
import assert from "node:assert/strict";

/**
 * Helper kiểm tra và định dạng payload cho Web Share API
 */
export function formatWebSharePayload({
  shareUrl,
  projectName,
  workshopName,
}: {
  shareUrl: string;
  projectName?: string;
  workshopName?: string;
}) {
  if (!shareUrl || !shareUrl.startsWith("http")) {
    throw new Error("shareUrl không hợp lệ");
  }

  const title = "Báo Giá Thi Công Nội Thất";
  const descPrefix = workshopName ? `[${workshopName}] ` : "";
  const projectDesc = projectName ? `Công trình: ${projectName}` : "Bản báo giá thi công nội thất";
  const text = `${descPrefix}${projectDesc} (Chuẩn xưởng sản xuất)`;

  return {
    title,
    text,
    url: shareUrl,
  };
}

/**
 * Kiểm tra xem payload Web Share có để lộ giá vốn hay bí mật kinh doanh không
 */
export function assertNoPiiOrCostInSharePayload(payload: { title: string; text: string; url: string }) {
  const forbiddenKeywords = [
    "giá vốn",
    "totalBaseCost",
    "profitMargin",
    "markup",
    "lãi gộp",
    "định mức keo",
    "mật khẩu",
    "password",
    "secret",
  ];

  const fullText = `${payload.title} ${payload.text} ${payload.url}`.toLowerCase();
  for (const kw of forbiddenKeywords) {
    if (fullText.includes(kw.toLowerCase())) {
      throw new Error(`Web Share payload chứa từ khóa cấm: ${kw}`);
    }
  }
  return true;
}

test("web-share: formatWebSharePayload tạo tiêu đề và nội dung chuẩn xưởng", () => {
  const payload = formatWebSharePayload({
    shareUrl: "https://webnoithatpro.vn/share/abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    projectName: "Biệt Thự Gamuda",
    workshopName: "Xưởng Mộc Hoàng Gia",
  });

  assert.equal(payload.title, "Báo Giá Thi Công Nội Thất");
  assert.equal(payload.text, "[Xưởng Mộc Hoàng Gia] Công trình: Biệt Thự Gamuda (Chuẩn xưởng sản xuất)");
  assert.ok(payload.url.startsWith("https://"));
});

test("web-share: formatWebSharePayload fallback an toàn khi thiếu tên dự án hoặc xưởng", () => {
  const payload = formatWebSharePayload({
    shareUrl: "https://webnoithatpro.vn/share/abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  });

  assert.equal(payload.title, "Báo Giá Thi Công Nội Thất");
  assert.equal(payload.text, "Bản báo giá thi công nội thất (Chuẩn xưởng sản xuất)");
});

test("web-share: assertNoPiiOrCostInSharePayload bảo vệ tuyệt đối bí mật kinh doanh", () => {
  const validPayload = formatWebSharePayload({
    shareUrl: "https://webnoithatpro.vn/share/123",
    projectName: "Căn hộ 802 Ecohome",
    workshopName: "Xưởng Phúc Thịnh",
  });

  assert.doesNotThrow(() => {
    assertNoPiiOrCostInSharePayload(validPayload);
  });

  assert.throws(() => {
    assertNoPiiOrCostInSharePayload({
      title: "Báo giá",
      text: "Báo giá có giá vốn 12.000.000 đ",
      url: "https://webnoithatpro.vn/share/123",
    });
  }, /chứa từ khóa cấm/);
});
