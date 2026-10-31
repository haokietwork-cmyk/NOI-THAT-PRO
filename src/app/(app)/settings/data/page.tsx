"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Download,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  X,
} from "lucide-react";
import { StorageService } from "@/core/services/storageService";

export default function DataAndPrivacyPage() {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Modal Xóa Tài Khoản 2 bước
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 1. Xuất toàn bộ dữ liệu JSON
  const handleExportJson = async () => {
    try {
      setExporting(true);
      const data = await StorageService.exportAllUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `autocutlist-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error("Lỗi xuất dữ liệu:", err);
    } finally {
      setExporting(false);
    }
  };

  // 2. Xóa tài khoản vĩnh viễn (Xác nhận 2 bước)
  const handleDeleteAccount = async () => {
    if (confirmText.trim() !== "XOA TAI KHOAN") {
      setDeleteError("Vui lòng nhập chính xác cụm từ 'XOA TAI KHOAN'");
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "XOA TAI KHOAN" }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không thể xóa tài khoản");
      }

      // Xóa sạch LocalStorage trên máy khách
      StorageService.clearAllLocalData();

      // Chuyển hướng người dùng về trang chủ
      window.location.href = "/?account_deleted=true";
    } catch (err: any) {
      setDeleteError(err.message || "Đã xảy ra lỗi khi xóa tài khoản");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <Database className="w-3.5 h-3.5" />
          <span>Dữ Liệu &amp; Quyền Riêng Tư</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Quản lý Dữ liệu Xưởng &amp; Quyền Riêng Tư
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quyền sao lưu, xuất dữ liệu độc lập và yêu cầu xóa vĩnh viễn tài khoản theo quy định tại Nghị định 13/2023/NĐ-CP.
        </p>
      </div>

      {/* Tabs chuyển đổi */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <Link
          href="/settings/profile"
          className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
        >
          1. Hồ sơ xưởng &amp; In ấn A4
        </Link>
        <Link
          href="/settings/billing"
          className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
        >
          2. Gói cước &amp; Thanh toán VietQR
        </Link>
        <Link
          href="/settings/data"
          className="px-4 py-2 bg-amber-500 text-white rounded-xl shadow-xs"
        >
          3. Dữ liệu &amp; Quyền riêng tư
        </Link>
      </div>

      {/* 1. KHU VỰC XUẤT DỮ LIỆU (DATA EXPORT) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Download className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Xuất dữ liệu dự toán &amp; Vật tư (Data Portability)
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Tải về bản sao lưu đầy đủ toàn bộ hồ sơ xưởng, danh mục vật tư, các bảng tính dự án và chi tiết phôi ván Cutlist. Dữ liệu được đóng gói chuẩn định dạng JSON, giúp quý xưởng hoàn toàn chủ động lưu trữ dữ liệu ngoại tuyến.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportJson}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Đang trích xuất dữ liệu..." : "Tải xuống toàn bộ dữ liệu (JSON)"}
          </button>

          {exportSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Đã tải xuống thành công bản sao lưu!
            </span>
          )}
        </div>
      </div>

      {/* 2. KHU VỰC NGUY HIỂM: XÓA VĨNH VIỄN TÀI KHOẢN (DANGER ZONE) */}
      <div className="bg-red-50/40 rounded-2xl border border-red-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-red-100 pb-3">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-red-950">
            Vùng nguy hiểm: Xóa tài khoản &amp; Dữ liệu vĩnh viễn
          </h2>
        </div>
        <p className="text-xs text-red-800/80 leading-relaxed">
          Hành động này sẽ xóa hoàn toàn tài khoản của bạn, tổ chức xưởng, toàn bộ danh mục vật tư, các dự án đã lưu và lịch sử bóc tách cutlist. Dữ liệu sau khi xóa <strong>không thể phục hồi</strong> dưới bất kỳ hình thức nào.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setConfirmText("");
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            Yêu cầu xóa tài khoản xưởng
          </button>
        </div>
      </div>

      {/* MODAL XÁC NHẬN 2 BƯỚC */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Xác nhận xóa tài khoản (Bước 2)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn đang thực hiện xóa vĩnh viễn tài khoản và toàn bộ cơ sở dữ liệu dự án của xưởng. Để xác nhận hành động này, vui lòng nhập chính xác cụm từ <strong className="text-red-600 font-mono">XOA TAI KHOAN</strong> vào ô bên dưới:
            </p>

            <div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="XOA TAI KHOAN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {deleteError && (
              <p className="text-xs text-red-600 font-medium">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmText.trim() !== "XOA TAI KHOAN" || isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {isDeleting ? "Đang xóa vĩnh viễn..." : "Xác nhận xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
