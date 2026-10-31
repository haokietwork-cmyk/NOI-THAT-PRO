import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateShareToken,
  hashShareToken,
  buildCustomerSharedPayload,
  assertPayloadSanitized,
} from "./quote-share.ts";
import type { SavedProject, WorkshopProfile } from "../types/index.ts";

describe("quote-share: Module chia sẻ báo giá an toàn (Giai đoạn F)", () => {
  test("generateShareToken sinh chuỗi ngẫu nhiên 32 bytes (64 ký tự hex)", () => {
    const t1 = generateShareToken();
    const t2 = generateShareToken();

    assert.equal(typeof t1, "string");
    assert.equal(t1.length, 64);
    assert.match(t1, /^[0-9a-f]{64}$/);
    assert.notEqual(t1, t2, "Hai token sinh ra phải độc lập ngẫu nhiên");
  });

  test("hashShareToken tạo mã băm SHA-256 chính xác", () => {
    const token = "a".repeat(64);
    const hash = hashShareToken(token);

    assert.equal(typeof hash, "string");
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
    assert.equal(hash, hashShareToken(token), "Cùng token phải cho cùng một hash");

    assert.throws(() => hashShareToken(""), /Token không hợp lệ/);
    assert.throws(() => hashShareToken("short"), /Token không hợp lệ/);
  });

  test("buildCustomerSharedPayload che sạch hoàn toàn thông tin giá vốn và chi tiết tấm", () => {
    const mockProject: SavedProject = {
      id: "prj-12345678-abcd",
      projectName: "Căn hộ 2PN Vinhomes",
      clientName: "Anh Tuấn",
      clientPhone: "0988123456",
      status: "quoted",
      createdAt: "2026-10-31T00:00:00Z",
      items: [
        {
          id: "p1",
          moduleName: "Tủ áo",
          partName: "Hông tủ",
          lengthMm: 2400,
          widthMm: 600,
          thicknessMm: 17,
          qty: 2,
          materialCode: "MDF_17_VANG",
          edgeL1: false,
          edgeL2: false,
          edgeW1: false,
          edgeW2: false,
        },
      ],
      materialsSnapshot: [],
      roundingStep: 0.5,
      profitMargin: 1.65,
      totalCost: 15_000_000,
      totalQuote: 25_000_000,
      versionNo: 2,
    };

    const mockCalcResult = {
      moduleQuotes: [
        {
          moduleName: "Tủ áo",
          description: "MDF chống ẩm lõi xanh",
          partCount: 12,
          quotePrice: 25_000_000,
        },
      ],
      totalQuotePrice: 25_000_000,
    };

    const mockProfile: WorkshopProfile = {
      name: "Xưởng Mộc Chàng Sơn",
      phone: "0912345678",
      address: "Thạch Thất, Hà Nội",
      bankName: "MB Bank",
      accountNumber: "99998888",
      accountName: "NGUYEN VAN A",
      subscriptionTier: "pro",
    };

    const payload = buildCustomerSharedPayload(mockProject, mockCalcResult, mockProfile, {
      includeBankInfo: true,
    });

    // 1. Kiểm tra các thông tin cần có cho khách
    assert.equal(payload.projectName, "Căn hộ 2PN Vinhomes");
    assert.equal(payload.clientName, "Anh Tuấn");
    assert.equal(payload.contractNumber, "HĐNT-2026-VNPRJ-");
    assert.equal(payload.versionNo, 2);
    assert.equal(payload.workshop.name, "Xưởng Mộc Chàng Sơn");
    assert.equal(payload.workshop.bankInfo?.bankName, "MB Bank");
    assert.equal(payload.modules.length, 1);
    assert.equal(payload.modules[0].quotePrice, 25_000_000);
    assert.equal(payload.totalQuotePrice, 25_000_000);
    assert.ok(payload.terms.length > 0);
    assert.ok(payload.legalDisclaimer.includes("hệ số hao hụt"));

    // 2. Kiểm tra không có rò rỉ giá vốn hay phôi tấm
    assert.equal((payload as any).totalCost, undefined);
    assert.equal((payload as any).profitMargin, undefined);
    assert.equal((payload as any).items, undefined);
    assert.equal((payload as any).boards, undefined);
  });

  test("assertPayloadSanitized phát hiện và chặn đứng mọi trường cấm", () => {
    // Hợp lệ
    assert.doesNotThrow(() => {
      assertPayloadSanitized({
        projectName: "Tủ bếp",
        quotePrice: 10_000_000,
        modules: [{ name: "Tủ trên", quotePrice: 5_000_000 }],
      });
    });

    // Vi phạm: Chứa totalCost
    assert.throws(
      () => {
        assertPayloadSanitized({
          projectName: "Tủ bếp",
          totalCost: 6_000_000,
        });
      },
      /CẢNH BÁO BẢO MẬT.*totalCost/
    );

    // Vi phạm: Chứa profitMargin
    assert.throws(
      () => {
        assertPayloadSanitized({
          projectName: "Tủ bếp",
          profitMargin: 1.65,
        });
      },
      /CẢNH BÁO BẢO MẬT.*profitMargin/
    );

    // Vi phạm lồng sâu: Chứa lengthMm
    assert.throws(
      () => {
        assertPayloadSanitized({
          projectName: "Tủ bếp",
          details: [{ partName: "Hông", lengthMm: 2000 }],
        });
      },
      /CẢNH BÁO BẢO MẬT.*lengthMm/
    );
  });
});
