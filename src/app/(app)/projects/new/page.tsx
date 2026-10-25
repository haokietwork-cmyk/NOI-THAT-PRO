"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WORKSHOP_TERMS } from "@/core/constants/terms";

export default function NewProjectRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/quoting");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Đang chuyển tiếp đến không gian bóc tách {WORKSHOP_TERMS.cutlist.label}...
    </div>
  );
}
