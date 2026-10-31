/**
 * BỘ BẢO MẬT VÀ XÁC THỰC WEBHOOK THANH TOÁN (PAYMENT WEBHOOK GUARD)
 * Xác thực HMAC-SHA256, API Key SePay/PayOS, và Chống xử lý trùng (Idempotency).
 */

import crypto from "node:crypto";

// Bộ đệm ghi nhớ eventId đã xử lý trong tiến trình (Idempotency in-memory cache)
const processedEventIds = new Set<string>();

/**
 * Kiểm tra xem sự kiện thanh toán đã được xử lý trước đó hay chưa (Idempotency Check)
 */
export function isPaymentEventProcessed(eventId: string): boolean {
  return processedEventIds.has(eventId);
}

/**
 * Đánh dấu sự kiện thanh toán đã hoàn tất xử lý thành công
 */
export function markPaymentEventProcessed(eventId: string): void {
  processedEventIds.add(eventId);
  // Giữ kích thước cache dưới 50,000 items
  if (processedEventIds.size > 50_000) {
    const firstItem = processedEventIds.values().next().value;
    if (firstItem) processedEventIds.delete(firstItem);
  }
}

/**
 * Xóa cache idempotency (chỉ dùng cho unit test)
 */
export function resetPaymentEventCacheForTest(): void {
  processedEventIds.clear();
}

/**
 * Xác thực chữ ký hoặc API Key của Webhook thanh toán
 */
export function verifyPaymentWebhookAuth(
  headers: Headers,
  rawBody: string
): { valid: boolean; provider: "sepay" | "payos" | "dev_mock"; reason?: string } {
  // 1. Kiểm tra môi trường Development
  const isDev = process.env.NODE_ENV !== "production";
  const authHeader = headers.get("authorization") || "";
  const apiKeyHeader = headers.get("x-api-key") || "";
  const signatureHeader = headers.get("x-signature") || "";

  const sepayApiKey = process.env.SEPAY_API_KEY;
  const payosChecksumKey = process.env.PAYOS_CHECKSUM_KEY;
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

  // 2. Kiểm tra chuẩn SePay: Header "Authorization: Apikey <SEPAY_API_KEY>" hoặc "x-api-key"
  if (sepayApiKey) {
    const expectedAuth = `Apikey ${sepayApiKey}`;
    if (authHeader === expectedAuth || apiKeyHeader === sepayApiKey) {
      return { valid: true, provider: "sepay" };
    }
  }

  // 3. Kiểm tra chuẩn PayOS: HMAC-SHA256 tính từ sorted keys của data object
  if (payosChecksumKey && signatureHeader) {
    try {
      const hmac = crypto.createHmac("sha256", payosChecksumKey).update(rawBody).digest("hex");
      if (crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(hmac))) {
        return { valid: true, provider: "payos" };
      }
    } catch {
      // Bỏ qua lỗi format chữ ký
    }
  }

  // 4. Kiểm tra Generic Secret qua header "x-webhook-secret"
  if (webhookSecret) {
    const customSecret = headers.get("x-webhook-secret");
    if (customSecret === webhookSecret) {
      return { valid: true, provider: "sepay" };
    }
  }

  // 5. Nếu đang ở môi trường Test / Dev và chưa cấu hình Secret, cho phép ghi nhận kèm cảnh báo
  if (isDev && !sepayApiKey && !payosChecksumKey && !webhookSecret) {
    return {
      valid: true,
      provider: "dev_mock",
      reason: "Bỏ qua xác thực do đang ở NODE_ENV !== production và chưa cài webhook secret",
    };
  }

  return {
    valid: false,
    provider: "sepay",
    reason: "Chữ ký hoặc API Key Webhook không hợp lệ hoặc thiếu cấu hình trên Server",
  };
}
