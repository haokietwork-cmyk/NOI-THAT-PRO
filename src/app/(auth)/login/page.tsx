"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Phone, ArrowRight, ShieldCheck, Building2, User, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/core/store/useAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { loginWithEmail, loginWithPhone, register, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<"phone" | "email" | "register">("phone");

  // Phone form
  const [phone, setPhone] = useState("");
  const [phonePassword, setPhonePassword] = useState("");

  // Email form
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regContactType, setRegContactType] = useState<"phone" | "email">("phone");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập số điện thoại
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await loginWithPhone(phone, phonePassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Đăng nhập thành công!");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
    } else {
      setErrorMsg(res.error || "Đăng nhập thất bại");
    }
  };

  // Xử lý đăng nhập email
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const res = await loginWithEmail(email, emailPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Đăng nhập thành công!");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
    } else {
      setErrorMsg(res.error || "Đăng nhập thất bại");
    }
  };

  // Xử lý đăng ký mới
  const handleRegister = async (e: React.FormEvent) => {
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
      setSuccessMsg("Đăng ký tài khoản xưởng thành công!");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    } else {
      setErrorMsg(res.error || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 mx-auto flex items-center justify-center text-white shadow-sm shadow-amber-500/25">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M3 3v18h18" />
              <path d="M7 17V7h10" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Cổng Đăng Nhập NỘI THẤT PRO
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Hệ thống bảo vệ dữ liệu bí mật kinh doanh theo từng xưởng mộc. Vui lòng đăng nhập qua Số điện thoại hoặc Email.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Banner thông báo quy tắc dùng thử */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Lưu ý:</strong> Chế độ dùng thử không cần tài khoản <em>chỉ áp dụng duy nhất tại chức năng Test bóc tách</em> (bộ dữ liệu mẫu 48 tấm). Mọi chức năng quản lý xưởng đều yêu cầu đăng nhập.
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 py-7 px-6 shadow-sm rounded-3xl sm:px-8">
          {/* 3 Tabs lựa chọn */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("phone");
                setErrorMsg("");
              }}
              className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "phone"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>Số ĐT</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("email");
                setErrorMsg("");
              }}
              className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Đăng ký</span>
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

          {/* 1. FORM SỐ ĐIỆN THOẠI */}
          {activeTab === "phone" && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
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
                <p className="text-[10px] text-slate-400 mt-1">Đăng nhập nhanh cho xưởng mộc & thợ lắp đặt</p>
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
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xác thực..." : "Đăng nhập bằng Số điện thoại"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. FORM EMAIL */}
          {activeTab === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email đăng nhập
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
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xác thực..." : "Đăng nhập bằng Email"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. FORM ĐĂNG KÝ */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ tên chủ xưởng / Kỹ sư
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Anh Hoàng / KTS Tuấn"
                    className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên xưởng mộc / Thương hiệu
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="Nội Thất Gỗ Việt"
                    className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 text-xs font-semibold text-slate-700 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="loginContactType"
                    checked={regContactType === "phone"}
                    onChange={() => setRegContactType("phone")}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Đăng ký bằng SĐT</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="loginContactType"
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
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký xưởng"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Đường dẫn phụ chỉ vào chức năng Dùng thử */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs space-y-2">
            <p className="text-slate-500">Chưa muốn đăng ký và chỉ muốn trải nghiệm tính năng?</p>
            <Link
              href="/quoting?demo=true"
              className="inline-flex items-center gap-1.5 text-amber-700 font-bold hover:underline"
            >
              <span>👉 Dùng thử ngay với dữ liệu mẫu 48 tấm (Không cần tài khoản)</span>
            </Link>
          </div>
        </div>

        {/* Chân trang bảo chứng */}
        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bảo mật cấp hàng Supabase Row Level Security (RLS)</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Đang tải cổng đăng nhập...</div>}>
      <LoginForm />
    </Suspense>
  );
}
