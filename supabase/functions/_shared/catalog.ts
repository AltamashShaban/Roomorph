/**
 * Shared by the app and the Supabase Edge Function (keep this file free of
 * imports so both Metro and Deno can load it). The server is what actually
 * builds the prompt and charges credits in production; the app uses the same
 * values for display and for the prototype's on-device mode.
 */

/** AI prompt fragment per style. Names/descriptions/images live in src/config/styles.ts. */
export const STYLE_PROMPTS: Record<string, { name: string; prompt: string }> = {
  modern: { name: 'Modern', prompt: 'clean straight lines, warm neutral palette of white, greige and charcoal, sleek low-profile furniture, dark stone or marble surfaces, matte black or brushed brass details, minimal ornament, warm hidden LED lighting' },
  scandinavian: { name: 'Scandinavian', prompt: 'light oak and birch wood, white or pale grey walls, soft wool and knitted textiles, accents of sage green and dusty blue, sheer linen curtains, simple functional furniture, a few green plants, bright and cozy hygge feel' },
  industrial: { name: 'Industrial', prompt: 'exposed brick or raw concrete surfaces, black steel frames and open metal shelving, reclaimed wood, cognac leather, Edison bulb and black metal lighting, muted greys and warm browns, loft warehouse feel' },
  bohemian: { name: 'Bohemian', prompt: 'layered patterned rugs and textiles, rattan and wicker, macramé, carved rustic wood, many plants, warm terracotta, mustard and ochre tones, eclectic global decor, relaxed and collected feel' },
  japandi: { name: 'Japandi', prompt: 'Japanese and Scandinavian fusion, low natural wood furniture, linen and paper textures, wooden slat details, muted earthy tones of sand, clay and soft black, very little decor, calm and serene' },
  retro: { name: 'Retro', prompt: '1970s retro, walnut mid-century furniture with tapered legs, rust, mustard and olive green palette, velvet upholstery, mushroom and globe lamps, bold geometric patterns, warm nostalgic lighting' },
  gaming: { name: 'Gaming', prompt: 'gamer aesthetic, dark matte surfaces, purple and blue RGB LED accent lighting, neon cove lighting, sleek black furniture, tech and collectible display shelves, moody low light with glowing accents' },
  minimalist: { name: 'Minimalist', prompt: 'extremely uncluttered, white and warm-white palette, handleless hidden storage, only a few essential pieces, smooth plain surfaces, lots of empty space, soft recessed lighting' },
};

/** Credit cost and OpenAI quality per output quality. */
export const QUALITY_SPEC = {
  standard: { credits: 1, apiQuality: 'medium' },
  hd: { credits: 4, apiQuality: 'high' },
} as const;
export type QualityId = keyof typeof QUALITY_SPEC;

export const OPENAI_IMAGE_MODEL = 'gpt-image-2';

export const MAX_USER_PROMPT = 300;

export function sanitizeUserPrompt(input?: string | null) {
  return (input ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_USER_PROMPT);
}

export function buildPrompt(styleId: string, userPrompt?: string | null) {
  const style = STYLE_PROMPTS[styleId];
  if (!style) throw new Error(`Unknown style: ${styleId}`);

  const parts = [
    `Redesign the interior of this room in ${style.name} style. First identify what kind of room it is and keep it that type of room.`,
    'Keep the exact same room architecture: walls, windows, doors, ceiling height, floor plan, camera angle and perspective must stay identical.',
    'Replace and restyle furniture, decor, materials, colors, lighting and textiles only.',
    'Only add furniture and fixtures that belong in this type of room (for example no sofa in a bathroom, no bed in a kitchen).',
    'Photorealistic interior photography, natural lighting, high detail, magazine quality.',
    'No people, no text, no watermarks, no distorted furniture.',
    '',
    `Style details: ${style.prompt}.`,
  ];

  const extra = sanitizeUserPrompt(userPrompt);
  if (extra) parts.push('', `Additional requests from the homeowner: ${extra}`);

  return parts.join('\n');
}
