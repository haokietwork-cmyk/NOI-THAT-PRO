"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Save, CheckCircle2, Building2, Phone, MapPin, FileText, CreditCard, Shield } from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";

export default function SettingsPage() {
  const { profile, updateProfile } = useAppStore();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || "");
  const [quoteTerms, setQuoteTerms] = useState(profile.quoteTerms || "");
  const [bankName, setBankName] = useState(profile.bankName || "MB Bank");
  const [accountNumber, setAccountNumber] = useState(profile.accountNumber || "");
  const [accountName, setAccountName] = useState(profile.accountName || "");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      address,
      logoUrl,
      quoteTerms,
      bankName,
      accountNumber,
      accountName,
      costConfig: profile.costConfig,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Hồ Sơ Xưởng & Thương Hiệu</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Cài đặt thông tin in ấn lên Báo giá A4
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Các thông tin này sẽ được tự động xuất hiện tại phần tiêu đề (Header) của tờ Báo giá A4 gửi cho khách hàng.
        </p>
      </div>

      {/* Tabs chuyển đổi */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <Link
          href="/settings/profile"
          className="px-4 py-2 bg-amber-500 text-white rounded-xl shadow-xs"
        >
          1. Hồ sơ xưởng & In ấn A4
        </Link>
        <Link
          href="/settings/billing"
          className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
        >
          2. Gói cước & Thanh toán VietQR
        </Link>
        <Link
          href="/settings/data"
          className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
        >
          3. Dữ liệu & Quyền riêng tư
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Cài đặt */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tên xưởng sản xuất / Công ty nội thất
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: XƯỞNG NỘI THẤT HOÀNG GIA"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Số Hotline / Zalo báo giá
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0912 345 678"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Logo URL (Tùy chọn)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://domain.com/logo.png"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Địa chỉ xưởng sản xuất / Showroom
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: Cụm Công Nghiệp Chàng Sơn, Thạch Thất, Hà Nội"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Điều khoản & Cam kết in ở chân tờ Báo giá A4
              </label>
              <textarea
                rows={3}
                value={quoteTerms}
                onChange={(e) => setQuoteTerms(e.target.value)}
                placeholder="VD: Đơn giá đã bao gồm chi phí lắp đặt hoàn thiện. Bảo hành 24 tháng..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {savedSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã lưu thành công hồ sơ xưởng!</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Lưu trữ tự động vào trình duyệt và hệ thống.
                </span>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-sm shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông tin xưởng</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Header A4 */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Xem trước Header Báo giá A4</span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-4 text-xs">
            <div className="pb-4 border-b border-slate-200 space-y-1">
              <strong className="block font-black text-slate-900 text-sm uppercase tracking-tight">
                {name || "TÊN XƯỞNG SẢN XUẤT"}
              </strong>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Hotline:</span>
                <strong className="text-slate-800">{phone || "0912 ..."}</strong>
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {address || "Địa chỉ xưởng sản xuất..."}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Điều khoản in kèm:</span>
              <p className="italic">
                &ldquo;{quoteTerms || "Chưa thiết lập điều khoản báo giá..."}&rdquo;
              </p>
            </div>

            <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Khớp 100% khi bấm in tại /quoting</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
