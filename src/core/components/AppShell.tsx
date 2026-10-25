"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import AuthGuard from "./AuthGuard";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Chỉ cho phép dùng thử ở chức năng test bóc tách (/quoting)
  // Toàn bộ các trang quản trị xưởng khác bắt buộc đăng nhập (Email / SĐT)
  const isTestQuotingPage = pathname === "/quoting" || pathname?.startsWith("/quoting");

  const getFeatureName = (path: string) => {
    if (path.startsWith("/dashboard")) return "Bảng điều khiển tổng quan xưởng";
    if (path.startsWith("/materials")) return "Thư viện vật tư & Đơn giá xưởng";
    if (path.startsWith("/projects")) return "Kho lưu trữ dự án xưởng";
    if (path.startsWith("/settings")) return "Cài đặt hồ sơ xưởng & Mẫu in A4";
    if (path.startsWith("/my-assets")) return "Kho bản quyền & File Lisp CAD";
    return "khu vực quản trị xưởng này";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar cố định - tự động ẩn khi gọi lệnh in window.print() */}
      <div className="no-print">
        <Sidebar />
      </div>

      {/* Vùng nội dung chính */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isTestQuotingPage ? (
            children
          ) : (
            <AuthGuard featureName={getFeatureName(pathname || "")}>
              {children}
            </AuthGuard>
          )}
        </div>
      </main>
    </div>
  );
}
