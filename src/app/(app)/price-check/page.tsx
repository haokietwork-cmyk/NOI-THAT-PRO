"use client";

import { useState } from "react";
import { CircleDollarSign, Sparkles, CheckCircle2, ShieldCheck, Mail, Phone, Building2, Send } from "lucide-react";

export default function PriceCheckPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Hà Nội");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl space-y-8 font-sans">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Tính Năng Thăm Dò & Dự Trữ
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CircleDollarSign className="w-7 h-7 text-amber-500" />
          <span>Thẩm Định & Kiểm Tra Báo Giá Nội Thất</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Đối chiếu đơn giá của bảng báo giá dự toán với dải giá vốn trung bình của thị trường để tránh rủi ro báo hớ hoặc báo dưới giá thành.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200/80 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
          <span className="text-lg">⏳</span>
          <p className="leading-relaxed">
            <strong>Tính năng đang trong giai đoạn khảo sát nhu cầu xưởng:</strong> Chúng tôi đang hoàn thiện thuật toán phân tích dải giá thị trường dựa trên 5.000+ công trình thực tế. Đăng ký nhận thông báo để được dùng thử miễn phí bản Beta đầu tiên.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Đăng ký thành công!</h3>
            <p className="text-xs text-slate-600">
              Cảm ơn bạn. Khi tính năng Thẩm định giá mở phiên bản Beta, đội ngũ sẽ gửi thông báo đến Zalo/Email <strong>{phone || email}</strong> của bạn.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Đăng ký dùng thử bản Thử nghiệm (Early Beta Access)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ và tên của bạn</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn Hoàng"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số điện thoại / Zalo</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="VD: 0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email nhận bản tin (Tùy chọn)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="contact@xưởng.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Khu vực xưởng sản xuất</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Hà Nội">Hà Nội & Miền Bắc</option>
                  <option value="TP.HCM">TP. Hồ Chí Minh & Bình Dương, Đồng Nai</option>
                  <option value="Đà Nẵng">Đà Nẵng & Miền Trung</option>
                  <option value="Khác">Khu vực khác</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi thông tin đăng ký dùng thử</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
