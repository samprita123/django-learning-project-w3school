import type { PlatformFavorite } from "@/types/platform";
import { DEFAULT_FAVORITES } from "./platform-data";

const LS_FAVORITES = "retrod.one.favorites:v1";

export function loadPlatformFavorites(): PlatformFavorite[] {
  if (typeof window === "undefined") return DEFAULT_FAVORITES;
  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    if (!raw) return DEFAULT_FAVORITES;
    const parsed = JSON.parse(raw) as PlatformFavorite[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FAVORITES;
  } catch {
    return DEFAULT_FAVORITES;
  }
}

export function savePlatformFavorites(favorites: PlatformFavorite[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites));
}

export function toggleFavoritePin(
  favorites: PlatformFavorite[],
  item: PlatformFavorite,
): PlatformFavorite[] {
  const exists = favorites.some((f) => f.id === item.id);
  const next = exists ? favorites.filter((f) => f.id !== item.id) : [...favorites, item];
  savePlatformFavorites(next);
  return next;
}
