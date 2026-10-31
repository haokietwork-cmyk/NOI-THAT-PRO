/**
 * Hệ thống Phân tích Sử dụng Ẩn danh (Anonymous Telemetry - H7)
 * Tuân thủ Hiến pháp & Rule 4: KHÔNG thu thập tên, SĐT, địa chỉ khách, tên dự án, hay bí mật giá xưởng.
 */

export type FunnelEventType =
  | "demo_started"
  | "cutlist_imported"
  | "quote_calculated"
  | "quote_exported_a4"
  | "bom_exported_excel"
  | "share_link_created"
  | "user_registered"
  | "project_saved";

export interface AnonymousEventPayload {
  eventType: FunnelEventType;
  timestamp: string;
  sessionId: string;
  properties?: {
    partCount?: number;
    sheetCount?: number;
    moduleCount?: number;
    step?: number;
    format?: string;
    expiresDays?: number;
    isCustomConfig?: boolean;
    versionNo?: number;
  };
}

const STORAGE_KEY = "autocutlist_anonymous_telemetry";
const MAX_LOCAL_EVENTS = 50;

/**
 * Sinh mã phiên ngẫu nhiên ẩn danh (không gắn với danh tính người dùng)
 */
export function getOrCreateAnonymousSessionId(): string {
  if (typeof window === "undefined") {
    return "srv_" + Math.random().toString(36).substring(2, 10);
  }

  try {
    let sid = window.sessionStorage.getItem("autocutlist_session_id");
    if (!sid) {
      sid = "s_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      window.sessionStorage.setItem("autocutlist_session_id", sid);
    }
    return sid;
  } catch {
    return "s_ephemeral_" + Math.random().toString(36).substring(2, 10);
  }
}

/**
 * Kiểm tra danh sách đen từ khóa PII & Bí mật giá vốn
 */
export function assertNoPiiInTelemetryProperties(props?: Record<string, any>): void {
  if (!props) return;

  const forbiddenKeys = [
    "clientname",
    "customername",
    "clientphone",
    "phone",
    "telephone",
    "clientaddress",
    "address",
    "projectname",
    "email",
    "totalcost",
    "basecost",
    "profitmargin",
    "markup",
    "password",
    "token",
    "shareurl",
  ];

  for (const key of Object.keys(props)) {
    const lowerKey = key.toLowerCase();
    for (const f of forbiddenKeys) {
      if (lowerKey.includes(f)) {
        throw new Error(`Từ khóa PII/bí mật bị cấm trong telemetry: ${key}`);
      }
    }

    const val = props[key];
    if (typeof val === "string") {
      // Kiểm tra SĐT Việt Nam trong giá trị
      if (/(0[3|5|7|8|9]\d{8}|\+84[3|5|7|8|9]\d{8})/.test(val)) {
        throw new Error(`Phát hiện chuỗi giống SĐT trong telemetry: ${key}`);
      }
      // Kiểm tra Email trong giá trị
      if (/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/.test(val)) {
        throw new Error(`Phát hiện email trong telemetry: ${key}`);
      }
    }
  }
}

/**
 * Ghi nhận một sự kiện phễu ẩn danh
 */
export function trackFunnelEvent(
  eventType: FunnelEventType,
  properties?: AnonymousEventPayload["properties"]
): AnonymousEventPayload {
  // 1. Kiểm tra an toàn PII
  assertNoPiiInTelemetryProperties(properties);

  const event: AnonymousEventPayload = {
    eventType,
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateAnonymousSessionId(),
    properties: properties ? { ...properties } : undefined,
  };

  // 2. Lưu vào hàng đợi local buffer (tối đa 50 sự kiện)
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list: AnonymousEventPayload[] = raw ? JSON.parse(raw) : [];
      list.push(event);
      if (list.length > MAX_LOCAL_EVENTS) {
        list.splice(0, list.length - MAX_LOCAL_EVENTS);
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Bỏ qua lỗi lưu local
    }

    // 3. Gửi beacon bất đồng bộ không chặn UI
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([JSON.stringify(event)], { type: "application/json" });
        navigator.sendBeacon("/api/telemetry", blob);
      }
    } catch {
      // Fire-and-forget
    }
  }

  return event;
}

/**
 * Lấy danh sách sự kiện ẩn danh đã ghi nhận tại máy khách (dành cho kiểm tra & audit)
 */
export function getLocalTelemetryEvents(): AnonymousEventPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Xóa dữ liệu telemetry trên máy khách
 */
export function clearLocalTelemetryEvents(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
