export const THEME_STORAGE_KEY = "retrod:pms:theme";
export type AppTheme =
  | "light"
  | "dark"
  | "rose-indigo-premium"
  | "emerald-gold-luxury"
  | "ocean-cyan-modern"
  | "sunset-amber"
  | "high-contrast"
  | "graphite-blue-pro"
  | "royal-plum-business"
  | "forest-slate-executive"
  | "copper-night";

export type ThemeGroup = "core" | "professional" | "signature" | "accessibility";

export const APP_THEME_GROUP_LABELS: Record<ThemeGroup, string> = {
  core: "Core",
  professional: "Professional",
  signature: "Signature",
  accessibility: "Accessibility",
};

export const APP_THEMES: {
  value: AppTheme;
  label: string;
  group: ThemeGroup;
  swatches: [string, string, string];
}[] = [
  { value: "light", label: "Light", group: "core", swatches: ["#C7346A", "#F5F7FA", "#111827"] },
  { value: "dark", label: "Dark", group: "core", swatches: ["#D94C7F", "#1F2738", "#F4F5F8"] },
  {
    value: "graphite-blue-pro",
    label: "Graphite",
    group: "professional",
    swatches: ["#3F4F7D", "#EFF2F7", "#1F2A44"],
  },
  {
    value: "forest-slate-executive",
    label: "Forest",
    group: "professional",
    swatches: ["#2F6A54", "#EEF4F1", "#1F3D31"],
  },
  {
    value: "royal-plum-business",
    label: "Royal",
    group: "professional",
    swatches: ["#5B3A7B", "#F2EEF8", "#281A3E"],
  },
  {
    value: "copper-night",
    label: "Copper",
    group: "professional",
    swatches: ["#B87333", "#26201C", "#F5E8D9"],
  },
  {
    value: "rose-indigo-premium",
    label: "Rose Indigo",
    group: "signature",
    swatches: ["#A3265F", "#F8EEF5", "#2D1E3E"],
  },
  {
    value: "emerald-gold-luxury",
    label: "Emerald Gold",
    group: "signature",
    swatches: ["#2F7E61", "#F5F8F2", "#D4AF37"],
  },
  {
    value: "ocean-cyan-modern",
    label: "Ocean Cyan",
    group: "signature",
    swatches: ["#2E6E8E", "#F1F7FA", "#0EA5B8"],
  },
  {
    value: "sunset-amber",
    label: "Sunset Amber",
    group: "signature",
    swatches: ["#B86B2D", "#FFF8F2", "#6A3A14"],
  },
  {
    value: "high-contrast",
    label: "High Contrast",
    group: "accessibility",
    swatches: ["#2C3E8F", "#FFFFFF", "#0B0F1A"],
  },
];

const THEME_CLASSES = [
  "dark",
  "theme-rose-indigo-premium",
  "theme-emerald-gold-luxury",
  "theme-ocean-cyan-modern",
  "theme-sunset-amber",
  "theme-high-contrast",
  "theme-graphite-blue-pro",
  "theme-royal-plum-business",
  "theme-forest-slate-executive",
  "theme-copper-night",
] as const;

export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove(...THEME_CLASSES);

  if (theme === "dark") {
    root.classList.add("dark");
    return;
  }
  if (theme === "light") {
    return;
  }

  root.classList.add(`theme-${theme}`);
}

export function readSavedTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && APP_THEMES.some((theme) => theme.value === stored)) {
    return stored as AppTheme;
  }
  return "light";
}

export function persistTheme(theme: AppTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
