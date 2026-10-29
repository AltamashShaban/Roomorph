// app.json holds the config; this file only adds a safety check before every build.
// EXPO_PUBLIC_ values are copied into the app, so a prototype OpenAI key set here would
// ship to every phone and anyone could spend from it. Refuse to build in that case.
module.exports = ({ config }) => {
  const prototypeKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (prototypeKey && (process.env.EAS_BUILD || process.env.EXPO_PUBLIC_SUPABASE_URL)) {
    throw new Error(
      'EXPO_PUBLIC_OPENAI_API_KEY is set. Remove it from .env.local / EAS environment variables: ' +
        'with the backend on, the OpenAI key belongs only in Supabase secrets.',
    );
  }
  return config;
};
