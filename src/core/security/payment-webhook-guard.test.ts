import assert from "node:assert";
import test from "node:test";
import crypto from "node:crypto";
import {
  verifyPaymentWebhookAuth,
  isPaymentEventProcessed,
  markPaymentEventProcessed,
  resetPaymentEventCacheForTest,
} from "./payment-webhook-guard.ts";

test("payment-webhook-guard: Idempotency chống xử lý trùng lặp giao dịch", () => {
  resetPaymentEventCacheForTest();
  const eventId = "sepay_tx_123456";

  assert.strictEqual(isPaymentEventProcessed(eventId), false, "Ban đầu eventId chưa xử lý");

  markPaymentEventProcessed(eventId);
  assert.strictEqual(isPaymentEventProcessed(eventId), true, "Sau khi xử lý, eventId phải được đánh dấu");

  // Kiểm tra event khác
  assert.strictEqual(isPaymentEventProcessed("sepay_tx_999999"), false);
});

test("payment-webhook-guard: Xác thực chữ ký SePay qua API Key", () => {
  process.env.SEPAY_API_KEY = "my_secret_sepay_key";

  // Header hợp lệ
  const headersValid = new Headers({
    authorization: "Apikey my_secret_sepay_key",
  });
  const resValid = verifyPaymentWebhookAuth(headersValid, "{}");
  assert.strictEqual(resValid.valid, true);
  assert.strictEqual(resValid.provider, "sepay");

  // Header sai
  const headersInvalid = new Headers({
    authorization: "Apikey wrong_key",
  });
  const resInvalid = verifyPaymentWebhookAuth(headersInvalid, "{}");
  assert.strictEqual(resInvalid.valid, false);

  delete process.env.SEPAY_API_KEY;
});

test("payment-webhook-guard: Xác thực chữ ký PayOS HMAC-SHA256", () => {
  const checksumKey = "payos_checksum_secret_key";
  process.env.PAYOS_CHECKSUM_KEY = checksumKey;

  const rawBody = JSON.stringify({ data: { orderCode: 12345, amount: 200000 } });
  const validSignature = crypto.createHmac("sha256", checksumKey).update(rawBody).digest("hex");

  const headers = new Headers({
    "x-signature": validSignature,
  });

  const res = verifyPaymentWebhookAuth(headers, rawBody);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.provider, "payos");

  // Sai chữ ký
  const badHeaders = new Headers({
    "x-signature": "invalid_hex_signature",
  });
  const badRes = verifyPaymentWebhookAuth(badHeaders, rawBody);
  assert.strictEqual(badRes.valid, false);

  delete process.env.PAYOS_CHECKSUM_KEY;
});
