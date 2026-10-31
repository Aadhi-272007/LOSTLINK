export function parseReportCode(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const fromUrl = value.match(/\/items\/([A-Za-z0-9_-]{6,})/);
  if (fromUrl) return fromUrl[1];
  if (/^[A-Za-z0-9_-]{6,}$/.test(value)) return value;
  return null;
}