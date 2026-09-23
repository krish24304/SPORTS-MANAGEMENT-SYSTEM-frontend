"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const width =
    size === "sm"
      ? "max-w-md"
      : size === "lg"
      ? "max-w-3xl"
      : "max-w-xl";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full ${width} max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1 text-xl text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
          </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}