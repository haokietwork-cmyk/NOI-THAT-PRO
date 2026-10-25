"use client";

import { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";
import { WORKSHOP_TERMS } from "@/core/constants/terms";

export default function BillingSettingsPage() {
  const { profile, updateProfile } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  const isPro = profile.subscriptionTier === "pro";
  const amount = selectedPlan === "monthly" ? 149_000 : 1_200_000;

  // Tạo mã đơn hàng mới mỗi khi mở modal
  const openPaymentModal = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    const newCode = `NTPRO_KH${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderCode(newCode);
    setPaymentSuccess(false);
    setShowQR(true);
  };

  // URL VietQR Napas chuẩn MB Bank
  const qrUrl = orderCode
    ? `https://img.vietqr.io/image/MB-99990912345678-compact2.png?amount=${amount}&addInfo=${orderCode}&accountName=XUONG%20NOI%20THAT%20HOANG%20GIA`
    : "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================================================
  // REAL-TIME POLLING: Tự động kiểm tra tín hiệu Webhook sau mỗi 3 giây
  // ==========================================================================
  useEffect(() => {
    if (!showQR || !orderCode || paymentSuccess) return;

    let isMounted = true;
    setIsCheckingPayment(true);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/webhooks/payment?orderCode=${encodeURIComponent(orderCode)}`);
        const data = await res.json();

        if (isMounted && data.success && data.paid) {
          // Webhook đã xác nhận thanh toán thành công
          clearInterval(interval);
          handlePaymentComplete();
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showQR, orderCode, paymentSuccess]);

  // Kích hoạt thành công
  const handlePaymentComplete = async () => {
    setPaymentSuccess(true);
    setIsCheckingPayment(false);
    // Cập nhật lên store và Supabase profiles
    await updateProfile({
      subscriptionTier: "pro",
    });
    setTimeout(() => {
      setShowQR(false);
      setPaymentSuccess(false);
    }, 4000);
  };

  // Giả lập Webhook đã nhận tiền (Dành cho Dev & Demo Mode)
  const handleSimulatePayment = async () => {
    try {
      const res = await fetch(`/api/webhooks/payment?orderCode=${encodeURIComponent(orderCode)}&simulate=true`);
      const data = await res.json();
      if (data.paid) {
        handlePaymentComplete();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <Zap className="w-3.5 h-3.5" />
          <span>Gói Cước & Thanh Toán Tự Động</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Quản Lý Gói Cước Xưởng Pro (VietQR)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Nâng cấp lên gói Xưởng Pro để mở khóa không giới hạn dự án, xóa nhãn chân trang trên bản in PDF A4 và kích hoạt {WORKSHOP_TERMS.snapshotPricing.labelWithOriginal}.
        </p>
      </div>

      {/* Trạng thái hiện tại của tài khoản */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Gói cước hiện tại của xưởng:
          </span>
          <div className="flex items-center gap-2.5 mt-1.5">
            <span className="text-xl font-black text-slate-900">
              {isPro ? "Gói Xưởng Pro (Không giới hạn)" : "Gói Trải Nghiệm (Free)"}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isPro
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {isPro ? "⚡ Đang Hoạt Động" : "Miễn Phí"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isPro
              ? "Thời hạn sử dụng: Đến 18/10/2027 (Kích hoạt tự động qua VietQR)"
              : "Bản quyền miễn phí: Giới hạn lưu trữ dự án và có nhãn chân trang."}
          </p>
        </div>

        {!isPro ? (
          <button
            onClick={() => openPaymentModal("monthly")}
            className="px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm shadow-amber-500/20 transition flex items-center gap-1.5 shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>Nâng Cấp Gói Pro Ngay</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tài khoản cao cấp đã kích hoạt</span>
          </div>
        )}
      </div>

      {/* Lựa chọn gói nâng cấp */}
      {!isPro && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gói Tháng */}
          <div
            onClick={() => openPaymentModal("monthly")}
            className={`p-6 rounded-2xl border-2 transition cursor-pointer relative bg-white hover:border-amber-400 shadow-xs ${
              selectedPlan === "monthly" && showQR
                ? "border-amber-500 bg-amber-50/20"
                : "border-slate-200"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-slate-900">Gói Tháng Linh Hoạt</span>
              <span className="font-mono font-black text-amber-600 text-lg">149.000 đ</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Phù hợp với xưởng gia công thi công theo từng đợt công trình.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Không giới hạn số lượng dự án bóc tách</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xóa bỏ hoàn toàn nhãn chân trang PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất file Excel đặt ván gửi đại lý</span>
              </li>
            </ul>
          </div>

          {/* Gói Năm */}
          <div
            onClick={() => openPaymentModal("yearly")}
            className={`p-6 rounded-2xl border-2 transition cursor-pointer relative bg-white hover:border-amber-400 shadow-xs ${
              selectedPlan === "yearly" && showQR
                ? "border-amber-500 bg-amber-50/20"
                : "border-slate-200"
            }`}
          >
            <span className="absolute -top-3 right-4 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
              Tiết kiệm 33%
            </span>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-slate-900">Gói 1 Năm (Tiết Kiệm)</span>
              <span className="font-mono font-black text-amber-600 text-lg">1.200.000 đ</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Giải pháp toàn diện nhất cho xưởng mộc vận hành lâu dài.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Toàn bộ đặc quyền của gói Xưởng Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tặng kèm 1 Plugin AutoCAD Lisp bản quyền</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ưu tiên hỗ trợ cập nhật định mức vật tư</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL QUÉT MÃ VIETQR VỚI TÍNH NĂNG REALTIME POLLING                */}
      {/* ================================================================== */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center space-y-4 text-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Thanh Toán VietQR Tự Động
                </h3>
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Trạng thái Thanh toán Thành công */}
            {paymentSuccess ? (
              <div className="py-8 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Thanh Toán Thành Công!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Hệ thống đã nhận được tiền và tự động nâng cấp tài khoản của bạn lên <strong className="text-amber-600">Gói Xưởng Pro</strong>.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-xs text-slate-500 block">Số tiền thanh toán:</span>
                  <span className="text-2xl font-black text-amber-600 font-mono">
                    {amount.toLocaleString("vi-VN")} đ
                  </span>
                </div>

                {/* Khung mã VietQR */}
                <div className="w-56 h-56 mx-auto rounded-2xl border border-slate-200 p-2.5 bg-white shadow-inner flex items-center justify-center">
                  <img src={qrUrl} alt="Mã VietQR" className="w-full h-full object-contain" />
                </div>

                {/* Thông tin chuyển khoản */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <strong className="text-slate-900">MB Bank (Quân Đội)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <strong className="text-slate-900 font-mono font-bold">99990912345678</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chủ tài khoản:</span>
                    <strong className="text-slate-900 uppercase">XUONG NOI THAT HOANG GIA</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-400 font-semibold">Nội dung CK:</span>
                    <div className="flex items-center gap-1">
                      <strong className="font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-xs">
                        {orderCode}
                      </strong>
                      <button
                        onClick={handleCopyCode}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        title="Sao chép"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trạng thái lắng nghe Polling */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                  <span>Đang chờ chuyển khoản... Tự động mở khóa sau 5 giây</span>
                </div>

                {/* Nút hành động */}
                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <button
                    onClick={() => setShowQR(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Đóng
                  </button>

                  <button
                    onClick={handleSimulatePayment}
                    className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                    title="Bấm để kích hoạt thanh toán ngay trong Demo Mode"
                  >
                    Tôi đã chuyển khoản xong
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
