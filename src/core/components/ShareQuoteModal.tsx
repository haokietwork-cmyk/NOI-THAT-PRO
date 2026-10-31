"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, ShieldAlert, ShieldCheck, Clock, CreditCard, X, AlertCircle } from "lucide-react";

interface ShareQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
  isAuthenticated: boolean;
  onPromptLogin: () => void;
  onSaveProjectFirst: () => void;
}

export default function ShareQuoteModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  isAuthenticated,
  onPromptLogin,
  onSaveProjectFirst,
}: ShareQuoteModalProps) {
  const [expiresDays, setExpiresDays] = useState<number>(30);
  const [includeBankInfo, setIncludeBankInfo] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [revokedSuccess, setRevokedSuccess] = useState<boolean>(false);
  const [canShare, setCanShare] = useState<boolean>(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleCreateShareLink = async () => {
    if (!projectId) return;
    setLoading(true);
    setErrorMsg("");
    setRevokedSuccess(false);

    try {
      const res = await fetch("/api/quote-share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          expiresDays,
          includeBankInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Không thể tạo liên kết chia sẻ");
      }

      setShareUrl(data.shareUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi tạo liên kết");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeLink = async () => {
    if (!projectId) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/quote-share/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Không thể thu hồi liên kết");
      }

      setShareUrl("");
      setRevokedSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi thu hồi liên kết");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Lỗi chép link:", err);
    }
  };

  const handleWebShare = async () => {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Báo Giá Thi Công Nội Thất",
          text: projectName
            ? `Kính gửi anh/chị bản báo giá thi công nội thất: ${projectName}`
            : "Kính gửi anh/chị bản báo giá thi công nội thất chuẩn xưởng sản xuất",
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }
    await handleCopyLink();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xl max-w-lg w-full space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Chia Sẻ Báo Giá An Toàn (Secure Link)</h2>
              <p className="text-[11px] text-slate-500">Gửi trực tiếp cho khách xem trên Zalo / Điện thoại</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trường hợp: Dự án chưa lưu Cloud hoặc chưa đăng nhập */}
        {(!isAuthenticated || !projectId) && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Yêu cầu lưu dự án lên Cloud trước khi chia sẻ</p>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  Để đảm bảo tính bất biến, bảo mật dữ liệu và tạo token ngẫu nhiên, dự án cần được lưu trữ an toàn trên tài khoản xưởng của bạn.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPromptLogin();
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shadow-xs text-xs cursor-pointer"
                >
                  Đăng nhập tài khoản
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSaveProjectFirst();
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shadow-xs text-xs cursor-pointer"
                >
                  Lưu dự án lên Cloud ngay
                </button>
              )}
            </div>
          </div>
        )}

        {/* Trường hợp: Đã có dự án Cloud */}
        {isAuthenticated && projectId && (
          <div className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {revokedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã thu hồi liên kết thành công. Khách hàng sẽ không thể truy cập liên kết cũ nữa.</span>
              </div>
            )}

            {/* Khi chưa tạo hoặc muốn tạo lại */}
            {!shareUrl ? (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Thời hạn hiệu lực của liên kết:</span>
                  </label>
                  <select
                    value={expiresDays}
                    onChange={(e) => setExpiresDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value={7}>7 ngày (Báo giá nhanh)</option>
                    <option value={30}>30 ngày (Tiêu chuẩn xưởng mộc)</option>
                    <option value={90}>90 ngày (Dự án dài hạn)</option>
                  </select>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeBankInfo}
                      onChange={(e) => setIncludeBankInfo(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>Hiển thị thông tin tài khoản ngân hàng để khách chuyển khoản cọc</span>
                  </label>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-500">
                  <strong className="text-slate-800 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Cam kết bảo mật bí mật kinh doanh:
                  </strong>
                  <p>
                    Hệ thống tự động che sạch 100% giá vốn vật tư, tỷ lệ lãi, định mức keo, nhân công và chi tiết kích thước phôi tấm lẻ trước khi gửi khách.
                  </p>
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer text-center"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateShareLink}
                    disabled={loading}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer text-center"
                  >
                    {loading ? "Đang tạo liên kết..." : "Tạo Liên Kết Chia Sẻ"}
                  </button>
                </div>
              </div>
            ) : (
              /* Khi đã tạo link thành công */
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Nút Web Share nổi bật trên mobile để gửi qua Zalo */}
                {canShare && (
                  <button
                    type="button"
                    onClick={handleWebShare}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Gửi qua Zalo / Ứng dụng điện thoại</span>
                  </button>
                )}

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Liên kết báo giá của bạn (sẵn sàng gửi khách):
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Chép link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-[11px] space-y-1">
                  <strong className="font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Liên kết bảo mật đã sẵn sàng!
                  </strong>
                  <p>
                    Khách hàng có thể mở trực tiếp trên điện thoại hoặc máy tính, xem bảng báo giá thành phẩm và tải bản in A4.
                  </p>
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleRevokeLink}
                    disabled={loading}
                    className="text-xs text-rose-600 hover:text-rose-800 underline font-semibold text-center sm:text-left cursor-pointer"
                  >
                    {loading ? "Đang thu hồi..." : "Thu hồi liên kết này"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer text-center"
                  >
                    Hoàn tất
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
