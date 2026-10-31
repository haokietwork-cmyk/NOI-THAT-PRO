import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, FileSpreadsheet, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Chính Sách Quyền Riêng Tư & Dữ Liệu Cá Nhân - AutoCutlist",
  description: "Chính sách bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP trên nền tảng AutoCutlist.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 bg-blueprint-grid text-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Bảo Vệ Dữ Liệu RLS
          </span>
        </div>

        {/* Legal Advisory Warning Banner */}
        <div className="p-4 mb-8 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-lg text-amber-900 text-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950 mb-1">
                Lưu ý quan trọng dành cho Doanh nghiệp & Luật sư:
              </p>
              <p className="leading-relaxed">
                Văn bản này là <strong>bản dự thảo chính sách quyền riêng tư</strong> đáp ứng các tiêu chuẩn kỹ thuật của Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân. Chủ sở hữu nền tảng phải rà soát cùng luật sư trước khi đưa vào áp dụng chính thức cho khách hàng thực tế.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm p-8 sm:p-12 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Chính Sách Quyền Riêng Tư &amp; Bảo Vệ Dữ Liệu Cá Nhân
            </h1>
            <p className="text-sm font-mono text-slate-500">
              Tuân thủ Nghị định 13/2023/NĐ-CP | Cập nhật: Tháng 10/2026
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">1</span>
              Dữ Liệu Cá Nhân Được Thu Thập
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Chúng tôi chỉ thu thập các dữ liệu thực sự cần thiết để thực hiện tính năng bóc tách kỹ thuật và xuất báo giá nội thất:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Nhóm Dữ Liệu</th>
                    <th className="p-3 border-b border-slate-200">Trường Cụ Thể</th>
                    <th className="p-3 border-b border-slate-200">Mục Đích Sử Dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-3 font-semibold">Tài khoản Xưởng</td>
                    <td className="p-3">Email, Tên xưởng, SĐT xưởng, Logo URL</td>
                    <td className="p-3 font-sans">Đăng nhập xác thực và in thông tin lên tiêu đề báo giá A4</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Khách Hàng của Xưởng</td>
                    <td className="p-3">Tên khách hàng, SĐT khách, Địa chỉ công trình</td>
                    <td className="p-3 font-sans">In vào phần &quot;Kính gửi khách hàng&quot; trên phiếu báo giá xuất PDF</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Kỹ Thuật &amp; Dự Toán</td>
                    <td className="p-3">Kích thước ván (Dài, Rộng, Dày), Mã vật tư, Đơn giá</td>
                    <td className="p-3 font-sans">Thuật toán tính số tấm ván, mét chỉ dán cạnh và giá vốn BOM</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Phân Tích Ẩn Danh (Funnel)</td>
                    <td className="p-3">Mã phiên ngẫu nhiên (Session ID), Mốc hành vi (Demo, Bóc tách, Xuất PDF, Chia sẻ link)</td>
                    <td className="p-3 font-sans">Đo lường phễu trải nghiệm sản phẩm. Tuyệt đối KHÔNG chứa tên khách, SĐT, địa chỉ, tên dự án hay giá vốn.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">2</span>
              Nguyên Tắc Xử Lý &amp; Bảo Mật Kỹ Thuật
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Nền tảng áp dụng các biện pháp bảo vệ theo tiêu chuẩn kỹ thuật cao cấp:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 pl-4 list-disc">
              <li>
                <strong>Cách ly dữ liệu đa người dùng (Multi-tenant RLS):</strong> Mọi bảng cơ sở dữ liệu đều kích hoạt Row Level Security. Người dùng xưởng A tuyệt đối không thể truy vấn hoặc xem dữ liệu của xưởng B.
              </li>
              <li>
                <strong>Không ghi log dữ liệu cá nhân (No PII Logging):</strong> Toàn bộ hệ thống máy chủ, nhật ký lỗi (Sentry/Console) và API guards đều tự động lọc bỏ các trường nhạy cảm (SĐT, tên khách, địa chỉ) trước khi ghi log.
              </li>
              <li>
                <strong>Phân tích sử dụng ẩn danh (Zero-PII Telemetry):</strong> Dữ liệu đo lường hành vi sản phẩm (phễu bóc tách, xuất file) được định danh bằng Session ID ngẫu nhiên, tự động làm sạch và không thể liên kết ngược về người dùng hay xưởng cụ thể.
              </li>
              <li>
                <strong>Mã hóa đường truyền (HTTPS/TLS):</strong> Toàn bộ kết nối giữa trình duyệt, plugin CAD và máy chủ đều được mã hóa bằng TLS 1.3 với chuẩn bảo mật HSTS.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">3</span>
              Quyền của Chủ Thể Dữ Liệu (Data Subject Rights)
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Theo Nghị định 13/2023/NĐ-CP, người dùng có các quyền sau đối với dữ liệu của mình:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Quyền xuất dữ liệu (Data Portability)
                </div>
                <p className="text-xs text-slate-600">
                  Người dùng có thể xuất toàn bộ danh mục vật tư và hồ sơ dự án ra định dạng Excel hoặc JSON bất kỳ lúc nào tại giao diện Cài đặt.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-red-600" />
                  Quyền xóa tài khoản (Right to Erasure)
                </div>
                <p className="text-xs text-slate-600">
                  Người dùng có thể yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dự án liên quan khỏi máy chủ (xóa theo cơ chế CASCADE không thể phục hồi).
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">4</span>
              Liên Hệ Bộ Phận Bảo Vệ Dữ Liệu
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Mọi thắc mắc hoặc yêu cầu thực hiện quyền bảo vệ dữ liệu cá nhân, quý khách vui lòng liên hệ trực tiếp Quản trị viên qua email: <code>privacy@webnoithatpro.vn</code>.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center text-xs text-slate-500 font-mono space-x-4">
          <Link href="/terms" className="hover:text-amber-600 underline">Điều Khoản Dịch Vụ</Link>
          <span>•</span>
          <Link href="/" className="hover:text-amber-600 underline">Trang Chủ AutoCutlist</Link>
        </div>
      </div>
    </div>
  );
}
