"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Đang chuyển tiếp đến Bàn điều khiển dự án...
    </div>
  );
}
