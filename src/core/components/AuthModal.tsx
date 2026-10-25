"use client";

import { useState } from "react";
import { Mail, Phone, Lock, Building2, User, ArrowRight, X, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../store/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
  defaultTab?: "email" | "phone" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Đăng nhập tài khoản Xưởng",
  description = "Tính năng dùng thử chỉ áp dụng cho bộ dữ liệu mẫu 48 tấm. Vui lòng đăng nhập qua Email hoặc Số điện thoại để mở khóa toàn bộ quyền lưu trữ dự án và thư viện đơn giá xưởng.",
  defaultTab = "phone",
}: AuthModalProps) {
  const { loginWithEmail, loginWithPhone, register } = useAuth();

  const [activeTab, setActiveTab] = useState<"email" | "phone" | "register">(defaultTab);

  // Email login form
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  // Phone login form
  const [phone, setPhone] = useState("");
  const [phonePassword, setPhonePassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regContactType, setRegContactType] = useState<"phone" | "email">("phone");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await loginWithEmail(email, emailPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Đăng nhập bằng Email thành công!");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } else {
      setErrorMsg(res.error || "Đăng nhập thất bại");
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await loginWithPhone(phone, phonePassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Đăng nhập bằng Số điện thoại thành công!");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } else {
      setErrorMsg(res.error || "Đăng nhập thất bại");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await register({
      name: regName,
      companyName: regCompany,
      email: regContactType === "email" ? regEmail : undefined,
      phone: regContactType === "phone" ? regPhone : undefined,
      password: regPassword,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Tạo tài khoản xưởng thành công!");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    } else {
      setErrorMsg(res.error || "Đăng ký thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header modal */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        </div>

        {/* 3 Tabs điều hướng */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl my-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("phone");
              setErrorMsg("");
            }}
            className={`py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "phone"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>Số điện thoại</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("email");
              setErrorMsg("");
            }}
            className={`py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "email"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrorMsg("");
            }}
            className={`py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "register"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Đăng ký mới</span>
          </button>
        </div>

        {/* Thông báo lỗi / thành công */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. TAB ĐĂNG NHẬP QUA SỐ ĐIỆN THOẠI */}
        {activeTab === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại chủ xưởng
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Đăng nhập nhanh cho xưởng mộc & thợ thi công</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu hoặc Mã xác thực
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={phonePassword}
                  onChange={(e) => setPhonePassword(e.target.value)}
                  placeholder="Nhập mật khẩu (tối thiểu 4 ký tự)"
                  className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Đang xác thực..." : "Đăng nhập bằng Số điện thoại"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. TAB ĐĂNG NHẬP QUA EMAIL */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="xuonggo@example.com"
                  className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Đang xác thực..." : "Đăng nhập bằng Email"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. TAB ĐĂNG KÝ XƯỞNG MỚI */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên chủ xưởng / Kỹ sư thiết kế
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Anh Hưng / KTS Tuấn"
                  className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên xưởng mộc / Thương hiệu nội thất
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="Xưởng Nội Thất Hưng Thịnh"
                  className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-4 text-xs font-semibold text-slate-700 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="contactType"
                  checked={regContactType === "phone"}
                  onChange={() => setRegContactType("phone")}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Đăng ký bằng SĐT</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="contactType"
                  checked={regContactType === "email"}
                  onChange={() => setRegContactType("email")}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Đăng ký bằng Email</span>
              </label>
            </div>

            {regContactType === "phone" ? (
              <div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="xuonggo@example.com"
                    className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu khởi tạo
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký xưởng"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Chân modal bảo đảm bảo mật */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Bí mật kinh doanh xưởng được bảo vệ
          </span>
          <span>Bảo mật RLS Supabase</span>
        </div>
      </div>
    </div>
  );
}
