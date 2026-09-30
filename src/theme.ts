/**
 * Roomorph theme — single source of truth for the look of the app.
 * Reskin everything by editing this file. Values come from the
 * Roomorph moodboard: ivory, sand, taupe, sage, charcoal, terracotta;
 * Playfair Display headings, Inter body, wide-tracked uppercase labels.
 */

export const colors = {
  // Brand palette (moodboard)
  ivory: '#F8F5EF',
  sand: '#EADDCB',
  taupe: '#C8B59E',
  sage: '#8C9184',
  charcoal: '#3B3B36',
  terracotta: '#A67C52',

  // Roles
  background: '#F8F5EF', // ivory page
  surface: '#FFFDF9', // cards
  surfaceAlt: '#F1E9DD', // soft sand panels / icon tiles
  muted: '#7E7A70', // secondary text
  text: '#3B3B36', // charcoal
  ink: '#3B3B36', // primary buttons
  onInk: '#F8F5EF',
  accent: '#A67C52', // terracotta — eyebrows, highlights
  border: '#E6DDD0',
  overlay: 'rgba(59, 59, 54, 0.45)',
  danger: '#A5523A',
  success: '#6E7A62',
} as const;

export const fonts = {
  serif: 'PlayfairDisplay_400Regular',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  serifBold: 'PlayfairDisplay_500Medium',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
} as const;

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 44, lineHeight: 50, color: colors.text },
  h1: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 38, color: colors.text },
  h2: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 31, color: colors.text },
  h3: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 24, color: colors.text },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.text },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.muted },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2.2,
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
    shadowColor: '#3B3B36',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
} as const;
