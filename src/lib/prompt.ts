import { getStyle } from '@/config/styles';

export const MAX_USER_PROMPT = 300;

export function sanitizeUserPrompt(input?: string) {
  return (input ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_USER_PROMPT);
}

/**
 * Builds the final AI prompt. In production this runs server-side
 * (Supabase Edge Function) — the same function can be copied there as-is.
 */
export function buildPrompt(styleId: string, userPrompt?: string) {
  const style = getStyle(styleId);
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
