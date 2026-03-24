/**
 * constants/theme.ts — Global Design Tokens
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS IS YOUR SINGLE SOURCE OF TRUTH FOR THE APP'S VISUAL IDENTITY.
 * Change values here and they propagate everywhere.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * FBLA brand colors: Navy Blue (#003466) + Gold (#FFB81C)
 * We extend these into a full design system below.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────
export const COLORS = {
  // ── Brand primaries ──────────────────────────────────────────────────────
  navyDark:   "#001D3D",   // Deepest navy — backgrounds, headers
  navy:       "#003466",   // Core FBLA navy
  navyLight:  "#0A4A8A",   // Lighter navy — cards, elevated surfaces
  navyMid:    "#1A2F4E",   // Mid-range navy — subtle backgrounds

  gold:       "#FFB81C",   // Core FBLA gold — primary accent
  goldLight:  "#FFCD57",   // Lighter gold — hover states, highlights
  goldDark:   "#E09E00",   // Deeper gold — pressed states

  // ── Neutrals ─────────────────────────────────────────────────────────────
  white:      "#FFFFFF",
  offWhite:   "#F5F7FA",   // Card backgrounds on light surfaces
  gray100:    "#E8ECF1",
  gray300:    "#B0BBC8",
  gray500:    "#6B7A8D",
  gray700:    "#3D4A5C",

  // ── Semantic / status colors ──────────────────────────────────────────────
  success:    "#22C55E",   // Green — completed, confirmed
  warning:    "#F59E0B",   // Amber — upcoming deadlines
  error:      "#EF4444",   // Red — errors, missed
  info:       "#3B82F6",   // Blue — informational badges

  // ── UI-specific ───────────────────────────────────────────────────────────
  background:       "#001D3D",   // Main screen background
  cardBackground:   "#0A2A4A",   // Card / surface background
  cardBorder:       "#1A3A5C",   // Subtle card border
  tabIconInactive:  "#4A6080",   // Inactive tab icon color
  textPrimary:      "#FFFFFF",
  textSecondary:    "#8FA8C8",   // Muted body text
  textMuted:        "#4A6080",   // Very muted / disabled text
  separator:        "#1A3A5C",   // List separators, dividers
  overlay:          "rgba(0, 29, 61, 0.85)", // Modal / overlay backdrop
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
// Font family names — update here when switching font packages.
// Expo Google Fonts: npx expo install @expo-google-fonts/inter (or your chosen font)
// For now these use system fonts as safe fallbacks; swap in loaded fonts here.
export const FONTS = {
  // Display / headings — bold, impactful
  display:  "System",          // Replace with e.g. "Montserrat_800ExtraBold"
  // Headings
  bold:     "System",          // Replace with e.g. "Montserrat_700Bold"
  // Body / labels
  semibold: "System",          // Replace with e.g. "Montserrat_600SemiBold"
  medium:   "System",          // Replace with e.g. "Montserrat_500Medium"
  regular:  "System",          // Replace with e.g. "Montserrat_400Regular"
  // Numeric / tabular data
  mono:     "System",          // Replace with e.g. a monospace font
} as const;

// ─── Font Sizes ───────────────────────────────────────────────────────────────
export const FONT_SIZE = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

// ─── Spacing (8-point grid) ───────────────────────────────────────────────────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
// React Native shadow props — combine into StyleSheet objects as needed.
export const SHADOWS = {
  // Subtle card lift
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,           // Android
  },
  // More pronounced — modals, FABs
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  // Gold glow — use on gold CTA buttons
  goldGlow: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────
export const Z_INDEX = {
  base:    0,
  card:    10,
  overlay: 100,
  modal:   200,
  toast:   300,
} as const;