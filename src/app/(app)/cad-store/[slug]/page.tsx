"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Download, Laptop, CheckCircle2, QrCode } from "lucide-react";

export default function PluginDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      <Link
        href="/cad-store"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại Kho Plugin CAD
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide">
              Plugin AutoCAD Chuyên Dụng
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Lisp Bóc Tách Kích Thước Tấm Xuất CSV Chuẩn Web
            </h1>
            <p className="text-xs text-slate-500 mt-1">Mã định danh: {slug}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Giá bản quyền vĩnh viễn</span>
            <span className="font-mono font-extrabold text-2xl text-amber-700">199.000 đ</span>
          </div>
        </div>

        {/* Video / GIF Demo Mockup dạng Clean Light */}
        <div className="aspect-video bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-600 text-xs border border-slate-200 p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-base font-bold shadow-2xs">
            CAD
          </div>
          <p className="font-semibold text-slate-800 text-sm">Video Hướng Dẫn Thao Tác Bóc Tách Trong AutoCAD</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Quét chọn toàn bộ mặt bằng bản vẽ 2D tủ áo, Lisp tự động nhận diện chiều dài, rộng, dày và xuất file CSV có mã BOM UTF-8 không lỗi font.
          </p>
        </div>

        {/* Tính năng nổi bật */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Tính năng nổi bật:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Tự động bóc Polyline, Solid 3D và Block
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Khớp chuẩn 8 cột đưa thẳng lên Web bóc tách
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Bảo toàn truy bắt điểm OSMODE khi bấm ESC
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Hỗ trợ từ AutoCAD 2014 đến 2026
            </li>
          </ul>
        </div>

        {/* Thanh toán & Tải file */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Kích hoạt theo Volume Serial Number của máy tính
          </span>

          <Link
            href="/settings/billing"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition"
          >
            <QrCode className="w-4 h-4" /> Mua Bằng Mã VietQR
          </Link>
        </div>
      </div>
    </div>
  );
}
