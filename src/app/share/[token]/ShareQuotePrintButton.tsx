"use client";

import { useState, useEffect } from "react";
import { Printer, Copy, Check, Share2 } from "lucide-react";

export default function ShareQuotePrintButton() {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: "Báo Giá Thi Công Nội Thất",
            text: "Bản báo giá thi công nội thất chuẩn xưởng sản xuất",
            url: window.location.href,
          });
          return;
        } catch (err: any) {
          if (err.name === "AbortError") return;
        }
      }
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Lỗi sao chép liên kết:", err);
      }
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
      {canShare && (
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
          title="Chia sẻ báo giá qua Zalo hoặc ứng dụng điện thoại"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gửi Zalo</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
        title="Sao chép liên kết báo giá"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-bold">Đã chép link!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Sao chép link</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-xs shadow-amber-500/20 cursor-pointer"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>In / Lưu PDF</span>
      </button>
    </div>
  );
}
