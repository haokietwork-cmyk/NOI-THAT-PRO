import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Scale, CheckCircle2, FileText } from "lucide-react";

export const metadata = {
  title: "Điều Khoản Sử Dụng Dịch Vụ - AutoCutlist",
  description: "Điều khoản sử dụng nền tảng AutoCutlist dành cho xưởng nội thất và kỹ sư dự toán.",
};

export default function TermsPage() {
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Scale className="w-3.5 h-3.5" />
            Bản Dự Thảo Tham Khảo
          </span>
        </div>

        {/* Legal Advisory Warning Banner */}
        <div className="p-4 mb-8 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-lg text-amber-900 text-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950 mb-1">
                Lưu ý quan trọng dành cho Quản trị viên & Chủ xưởng:
              </p>
              <p className="leading-relaxed">
                Tài liệu này là <strong>bản dự thảo điều khoản kỹ thuật</strong> do đội ngũ phát triển chuẩn bị sẵn khung.
                Trước khi chính thức phát hành thương mại (Public Production), quý doanh nghiệp/chủ sở hữu cần đối chiếu với các quy định pháp luật Việt Nam hiện hành (bao gồm Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân) hoặc tham vấn luật sư chuyên ngành.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-sm p-8 sm:p-12 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Điều Khoản Dịch Vụ Nền Tảng AutoCutlist
            </h1>
            <p className="text-sm font-mono text-slate-500">
              Có hiệu lực từ: Tháng 10/2026 | Phiên bản: 1.0-draft
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">1</span>
              Định vị và Phạm vi Dịch vụ
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              AutoCutlist (vận hành tại tên miền <code>webnoithatpro.vn</code>) là phần mềm SaaS chuyên biệt cung cấp giải pháp bóc tách Cutlist ván công nghiệp, tự động hóa dự toán giá vốn xưởng (BOM) và kết xuất báo giá thương mại tiêu chuẩn A4.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Dịch vụ được thiết kế phục vụ đối tượng khách hàng doanh nghiệp (B2B): chủ xưởng mộc, kiến trúc sư, nhà thiết kế nội thất và kỹ sư bổ kỹ thuật CAD.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">2</span>
              Phân định Vai trò Kiểm soát và Xử lý Dữ liệu
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Căn cứ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 pl-4 list-disc">
              <li>
                <strong>Khách hàng / Xưởng nội thất:</strong> Là <em>Bên Kiểm Soát Dữ Liệu Cá Nhân (Data Controller)</em> đối với mọi thông tin khách hàng cuối của xưởng (Tên chủ nhà, Số điện thoại, Địa chỉ công trình, Ghi chú yêu cầu) được nhập vào hệ thống. Xưởng có nghĩa vụ đảm bảo tính hợp pháp và có sự đồng ý của khách hàng khi thu thập thông tin này.
              </li>
              <li>
                <strong>Nền tảng AutoCutlist:</strong> Đóng vai trò là <em>Bên Xử Lý Dữ Liệu Cá Nhân (Data Processor)</em>. Chúng tôi chỉ thực hiện lưu trữ, mã hóa và xử lý tính toán số liệu dự toán theo đúng chỉ dẫn và thao tác của người dùng. Chúng tôi cam kết không kinh doanh, bán hoặc chia sẻ dữ liệu này cho bên thứ ba.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">3</span>
              Miễn Trừ Trách Nhiệm Kỹ Thuật (Disclaimer)
            </h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono leading-relaxed">
              &quot;Lưu ý: Bảng khối lượng dự toán dựa trên hệ số hao hụt do người dùng thiết lập. Quý xưởng vui lòng đối chiếu sơ đồ cắt thực tế trước khi xuất lệnh đặt hàng.&quot;
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              AutoCutlist là công cụ hỗ trợ tính toán toán học dựa trên danh sách chi tiết (Cutlist) và hệ số hao hụt do xưởng tùy biến (1.15 cho ván, 1.08 cho chỉ dán cạnh, v.v.). Người dùng có trách nhiệm kiểm tra lại bảng tối ưu hóa cắt tấm (Nesting/Cutting pattern) trên máy CNC hoặc phần mềm cưa bàn trước khi đặt mua vật tư từ đại lý. Nền tảng không chịu trách nhiệm bồi thường về sai lệch vật tư phát sinh do lỗi thao tác thực tế tại xưởng.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">4</span>
              Bảo Mật Đơn Giá và Bí Mật Kinh Doanh
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Hệ thống đơn giá vật tư, mức định mức phụ kiện và hệ số lợi nhuận (markup) của mỗi xưởng là tài sản bí mật kinh doanh tuyệt mật. Nền tảng thiết lập cơ chế Bảo mật cấp hàng (Row Level Security - RLS) trên toàn bộ cơ sở dữ liệu để đảm bảo không một xưởng nào có thể truy cập hoặc nhìn thấy dữ liệu của xưởng khác.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-mono font-semibold">5</span>
              Quyền Hủy Tài Khoản và Xuất Dữ Liệu
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Chủ xưởng có toàn quyền yêu cầu kết xuất toàn bộ dự toán và lịch sử bóc tách dưới dạng file Excel/JSON bất kỳ lúc nào, cũng như quyền yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu dự án lưu trữ trên máy chủ theo quy chuẩn pháp lý.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center text-xs text-slate-500 font-mono space-x-4">
          <Link href="/privacy" className="hover:text-amber-600 underline">Chính sách Quyền Riêng Tư</Link>
          <span>•</span>
          <Link href="/pricing" className="hover:text-amber-600 underline">Bảng Giá Gói Cước</Link>
        </div>
      </div>
    </div>
  );
}
