// The prompt is built from one shared file so the app and the server never drift.
export { buildPrompt, MAX_USER_PROMPT, sanitizeUserPrompt } from '../../supabase/functions/_shared/catalog';
