const isProduction = process.env.NODE_ENV === "production";

const missingEnvValue = (name: string) =>
  `Missing required environment variable: ${name}`;

const readEnv = (name: string): string =>
  (process.env[name] || "").trim();

const fallbackSupabaseUrl = isProduction
  ? "https://missing-next-public-supabase-url.invalid"
  : "http://localhost:54321";

const fallbackAnonKey = isProduction
  ? "missing-next-public-supabase-anon-key"
  : "dev-anon-key";

export const supabaseUrl =
  readEnv("NEXT_PUBLIC_SUPABASE_URL") || fallbackSupabaseUrl;

export const publicAnonKey =
  readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || fallbackAnonKey;

export const projectId = (() => {
  try {
    return new URL(supabaseUrl).hostname.split(".")[0] || "local";
  } catch {
    return "local";
  }
})();

export function assertSupabaseEnvConfigured() {
  if (!readEnv("NEXT_PUBLIC_SUPABASE_URL")) {
    throw new Error(missingEnvValue("NEXT_PUBLIC_SUPABASE_URL"));
  }

  if (!readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    throw new Error(
      missingEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    );
  }
}
