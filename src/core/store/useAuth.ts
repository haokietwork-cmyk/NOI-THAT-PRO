"use client";

import { useState, useEffect } from "react";
import { AuthService, AuthUser } from "../services/authService";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    // Khởi tạo state an toàn sau khi component mount trên client
    setUser(AuthService.getCurrentUser());
    setLoading(false);
    setMounted(true);

    // Lắng nghe các thay đổi đăng nhập / đăng xuất
    const unsubscribe = AuthService.subscribe((updatedUser) => {
      setUser(updatedUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isAuthenticated = Boolean(mounted && user && user.id && user.provider !== "demo");

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    const res = await AuthService.loginWithEmail(email, pass);
    setLoading(false);
    return res;
  };

  const loginWithPhone = async (phone: string, passOrOtp: string) => {
    setLoading(true);
    const res = await AuthService.loginWithPhone(phone, passOrOtp);
    setLoading(false);
    return res;
  };

  const register = async (data: {
    name: string;
    companyName: string;
    email?: string;
    phone?: string;
    password: string;
  }) => {
    setLoading(true);
    const res = await AuthService.register(data);
    setLoading(false);
    return res;
  };

  const logout = async () => {
    setLoading(true);
    await AuthService.logout();
    setUser(null);
    setLoading(false);
  };

  return {
    user,
    isAuthenticated,
    loading,
    loginWithEmail,
    loginWithPhone,
    register,
    logout,
  };
}
