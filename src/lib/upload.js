import { base44 } from "@/api/base44Client";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function validatePhoto(file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) return "Choose an image file (JPG, PNG or WebP).";
  if (file.size > MAX_PHOTO_BYTES) return "Photos must be 5 MB or smaller.";
  return null;
}

export async function uploadPhoto(file) {
  const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
  return file_url;
}