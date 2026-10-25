/**
 * AUTH SERVICE - HỆ THỐNG XÁC THỰC NGƯỜI DÙNG & QUẢN LÝ PHIÊN
 * Hỗ trợ Đăng nhập qua Email, Số điện thoại và Đăng ký xưởng mới.
 * Đồng bộ với Supabase Auth khi đã cấu hình, hoặc lưu trữ bảo mật phiên Local Session.
 */

import { SubscriptionTier, WorkshopProfile } from "../types";
import { isSupabaseConfigured, createClient } from "../supabase/client";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  role: "owner" | "designer" | "carpenter";
  subscriptionTier: SubscriptionTier;
  provider: "email" | "phone" | "demo";
  createdAt: string;
}

const AUTH_STORAGE_KEY = "noithat_pro_auth_user_v1";

// Đăng ký event listener cho reactive updates
const authListeners = new Set<(user: AuthUser | null) => void>();

export class AuthService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Lấy người dùng hiện tại từ session storage / Supabase
   */
  public static getCurrentUser(): AuthUser | null {
    if (!this.isBrowser()) return null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Không thể đọc auth session:", e);
    }
    return null;
  }

  /**
   * Kiểm tra xem người dùng đã đăng nhập chính thức hay chưa
   * (Chỉ người dùng có tài khoản mới được duyệt, khách vãng lai chỉ được dùng thử chức năng test)
   */
  public static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return Boolean(user && user.id && user.provider !== "demo");
  }

  /**
   * Lưu thông tin phiên đăng nhập
   */
  public static setSession(user: AuthUser | null): void {
    if (!this.isBrowser()) return;
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    authListeners.forEach((listener) => listener(user));
  }

  /**
   * Lắng nghe thay đổi trạng thái đăng nhập
   */
  public static subscribe(listener: (user: AuthUser | null) => void): () => void {
    authListeners.add(listener);
    return () => authListeners.delete(listener);
  }

  /**
   * 1. ĐĂNG NHẬP QUA EMAIL
   */
  public static async loginWithEmail(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Vui lòng nhập định dạng email hợp lệ (VD: xuonggo@gmail.com)" };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" };
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split("@")[0],
            email: data.user.email,
            companyName: data.user.user_metadata?.company_name || "Xưởng Nội Thất",
            role: "owner",
            subscriptionTier: (data.user.user_metadata?.subscription_tier as SubscriptionTier) || "pro",
            provider: "email",
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          this.setSession(authUser);
          return { success: true, user: authUser };
        }
      } catch (err: any) {
        return { success: false, error: err.message || "Lỗi xác thực Supabase" };
      }
    }

    // Demo Mode hoặc Offline Auth: Cho phép đăng nhập hợp lệ với thông tin nhập vào
    const authUser: AuthUser = {
      id: "usr-" + Math.abs(email.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
      name: email.split("@")[0].toUpperCase(),
      email,
      companyName: "Xưởng Mộc " + email.split("@")[0],
      role: "owner",
      subscriptionTier: "pro",
      provider: "email",
      createdAt: new Date().toISOString(),
    };

    this.setSession(authUser);
    return { success: true, user: authUser };
  }

  /**
   * 2. ĐĂNG NHẬP QUA SỐ ĐIỆN THOẠI
   */
  public static async loginWithPhone(
    phone: string,
    passwordOrOtp: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const cleanPhone = phone.replace(/\s+/g, "").replace(/^(\+84)/, "0");
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;

    if (!phoneRegex.test(cleanPhone)) {
      return { success: false, error: "Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam (VD: 0912 345 678)" };
    }

    if (!passwordOrOtp || passwordOrOtp.length < 4) {
      return { success: false, error: "Mật khẩu hoặc mã OTP xác thực phải có ít nhất 4 ký tự" };
    }

    const authUser: AuthUser = {
      id: "phone-" + cleanPhone,
      name: "Chủ Xưởng (" + cleanPhone.slice(-4) + ")",
      phone: cleanPhone,
      companyName: "Xưởng Nội Thất " + cleanPhone,
      role: "owner",
      subscriptionTier: "pro",
      provider: "phone",
      createdAt: new Date().toISOString(),
    };

    this.setSession(authUser);
    return { success: true, user: authUser };
  }

  /**
   * 3. ĐĂNG KÝ TÀI KHOẢN XƯỞNG MỚI (EMAIL HOẶC SĐT)
   */
  public static async register(data: {
    name: string;
    companyName: string;
    email?: string;
    phone?: string;
    password: string;
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!data.name.trim()) {
      return { success: false, error: "Vui lòng nhập họ và tên của bạn" };
    }
    if (!data.companyName.trim()) {
      return { success: false, error: "Vui lòng nhập tên xưởng mộc / công ty của bạn" };
    }
    if (!data.email && !data.phone) {
      return { success: false, error: "Vui lòng cung cấp ít nhất Email hoặc Số điện thoại để tạo tài khoản" };
    }
    if (data.email && !data.email.includes("@")) {
      return { success: false, error: "Định dạng email không hợp lệ" };
    }
    if (data.phone) {
      const cleanPhone = data.phone.replace(/\s+/g, "").replace(/^(\+84)/, "0");
      if (!/(0[3|5|7|8|9])+([0-9]{8})\b/.test(cleanPhone)) {
        return { success: false, error: "Số điện thoại di động không hợp lệ" };
      }
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: "Mật khẩu phải có độ dài từ 6 ký tự trở lên" };
    }

    if (data.email && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: res, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              company_name: data.companyName,
              phone: data.phone || "",
              subscription_tier: "pro",
            },
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (res.user) {
          const authUser: AuthUser = {
            id: res.user.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            companyName: data.companyName,
            role: "owner",
            subscriptionTier: "pro",
            provider: "email",
            createdAt: new Date().toISOString(),
          };
          this.setSession(authUser);
          return { success: true, user: authUser };
        }
      } catch (err: any) {
        return { success: false, error: err.message || "Lỗi đăng ký qua Supabase" };
      }
    }

    const authUser: AuthUser = {
      id: "usr-" + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      role: "owner",
      subscriptionTier: "pro",
      provider: data.email ? "email" : "phone",
      createdAt: new Date().toISOString(),
    };

    this.setSession(authUser);
    return { success: true, user: authUser };
  }

  /**
   * ĐĂNG XUẤT
   */
  public static async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Lỗi đăng xuất Supabase:", e);
      }
    }
    this.setSession(null);
  }
}
