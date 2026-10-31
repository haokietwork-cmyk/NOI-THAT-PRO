"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { logSanitizedError } from "@/core/monitoring/error-logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logSanitizedError("Lỗi hệ thống toàn cục (Global Error Boundary)", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center space-y-6">
          <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertOctagon className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">
              Sự cố hệ thống máy chủ
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trang web gặp lỗi ngoài ý muốn. Vui lòng bấm làm mới trang để thử lại.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Làm mới trang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
