"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

interface OverlayProps {
  open: boolean;
  onBackdropClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = (props) => {
  useEffect(
    function lockBodyScroll() {
      if (!props.open) return;
      const html = document.documentElement;
      const original = html.style.overflow;
      html.style.overflow = "hidden";
      return () => {
        html.style.overflow = original;
      };
    },
    [props.open]
  );

  if (!props.open) {
    return null;
  }

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      props.onBackdropClick?.();
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-clip",
        props.className
      )}
      onClick={onBackdropClick}
    >
      {props.children}
    </div>
  );
};

Overlay.displayName = "Overlay";
export default Overlay;
