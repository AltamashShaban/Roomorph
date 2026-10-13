/**
 * POST /functions/v1/delete-account
 * Deletes the caller's images, then their account. Profiles, ledger and
 * generations are removed by `on delete cascade`. Required by Apple and Google:
 * users must be able to delete their account from inside the app.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: cors });

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const { data } = token ? await admin.auth.getUser(token) : { data: { user: null } };
  const user = data?.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401, headers: cors });

  // Remove every stored image under <user id>/, a page at a time.
  const bucket = admin.storage.from('redesigns');
  for (;;) {
    const { data: files, error } = await bucket.list(user.id, { limit: 100 });
    if (error) return Response.json({ error: 'storage_error' }, { status: 500, headers: cors });
    if (!files?.length) break;
    const { error: removeError } = await bucket.remove(files.map((f) => `${user.id}/${f.name}`));
    if (removeError) return Response.json({ error: 'storage_error' }, { status: 500, headers: cors });
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return Response.json({ error: 'delete_failed' }, { status: 500, headers: cors });

  return Response.json({ ok: true }, { headers: cors });
});
