// Single place for the backend address. Set NEXT_PUBLIC_API_URL in
// .env.local (dev) or in the Vercel project settings (production).
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

// Turns a stored upload path ("/uploads/x.jpg") into a full URL on the backend.
// Full URLs (e.g. a future Cloudinary link) are returned unchanged.
export function fileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const value = String(path).trim();
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

export const ID_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ID_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

// Same rules the backend applies; returns a message to show, or null when the file is fine.
export function checkIdPhoto(file: File): string | null {
  if (!ID_PHOTO_TYPES.includes(file.type)) return "Please choose a JPG, PNG or WEBP photo of your ID card.";
  if (file.size > ID_PHOTO_MAX_BYTES) return "The photo is larger than 5 MB. Please choose a smaller one.";
  return null;
}
