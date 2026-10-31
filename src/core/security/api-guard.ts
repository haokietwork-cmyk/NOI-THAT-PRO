/**
 * BẢO MẬT API VÀ KIỂM DUYỆT ĐẦU VÀO (API SECURITY & RATE LIMITING GUARD)
 * Áp dụng cho toàn bộ Next.js App Router API endpoints.
 * Đạt chuẩn Rule 4: Không log PII, kiểm soát kích thước body, chống flood request.
 */

import { z } from "zod";

// ============================================================================
// 1. IN-MEMORY RATE LIMITER (SLIDING WINDOW)
// ============================================================================

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Định kỳ dọn dẹp các IP không hoạt động sau mỗi 10 phút để tránh rò rỉ bộ nhớ
let lastCleanup = Date.now();
function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 600_000) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Kiểm tra giới hạn tần suất gọi API
 * @param key Định danh người gọi (IP, MachineID, UserID)
 * @param limit Số lượt gọi tối đa trong cửa sổ
 * @param windowMs Độ dài cửa sổ thời gian (mili giây)
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetMs: number } {
  cleanupExpiredRecords(windowMs);

  const now = Date.now();
  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Lọc bỏ các timestamp ngoài cửa sổ
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return { allowed: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Lấy IP của client an toàn từ HTTP Request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Kiểm tra giới hạn kích thước payload (tránh tấn công DoS tải payload khổng lồ)
 */
export function checkBodySize(
  contentLength: string | null,
  bodyText: string,
  maxBytes: number = 2 * 1024 * 1024 // Mặc định 2MB
): { valid: boolean; actualBytes: number; maxBytes: number } {
  const actualBytes = contentLength ? parseInt(contentLength, 10) : new TextEncoder().encode(bodyText).length;
  return {
    valid: actualBytes <= maxBytes,
    actualBytes,
    maxBytes,
  };
}

// ============================================================================
// 2. KHỬ DỮ LIỆU CÁ NHÂN (PII SANITIZATION FOR LOGGING)
// ============================================================================

const SENSITIVE_KEYS = new Set([
  "clientname",
  "client_name",
  "clientphone",
  "client_phone",
  "phone",
  "phone_number",
  "clientaddress",
  "client_address",
  "address",
  "email",
  "password",
  "access_token",
  "refresh_token",
  "license_key",
  "licensekey",
]);

/**
 * Khử sạch mọi thông tin cá nhân trước khi ghi log ra console hoặc telemetry
 */
export function sanitizeLogData(input: any): any {
  if (!input || typeof input !== "object") return input;

  if (Array.isArray(input)) {
    return input.map(sanitizeLogData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(input)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizeLogData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

// ============================================================================
// 3. ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema kiểm duyệt từng chi tiết Cutlist gửi từ CAD/SketchUp
 */
export const DirectIngestItemSchema = z.object({
  id: z.string().max(100).optional(),
  moduleName: z.string().max(255).default("Hạng mục CAD"),
  partName: z.string().max(255).default("Chi tiết"),
  length: z.number().min(1, "Chiều dài tối thiểu 1mm").max(10_000, "Chiều dài tối đa 10.000mm"),
  width: z.number().min(1, "Chiều rộng tối thiểu 1mm").max(10_000, "Chiều rộng tối đa 10.000mm"),
  thickness: z.number().min(0.5, "Độ dày tối thiểu 0.5mm").max(200, "Độ dày tối đa 200mm"),
  qty: z.number().int().min(1, "Số lượng tối thiểu 1").max(100_000, "Số lượng tối đa 100.000"),
  materialCode: z.string().max(100).default("MDF_CHONG_AM_17"),
  edges: z.string().max(100).optional().default("4_CANH"),
});

/**
 * Schema kiểm duyệt toàn bộ Request Ingest từ CAD
 */
export const DirectIngestRequestSchema = z.object({
  projectName: z.string().max(255).default("Dự án bóc tách từ CAD"),
  clientName: z.string().max(255).default("Khách hàng"),
  clientPhone: z.string().max(50).optional(),
  clientAddress: z.string().max(500).optional(),
  sourceApp: z.string().max(50).default("AutoCAD"),
  items: z
    .array(DirectIngestItemSchema)
    .min(1, "Danh sách tấm chi tiết không được để trống")
    .max(5000, "Tối đa 5.000 tấm cho một lần nạp dữ liệu"),
});

/**
 * Schema kiểm duyệt Request Xác thực bản quyền AutoLISP
 */
export const LicenseVerifyRequestSchema = z.object({
  machineId: z
    .string()
    .min(3, "MachineID tối thiểu 3 ký tự")
    .max(100, "MachineID tối đa 100 ký tự")
    .regex(/^[A-Za-z0-9_-]+$/, "MachineID chỉ được chứa chữ cái, số và dấu gạch ngang"),
  licenseKey: z
    .string()
    .min(5, "LicenseKey tối thiểu 5 ký tự")
    .max(200, "LicenseKey tối đa 200 ký tự"),
  pluginSlug: z.string().max(100).optional().default("autocad-cutlist"),
});
