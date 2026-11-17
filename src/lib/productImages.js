import { safeWebUrl } from "./api.js";

export const isCatalogImage = (value) =>
  /^\/api\/v1\/media\/products\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(value);

export function imageReferenceKey(value) {
  const url = value.trim();
  return isCatalogImage(url) ? url : new URL(url).href;
}

export function productImageSource(value) {
  if (isCatalogImage(value)) return value;
  const url = safeWebUrl(value);
  return url && new URL(url).hostname !== "placehold.co" ? url : null;
}
