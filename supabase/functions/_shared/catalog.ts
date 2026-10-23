/**
 * Shared by the app and the Supabase Edge Function (keep this file free of
 * imports so both Metro and Deno can load it). The server is what actually
 * builds the prompt and charges credits in production; the app uses the same
 * values for display and for the prototype's on-device mode.
 */

/** AI prompt fragment per style. Names/descriptions/images live in src/config/styles.ts. */
export const STYLE_PROMPTS: Record<string, { name: string; prompt: string }> = {
  modern: { name: 'Modern', prompt: 'clean lines, neutral palette, sleek low-profile furniture, dark stone or marble accents, minimal ornament, warm concealed LED strip lighting' },
  scandinavian: { name: 'Scandinavian', prompt: 'light oak wood, white walls, cozy knitted textiles, soft greys and sage green, sheer curtains, functional simple furniture, plants, hygge' },
  industrial: { name: 'Industrial', prompt: 'exposed red brick wall, concrete surfaces, black metal frames and shelving, cognac leather sofa, reclaimed wood, black track lighting, black and white city prints' },
  bohemian: { name: 'Bohemian', prompt: 'layered patterned rugs and cushions, macramé wall hangings, rattan pendant light, woven poufs, rustic wood, lots of plants, warm terracotta and mustard tones, global decor' },
  japandi: { name: 'Japandi', prompt: 'Japanese-Scandinavian fusion, low natural wood furniture, linen upholstery, paper lantern, wooden slat wall, muted earthy tones, minimal Japanese art, calm and zen' },
  retro: { name: 'Retro', prompt: '1970s retro, rust velvet sofa, mustard and olive green, walnut mid-century furniture with tapered legs, mushroom lamps, bold geometric rug, rainbow arch art, record player' },
  gaming: { name: 'Gaming', prompt: 'gaming lounge, purple and blue RGB LED ambient lighting, neon cove ceiling light, dark velvet sofa, gaming desk with monitor and PC, large wall-mounted TV, collectible shelves, moody atmosphere' },
  minimalist: { name: 'Minimalist', prompt: 'extremely uncluttered, all-white and warm-white palette, low modular sofa, hidden storage, few essential pieces, lots of negative space, soft recessed lighting' },
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
    'Photorealistic interior photography, natural lighting, high detail, magazine quality.',
    'No people, no text, no watermarks, no distorted furniture.',
    '',
    `Style details: ${style.prompt}.`,
  ];

  const extra = sanitizeUserPrompt(userPrompt);
  if (extra) parts.push('', `Additional requests from the homeowner: ${extra}`);

  return parts.join('\n');
}
