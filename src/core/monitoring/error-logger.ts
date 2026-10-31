/**
 * HỆ THỐNG GIÁM SÁT LỖI VÀ BẢO VỆ DỮ LIỆU CÁ NHÂN (ERROR MONITORING & PII SCRUBBER)
 * Tuân thủ Rule 4: Tuyệt đối không log PII (tên, SĐT, email, địa chỉ khách) ra console hay telemetry.
 */

// Danh sách các trường dữ liệu nhạy cảm cần thay thế bằng [REDACTED]
const SENSITIVE_KEY_PATTERNS = [
  "clientname",
  "client_name",
  "clientphone",
  "client_phone",
  "phone",
  "phonenumber",
  "phone_number",
  "clientaddress",
  "client_address",
  "address",
  "email",
  "password",
  "token",
  "access_token",
  "refresh_token",
  "secret",
  "apikey",
  "api_key",
  "authorization",
  "licensekey",
  "license_key",
  "accountnumber",
  "account_number",
];

// Regex nhận diện số điện thoại Việt Nam (10 số, đầu 03, 05, 07, 08, 09 hoặc +84)
const VN_PHONE_REGEX = /(?:\+84|0)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}\b/g;

// Regex nhận diện địa chỉ email
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Khử sạch các thông tin nhạy cảm trong chuỗi văn bản tự do
 */
export function scrubPiiFromString(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(VN_PHONE_REGEX, "[PHONE_REDACTED]")
    .replace(EMAIL_REGEX, "[EMAIL_REDACTED]");
}

/**
 * Khử sạch dữ liệu cá nhân đệ quy trong object / array
 */
export function sanitizeMonitoringData(input: any): any {
  if (input === null || input === undefined) return input;

  if (typeof input === "string") {
    return scrubPiiFromString(input);
  }

  if (typeof input === "number" || typeof input === "boolean") {
    return input;
  }

  if (input instanceof Error) {
    return {
      name: input.name,
      message: scrubPiiFromString(input.message),
      stack: input.stack ? scrubPiiFromString(input.stack) : undefined,
    };
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeMonitoringData);
  }

  if (typeof input === "object") {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => lowerKey.includes(pattern));

      if (isSensitive) {
        cleaned[key] = "[REDACTED]";
      } else {
        cleaned[key] = sanitizeMonitoringData(value);
      }
    }
    return cleaned;
  }

  return "[UNSUPPORTED_DATA_TYPE]";
}

/**
 * Ghi log lỗi có khử PII trước khi ghi ra Console / Sentry
 */
export function logSanitizedError(
  message: string,
  error?: unknown,
  context?: Record<string, any>
): { errorId: string; sanitizedContext: Record<string, any> } {
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanMessage = scrubPiiFromString(message);
  const cleanError = sanitizeMonitoringData(error);
  const cleanContext = sanitizeMonitoringData(context || {});

  const logPayload = {
    errorId,
    timestamp: new Date().toISOString(),
    message: cleanMessage,
    error: cleanError,
    context: cleanContext,
  };

  console.error(`[AutoCutlist Monitor][${errorId}]`, JSON.stringify(logPayload));

  return {
    errorId,
    sanitizedContext: cleanContext,
  };
}

/**
 * Ghi cảnh báo có khử PII
 */
export function logSanitizedWarn(
  message: string,
  context?: Record<string, any>
): void {
  const cleanMessage = scrubPiiFromString(message);
  const cleanContext = sanitizeMonitoringData(context || {});

  console.warn(`[AutoCutlist Monitor][WARN] ${cleanMessage}`, cleanContext);
}
