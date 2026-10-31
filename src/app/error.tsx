"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import { logSanitizedError } from "@/core/monitoring/error-logger";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ghi log khử PII an toàn
    logSanitizedError("Lỗi giao diện ứng dụng (Root Error Boundary)", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 bg-blueprint-grid flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 max-w-lg w-full shadow-sm text-center space-y-6">
        <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <AlertOctagon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Đã xảy ra sự cố kỹ thuật
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống tính toán gặp gián đoạn tạm thời. Dữ liệu bảng tính Cutlist của quý xưởng trên thiết bị vẫn được bảo toàn an toàn.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-400">
              Mã theo dõi lỗi: <span className="text-slate-600 font-semibold">{error.digest}</span>
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            Thử lại thao tác
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            Về Bảng điều khiển
          </Link>
        </div>
      </div>
    </div>
  );
}
