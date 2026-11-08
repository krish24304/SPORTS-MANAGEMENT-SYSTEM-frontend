"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { fileUrl } from "@/lib/config";

type Props = {
  path: string | null | undefined;
  alt: string;
  className?: string;
  // Shown when there is no photo; defaults to nothing.
  empty?: React.ReactNode;
  onClick?: () => void;
};

// ID card photo from the backend, with a clear message when it is missing or fails to load.
export default function IdPhoto({ path, alt, className = "", empty = null, onClick }: Props) {
  const src = fileUrl(path);
  // Remember which address failed, so a new photo is tried again automatically.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src) return <>{empty}</>;

  if (failedSrc === src) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-zinc-900/60 p-4 text-center text-xs text-zinc-500 ${className}`}>
        <ImageOff size={20} className="text-zinc-600" />
        Photo could not be loaded
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} onClick={onClick} className={className} />
  );
}
