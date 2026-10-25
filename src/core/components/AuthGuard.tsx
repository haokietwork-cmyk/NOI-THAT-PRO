"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, Phone, ArrowRight, ShieldCheck, Sparkles, FileSpreadsheet } from "lucide-react";
import { useAuth } from "../store/useAuth";
import AuthModal from "./AuthModal";

interface AuthGuardProps {
  children: React.ReactNode;
  featureName?: string;
}

export default function AuthGuard({ children, featureName = "tính năng này" }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Tránh flash nội dung khi đang kiểm tra session
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500">Đang kiểm tra quyền truy cập xưởng...</p>
      </div>
    );
  }

  // Nếu đã đăng nhập, cho phép hiển thị nội dung trang bình thường
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Nếu CHƯA đăng nhập, hiển thị màn hình bảo vệ Auth Gate
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 font-sans">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-sm text-center relative overflow-hidden">
        {/* Biểu tượng ổ khóa */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Chỉ cho phép dùng thử ở chức năng Test bóc tách</span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Yêu cầu Đăng nhập để truy cập {featureName}
        </h2>

        <p className="text-sm text-slate-600 mt-2.5 leading-relaxed max-w-lg mx-auto">
          Theo quy chế bảo mật bí mật kinh doanh (Supabase RLS), các dữ liệu quản trị như Thư viện đơn giá xưởng, Hồ sơ dự án và Cài đặt bản in A4 bắt buộc phải gắn liền với tài khoản xưởng mộc của bạn.
        </p>

        {/* Khối phân biệt Chức năng Dùng thử và Chức năng Đăng nhập */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 text-left">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Chức năng Dùng thử (Miễn phí)
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Bạn có thể trải nghiệm kiểm thử động cơ bóc tách với bộ dữ liệu mẫu 48 tấm (Căn hộ 2PN) hoàn toàn tự do mà không cần đăng nhập.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Yêu cầu Đăng nhập
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tải lên file Excel riêng, quản lý bảng đơn giá vật tư xưởng, in báo giá A4 có Logo xưởng và lưu trữ dự án lâu dài.
            </p>
          </div>
        </div>

        {/* 2 Nút hành động */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Đăng nhập qua Email / Số điện thoại</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/quoting?demo=true"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>Vào chức năng Test bóc tách mẫu →</span>
          </Link>
        </div>

        {/* Footer bảo đảm */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Hệ thống bảo vệ dữ liệu bí mật kinh doanh theo xưởng mộc</span>
        </div>
      </div>

      {/* Auth Modal pop-up */}
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Đăng nhập để tiếp tục"
        description={`Đăng nhập qua Email hoặc Số điện thoại để mở khóa toàn bộ ${featureName}.`}
      />
    </div>
  );
}
