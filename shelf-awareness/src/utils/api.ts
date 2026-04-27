import { getNextPublicEnv } from "@/lib/public-env";

function getApiBaseUrl() {
  return getNextPublicEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "http://localhost:54321",
  ).replace(/\/$/, "") + "/functions/v1/api-gateway";
}

export function buildGatewayUrl(path: string) {
  const normalizedBase = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
