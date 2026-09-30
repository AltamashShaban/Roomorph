/**
 * Roomorph theme — single source of truth for the look of the app.
 * Reskin everything by editing this file. Placeholder values are
 * derived from the moodboard: warm off-whites, sand/taupe neutrals,
 * charcoal CTAs, editorial serif headlines + small-caps sans labels.
 */

export const colors = {
  background: '#F6F2EC', // warm off-white page
  surface: '#FFFFFF', // cards
  surfaceAlt: '#EFE8DE', // beige feature cards
  sand: '#E3D9CB',
  taupe: '#B9AB98',
  muted: '#8A8076', // secondary text
  text: '#2B2622', // primary text
  ink: '#1F1C19', // primary buttons
  onInk: '#F6F2EC', // text on primary buttons
  accent: '#9A7B5B', // bronze — small highlights
  border: '#E6DED3',
  overlay: 'rgba(31, 28, 25, 0.45)',
  danger: '#B5543C',
  success: '#6F8A5E',
} as const;

export const fonts = {
  serif: 'CormorantGaramond_500Medium',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
  serifBold: 'CormorantGaramond_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
} as const;

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 52, lineHeight: 54, color: colors.text },
  h1: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 40, color: colors.text },
  h2: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 32, color: colors.text },
  h3: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 26, color: colors.text },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.text },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.muted },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
    color: colors.text,
  },
  button: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radii = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const shadow = {
  card: {
    shadowColor: '#3A2E22',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
} as const;
