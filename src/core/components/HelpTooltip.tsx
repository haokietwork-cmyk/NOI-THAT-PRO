"use client";

import { useState, useRef, useEffect, useId } from "react";
import { HelpCircle } from "lucide-react";

interface HelpTooltipProps {
  content: string;
  label?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export default function HelpTooltip({
  content,
  label = "Giải thích thuật ngữ",
  position = "top",
  className = "",
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Đóng tooltip khi bấm ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "bottom":
        return "top-full mt-2 left-1/2 -translate-x-1/2";
      case "left":
        return "right-full mr-2 top-1/2 -translate-y-1/2";
      case "right":
        return "left-full ml-2 top-1/2 -translate-y-1/2";
      case "top":
      default:
        return "bottom-full mb-2 left-1/2 -translate-x-1/2";
    }
  };

  return (
    <span className={`relative inline-flex items-center align-middle ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        className="p-0.5 text-slate-400 hover:text-amber-600 focus:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 rounded-full transition cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-3 py-2 text-[11px] leading-relaxed font-normal text-white bg-slate-900 rounded-xl shadow-xl border border-slate-700/80 w-60 max-w-[85vw] text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${getPositionClasses()}`}
        >
          {content}
          <span className="block text-[9px] text-amber-400/90 font-medium mt-1">
            (Bấm hoặc di chuột để xem giải thích)
          </span>
        </span>
      )}
    </span>
  );
}
