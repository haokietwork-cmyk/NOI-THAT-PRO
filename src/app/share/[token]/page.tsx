import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, Copy, CheckCircle2, Building2, Phone, MapPin, CreditCard, ShieldAlert } from "lucide-react";
import { createServerSupabaseClient } from "@/core/supabase/server";
import { hashShareToken, assertPayloadSanitized, type CustomerSharedQuotePayload } from "@/core/security/quote-share";
import ShareQuotePrintButton from "./ShareQuotePrintButton";

export const metadata: Metadata = {
  title: "Báo Giá Thi Công Nội Thất A4",
  description: "Bản báo giá thi công nội thất chuẩn xưởng sản xuất",
  robots: {
    index: false,
    follow: false,
  },
};

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function ShareQuotePage({ params }: SharePageProps) {
  const { token } = await params;

  // 1. Kiểm tra định dạng token (64 hex characters)
  if (!token || !/^[0-9a-fA-F]{64}$/.test(token)) {
    return <InvalidShareQuoteView message="Liên kết báo giá không hợp lệ hoặc không tồn tại." />;
  }

  // 2. Tra cứu dữ liệu báo giá đã che từ hàm bảo mật get_shared_quote
  const tokenHash = hashShareToken(token);
  const supabase = await createServerSupabaseClient();

  const { data: quotePayload, error } = await supabase.rpc("get_shared_quote", {
    p_token_hash: tokenHash,
  });

  if (error || !quotePayload) {
    return (
      <InvalidShareQuoteView message="Liên kết báo giá không tồn tại, đã hết hạn hoặc đã được chủ xưởng thu hồi." />
    );
  }

  // 3. Khẳng định dữ liệu đã che sạch ở server trước khi render
  try {
    assertPayloadSanitized(quotePayload);
  } catch (err) {
    return <InvalidShareQuoteView message="Dữ liệu báo giá không hợp lệ. Vui lòng liên hệ trực tiếp với xưởng." />;
  }

  const quote = quotePayload as CustomerSharedQuotePayload;
  const formatVND = (val: number) => (val || 0).toLocaleString("vi-VN") + " đ";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-6 px-3 sm:px-6">
      {/* ================================================================ */}
      {/* THANH THAO TÁC TRÊN CÙNG DÀNH CHO KHÁCH & XƯỞNG (no-print)        */}
      {/* ================================================================ */}
      <header className="no-print max-w-4xl mx-auto mb-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
            A4
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Bản Báo Giá Trực Tuyến</h1>
            <p className="text-xs text-slate-500">
              Phát hành bởi: <strong>{quote.workshop.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ShareQuotePrintButton />
        </div>
      </header>

      {/* ================================================================ */}
      {/* KHUNG TỜ GIẤY BÁO GIÁ A4 CHUẨN IN (.print-area)                   */}
      {/* ================================================================ */}
      <main className="print-area bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 shadow-md space-y-6 text-xs max-w-4xl mx-auto">
        {/* Header Tờ Báo Giá A4 */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {quote.workshop.name}
            </h2>
            {quote.workshop.phone && (
              <p className="text-slate-600 text-xs flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Hotline / Zalo: <strong className="text-slate-900">{quote.workshop.phone}</strong>
              </p>
            )}
            {quote.workshop.address && (
              <p className="text-slate-500 text-[11px] leading-relaxed flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Địa chỉ: {quote.workshop.address}</span>
              </p>
            )}
            {quote.workshop.bankInfo && (
              <p className="text-slate-600 text-[11px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Tài khoản: <strong className="text-slate-800">{quote.workshop.bankInfo.accountNumber}</strong> ({quote.workshop.bankInfo.bankName} - {quote.workshop.bankInfo.accountName})
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-16 h-16 rounded-full border-2 border-emerald-600 border-dashed flex-col items-center justify-center text-center p-1 text-[7px] font-black text-emerald-800 rotate-[-8deg] shadow-xs bg-emerald-50/50">
              <span className="uppercase tracking-tight leading-tight">ĐÃ KIỂM DUYỆT</span>
              <span className="text-emerald-700 font-mono text-[8px] font-extrabold">ISO GỖ CNC</span>
              <span className="text-[6px] text-emerald-500">2026-PASS</span>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block text-xs font-black px-3.5 py-1 rounded-md bg-slate-900 text-white tracking-widest uppercase">
                BÁO GIÁ THI CÔNG
              </span>
              <p className="text-[11px] text-slate-500 font-mono">
                Số HĐ: <strong className="text-slate-800">{quote.contractNumber}</strong>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Ngày lập: {quote.createdAtDateVi}
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin dự án & Khách hàng */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold">CÔNG TRÌNH / DỰ ÁN:</span>
            <strong className="text-slate-900 text-sm font-bold">{quote.projectName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold">KHÁCH HÀNG:</span>
            <strong className="text-slate-900 text-sm font-bold">
              {quote.clientName} {quote.clientPhone ? `(${quote.clientPhone})` : ""}
            </strong>
          </div>
        </div>

        {/* Bảng hạng mục báo giá gom theo Module */}
        <div className="space-y-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
              <tr>
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Hạng Mục Thành Phẩm</th>
                <th className="p-3">Quy Cách & Chi Tiết Cấu Thành</th>
                <th className="p-3 text-right">Số Tấm</th>
                <th className="p-3 text-right">Thành Tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {quote.modules.map((m) => (
                <tr key={m.stt}>
                  <td className="p-3 text-center text-slate-400 font-mono">{m.stt}</td>
                  <td className="p-3 font-bold text-slate-900">{m.moduleName}</td>
                  <td className="p-3 text-slate-600 text-[11px]">{m.description}</td>
                  <td className="p-3 text-right font-mono text-slate-500">{m.partCount}</td>
                  <td className="p-3 text-right font-mono font-black text-slate-900 text-sm">
                    {formatVND(m.quotePrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tổng cộng thanh toán */}
        <div className="pt-4 border-t-2 border-slate-800 flex justify-between items-center text-xs">
          <div>
            <span className="font-black text-slate-900 text-sm block">TỔNG CỘNG THANH TOÁN:</span>
            <span className="text-slate-500 text-[11px]">Đã bao gồm chi phí gia công, vận chuyển và lắp đặt hoàn thiện.</span>
          </div>
          <span className="text-2xl font-black text-amber-600 font-mono">
            {formatVND(quote.totalQuotePrice)}
          </span>
        </div>

        {/* Điều khoản & Cam kết của xưởng */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between">
            <strong className="text-slate-900 font-bold uppercase text-[10px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ĐIỀU KHOẢN & TIÊU CHUẨN KỸ THUẬT BẢO HÀNH:
            </strong>
            <span className="font-mono text-[10px] text-slate-400">TIÊU CHUẨN XƯỞNG CNC</span>
          </div>
          <ul className="space-y-1 list-disc list-inside text-slate-600 text-[10px] leading-relaxed">
            {quote.terms.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Ghi chú miễn trừ pháp lý theo Hiến Pháp GEMINI.md 5.4 */}
        <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 italic">
          {quote.legalDisclaimer}
        </div>

        {/* Chữ ký 2 bên */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs">
          <div>
            <strong className="block text-slate-900 font-bold uppercase">ĐẠI DIỆN KHÁCH HÀNG</strong>
            <span className="text-slate-400 text-[10px]">(Ký & ghi rõ họ tên)</span>
          </div>
          <div>
            <strong className="block text-slate-900 font-bold uppercase">ĐẠI DIỆN XƯỞNG SẢN XUẤT</strong>
            <span className="text-slate-400 text-[10px]">(Ký & đóng dấu)</span>
          </div>
        </div>
      </main>

      {/* Footer bản quyền no-print */}
      <footer className="no-print max-w-4xl mx-auto mt-8 text-center text-xs text-slate-400 space-y-1">
        <p>Báo giá được tạo tự động bởi nền tảng quản lý xưởng nội thất.</p>
        <Link href="/" className="text-slate-500 hover:text-amber-600 font-semibold underline">
          Về trang chủ AutoCutlist
        </Link>
      </footer>
    </div>
  );
}

function InvalidShareQuoteView({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-base font-bold text-slate-900">Không Thể Mở Báo Giá</h1>
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Về Trang Chủ AutoCutlist
          </Link>
        </div>
      </div>
    </div>
  );
}
