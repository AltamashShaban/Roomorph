export const PROMPT_SUGGESTIONS = [
  'More plants',
  'Warm lighting',
  'Green velvet sofa',
  'Wooden floors',
  'Cosy reading nook',
  'Neutral palette',
  'Gallery wall',
  'Bigger rug',
];

export const QUALITY = {
  standard: { label: 'Standard', credits: 1, apiQuality: 'medium' as const, note: 'Fast · great for exploring' },
  hd: { label: 'HD', credits: 4, apiQuality: 'high' as const, note: 'Sharper detail · best for sharing' },
};
export type Quality = keyof typeof QUALITY;

export const FREE_CREDITS = 2;

// Launch pricing: close to break-even on gpt-image-2 (Standard ≈ $0.06–0.07 per render
// incl. the input photo) after the 15% store fee. Raise once we have users.
export const CREDIT_PACKS = [
  { id: 'pack_10', credits: 10, price: '$0.99', note: 'Try a few rooms' },
  { id: 'pack_30', credits: 30, price: '$2.49', note: 'Best value', highlight: true },
  { id: 'pack_75', credits: 75, price: '$5.99', note: 'Whole-home makeover' },
];
