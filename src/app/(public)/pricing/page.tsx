"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  RefreshCw,
  Layers,
  ShieldCheck
} from "lucide-react";
import { useAppStore } from "@/core/store/useAppStore";
import { WORKSHOP_TERMS } from "@/core/constants/terms";

export default function PricingPage() {
  const { profile, updateProfile } = useAppStore();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [orderCode, setOrderCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const amount = selectedPlan === "monthly" ? 149_000 : 1_200_000;
  const qrUrl = orderCode
    ? `https://img.vietqr.io/image/MB-99990912345678-compact2.png?amount=${amount}&addInfo=${orderCode}&accountName=XUONG%20NOI%20THAT%20HOANG%20GIA`
    : "";

  const handleOpenQR = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    const newCode = `NTPRO_KH${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderCode(newCode);
    setPaymentSuccess(false);
    setShowQRModal(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Real-time polling
  useEffect(() => {
    if (!showQRModal || !orderCode || paymentSuccess) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/webhooks/payment?orderCode=${encodeURIComponent(orderCode)}`);
        const data = await res.json();
        if (isMounted && data.success && data.paid) {
          clearInterval(interval);
          handlePaymentComplete();
        }
      } catch (e) {
        console.warn("Polling error:", e);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showQRModal, orderCode, paymentSuccess]);

  const handlePaymentComplete = async () => {
    setPaymentSuccess(true);
    await updateProfile({
      subscriptionTier: "pro",
    });
    setTimeout(() => {
      setShowQRModal(false);
      setPaymentSuccess(false);
    }, 4000);
  };

  const handleSimulatePayment = async () => {
    try {
      const res = await fetch(`/api/webhooks/payment?orderCode=${encodeURIComponent(orderCode)}&simulate=true`);
      const data = await res.json();
      if (data.paid) {
        handlePaymentComplete();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tiers = [
    {
      id: "free",
      name: "Gói Trải Nghiệm (Free)",
      price: "0 đ",
      period: "/vĩnh viễn",
      desc: "Dành cho thợ thiết kế hoặc xưởng nhỏ muốn làm quen và kiểm tra độ chính xác thuật toán.",
      features: [
        "Bóc tách tối đa 3 dự án",
        "Quy đổi khổ ván tiêu chuẩn 1220x2440mm",
        "Tính mét dài chỉ dán cạnh tự động",
        "Bản in PDF có kèm nhãn nhỏ chân trang",
        "Dữ liệu lưu trên máy tính của bạn",
      ],
      cta: "Bắt đầu miễn phí",
      action: () => window.location.href = "/quoting",
      highlight: false,
    },
    {
      id: "monthly",
      name: "Gói Xưởng Pro (Tháng)",
      price: "149.000 đ",
      period: "/tháng",
      desc: "Dành cho xưởng thi công và freelance designer có công trình đều đặn hàng tháng.",
      features: [
        "Không giới hạn số lượng dự án",
        "Xóa bỏ hoàn toàn nhãn chân trang trên bản in PDF A4",
        "Tải Logo và thông tin xưởng riêng lên đầu báo giá",
        "Xuất file Excel đặt ván gửi đại lý vật tư",
        `${WORKSHOP_TERMS.snapshotPricing.labelWithOriginal} bảo toàn giá vốn hợp đồng`,
        "Hỗ trợ kỹ thuật qua Zalo 1-1",
      ],
      cta: "Quét mã VietQR Nâng cấp",
      action: () => handleOpenQR("monthly"),
      highlight: true,
    },
    {
      id: "yearly",
      name: "Gói Xưởng Pro (Năm)",
      price: "1.200.000 đ",
      period: "/năm",
      badge: "Tiết kiệm 33%",
      desc: "Giải pháp toàn diện và kinh tế nhất cho các xưởng mộc chuyên nghiệp.",
      features: [
        "Toàn bộ quyền lợi của gói Pro",
        "Tiết kiệm gần 600.000đ so với trả theo tháng",
        "Tặng kèm 1 Plugin AutoCAD Lisp bóc tách bản quyền",
        "Ưu tiên hỗ trợ cập nhật định mức vật tư mới",
        "Kích hoạt tự động ngay sau 5 giây qua VietQR",
      ],
      cta: "Quét mã VietQR Nâng cấp",
      action: () => handleOpenQR("yearly"),
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs group-hover:bg-amber-600 transition">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              NỘI THẤT <span className="text-amber-600">PRO</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Đăng nhập
            </Link>
            <Link
              href="/quoting"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition"
            >
              Bóc Tách Thử Ngay
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-center">
        
        {/* Title */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Bảng giá minh bạch - Kích hoạt tự động qua VietQR
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Đầu tư nhỏ, tiết kiệm hàng trăm giờ tính ván
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Chọn gói cước phù hợp với quy mô xưởng của bạn. Kích hoạt tức thì trong vòng 5 giây qua chuyển khoản mã QR ngân hàng.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`rounded-2xl p-7 flex flex-col justify-between transition-all relative bg-white ${
                t.highlight
                  ? "border-2 border-amber-500 shadow-md"
                  : "border border-slate-200/80 shadow-xs hover:border-slate-300"
              }`}
            >
              {t.badge && (
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                  {t.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                </div>

                <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
                  <span className="text-3xl font-black text-slate-900 font-mono">{t.price}</span>
                  <span className="text-xs text-slate-500 font-medium">{t.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  {t.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={t.action}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    t.highlight
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <span>{t.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Note VietQR */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 max-w-2xl mx-auto flex items-center gap-4 text-left shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5">Thanh toán tự động qua VietQR:</strong>
            Chỉ cần quét mã QR bằng ứng dụng ngân hàng bất kỳ. Hệ thống nhận Webhook tự động nâng cấp tài khoản của bạn ngay sau 5 giây.
          </div>
        </div>
      </main>

      {/* ================================================================== */}
      {/* MODAL QUÉT MÃ VIETQR TRỰC TIẾP TRÊN TRANG PRICING                  */}
      {/* ================================================================== */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center space-y-4 text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Thanh Toán VietQR - Nâng Cấp Pro
                </h3>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Thanh Toán Thành Công!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Tài khoản của bạn đã được kích hoạt thành công <strong className="text-amber-600">Gói Xưởng Pro</strong>.
                </p>
                <div className="pt-2">
                  <Link
                    href="/quoting"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition"
                  >
                    <span>Vào bóc tách dự án ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-xs text-slate-500 block">Số tiền thanh toán:</span>
                  <span className="text-2xl font-black text-amber-600 font-mono">
                    {amount.toLocaleString("vi-VN")} đ
                  </span>
                </div>

                <div className="w-56 h-56 mx-auto rounded-2xl border border-slate-200 p-2.5 bg-white shadow-inner flex items-center justify-center">
                  <img src={qrUrl} alt="Mã VietQR" className="w-full h-full object-contain" />
                </div>

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

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                  <span>Đang chờ chuyển khoản... Tự động mở khóa sau 5 giây</span>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Đóng
                  </button>

                  <button
                    onClick={handleSimulatePayment}
                    className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
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
