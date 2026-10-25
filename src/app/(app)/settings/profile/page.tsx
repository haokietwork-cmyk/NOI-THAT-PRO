"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Phone, 
  MapPin, 
  Image as ImageIcon, 
  FileText, 
  CreditCard, 
  Save, 
  CheckCircle2, 
  ArrowLeft,
  Printer,
  Sparkles,
  QrCode
} from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";

export default function WorkshopProfileSettingsPage() {
  const { profile, updateProfile } = useAppStore();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || "");
  const [quoteTerms, setQuoteTerms] = useState(profile.quoteTerms || "");
  const [bankName, setBankName] = useState(profile.bankName || "MB Bank");
  const [accountNumber, setAccountNumber] = useState(profile.accountNumber || "99990912345678");
  const [accountName, setAccountName] = useState(profile.accountName || "XUONG NOI THAT HOANG GIA");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      logoUrl: logoUrl.trim(),
      quoteTerms: quoteTerms.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim().toUpperCase(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 font-sans max-w-6xl pb-16">
      
      {/* Top navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <Link href="/settings" className="hover:underline flex items-center gap-1">
              <span>Cài đặt</span>
            </Link>
            <span>/</span>
            <span>Hồ sơ xưởng & In ấn A4</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cài đặt Hồ sơ Xưởng & Tiêu đề Báo giá
          </h1>
          <p className="text-xs text-slate-500">
            Thông tin xưởng sẽ tự động hiển thị trên Tiêu đề (Header) và Chân trang (Footer) của bản in Báo giá A4 gửi khách.
          </p>
        </div>

        <Link
          href="/quoting"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-amber-600" />
          <span>Xem trang Báo giá (/quoting)</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================================================================ */}
        {/* CỘT TRÁI: FORM CÀI ĐẶT HỒ SƠ XƯỞNG                               */}
        {/* ================================================================ */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            
            {/* Tên xưởng */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tên xưởng sản xuất / Doanh nghiệp nội thất <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: XƯỞNG NỘI THẤT HOÀNG GIA"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Hotline & Logo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Số Hotline / Zalo báo giá <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0912 345 678"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Link Logo xưởng (URL ảnh PNG/JPG)
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://domain.com/logo.png"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ xưởng */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Địa chỉ xưởng sản xuất / Văn phòng thiết kế <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: Cụm Công Nghiệp Chàng Sơn, Thạch Thất, Hà Nội"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Thông tin tài khoản ngân hàng */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-900 text-xs block flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Thông tin tài khoản nhận đặt cọc (in lên Báo giá A4)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngân hàng:</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="MB Bank, Techcombank..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Số tài khoản:</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="99990912345678"
                    className="w-full p-2 font-mono font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tên chủ tài khoản:</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                    placeholder="NGUYEN VAN A"
                    className="w-full p-2 uppercase font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Điều khoản mặc định */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Điều khoản báo giá & Cam kết bảo hành mặc định
              </label>
              <textarea
                rows={3}
                value={quoteTerms}
                onChange={(e) => setQuoteTerms(e.target.value)}
                placeholder="VD: Đơn giá đã bao gồm chi phí vận chuyển & lắp đặt hoàn thiện tại công trình trong phạm vi 30km. Bảo hành 24 tháng..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 leading-relaxed"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {savedSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã lưu thành công vào hệ thống!</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Dữ liệu được tự động đồng bộ lên Supabase Cloud.
                </span>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-sm shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông tin xưởng</span>
              </button>
            </div>
          </form>
        </div>

        {/* ================================================================ */}
        {/* CỘT PHẢI: KHUNG XEM TRƯỚC TIÊU ĐỀ BÁO GIÁ A4 (LIVE PREVIEW)      */}
        {/* ================================================================ */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Xem trước Header Báo giá A4</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Cập nhật tức thì
            </span>
          </div>

          {/* Mô phỏng tờ giấy A4 Header */}
          <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-5 text-xs">
            
            {/* Header thương hiệu */}
            <div className="flex justify-between items-start pb-5 border-b-2 border-slate-900">
              <div className="space-y-1 max-w-[240px]">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 object-contain mb-1" />
                ) : (
                  <div className="inline-flex items-center gap-1 text-amber-600 font-black text-xs uppercase tracking-wider mb-1">
                    <span>⚡ NỘI THẤT PRO</span>
                  </div>
                )}
                <strong className="block font-black text-slate-900 text-sm uppercase leading-tight">
                  {name || "XƯỞNG NỘI THẤT HOÀNG GIA"}
                </strong>
                <p className="text-[11px] text-slate-600">
                  Hotline / Zalo: <strong className="text-slate-900">{phone || "0912 345 678"}</strong>
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Địa chỉ: {address || "Cụm Công Nghiệp Chàng Sơn, Thạch Thất, Hà Nội"}
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded bg-slate-900 text-white tracking-widest uppercase">
                  BÁO GIÁ THI CÔNG
                </span>
                <p className="text-[10px] text-slate-400 font-mono">
                  Ngày: {new Date().toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Thông tin thanh toán ngân hàng */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
              <span className="font-bold text-slate-800 block text-[10px] uppercase">
                Thông tin thanh toán & Đặt cọc:
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngân hàng:</span>
                <strong className="text-slate-900">{bankName || "MB Bank"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tài khoản:</span>
                <strong className="text-slate-900 font-mono">{accountNumber || "99990912345678"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <strong className="text-slate-900 uppercase">{accountName || "XUONG NOI THAT HOANG GIA"}</strong>
              </div>
            </div>

            {/* Điều khoản in kèm */}
            <div className="p-3 bg-amber-50/50 rounded-xl border border-dashed border-amber-200 text-[11px] space-y-1 text-amber-900">
              <span className="font-bold text-amber-950 block text-[10px] uppercase">
                Điều khoản & Bảo hành in kèm:
              </span>
              <p className="italic leading-relaxed">
                &ldquo;{quoteTerms || "Đơn giá đã bao gồm chi phí vận chuyển & lắp đặt hoàn thiện tại công trình. Bảo hành gỗ công nghiệp và phụ kiện chính hãng 24 tháng."}&rdquo;
              </p>
            </div>

            <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Khớp 100% với Header hiển thị khi xuất bản in PDF tại /quoting</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
