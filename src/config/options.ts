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

export const FREE_CREDITS = 3;

export const CREDIT_PACKS = [
  { id: 'pack_20', credits: 20, price: '$4.99', note: 'Try a few rooms' },
  { id: 'pack_50', credits: 50, price: '$9.99', note: 'Best value', highlight: true },
  { id: 'pack_120', credits: 120, price: '$19.99', note: 'Whole-home makeover' },
];
