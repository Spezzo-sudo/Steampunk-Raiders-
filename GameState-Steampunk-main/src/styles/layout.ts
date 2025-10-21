/**
 * Zentraler Definition von Layout-Tokens, um Abstände und Breakpoints konsistent zu halten.
 */
export const LAYOUT_BREAKPOINTS = {
  /** Kleinstes Layout für Mobilgeräte. */
  xs: 480,
  /** Kleinere Tablets und größere Smartphones. */
  sm: 768,
  /** Breiteres Tablet oder kleiner Desktop. */
  md: 1200,
  /** Große Desktops mit zusätzlichem Weißraum. */
  lg: 1440,
} as const;

/**
 * Globale Abstände, die auf mehreren Komponenten wiederverwendet werden.
 */
export const LAYOUT_SPACING = {
  /** Horizontaler Außenabstand auf mobilen Geräten. */
  pagePaddingX: 16,
  /** Horizontaler Außenabstand auf größeren Geräten. */
  pagePaddingXDesktop: 24,
  /** Vertikaler Abstand zwischen Abschnitten. */
  sectionGap: 32,
  /** Standardabstand zwischen Karten. */
  cardGap: 24,
} as const;

/**
 * Maximum der Inhaltsbreite in Pixeln für den Hauptbereich.
 */
export const LAYOUT_MAX_WIDTH = 1320;

/**
 * Wiederverwendbare Hilfsklassen für Grid-Layouts.
 */
export const LAYOUT_CLASSES = {
  /** Standard-Padding der Hauptcontainer. */
  pagePadding: 'px-4 sm:px-6',
  /** Standardabstände innerhalb eines Abschnitts. */
  section: 'space-y-8 pb-16',
  /** Responsives Kartengitter (1/2/3/4 Spalten je Breakpoint). */
  cardGrid:
    'grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 min-[768px]:grid-cols-3 min-[1200px]:grid-cols-4',
} as const;

