const isProduction = process.env.NODE_ENV === "production";

function readEnv(name: string): string {
  return (process.env[name] || "").trim();
}

function requiredMessage(name: string): string {
  return `${name} is required in production.`;
}

export function getNextPublicEnv(
  name: string,
  developmentFallback?: string,
): string {
  const value = readEnv(name);
  if (value) return value;

  if (!isProduction && developmentFallback) {
    return developmentFallback;
  }

  throw new Error(requiredMessage(name));
}

export function getOptionalNextPublicEnv(name: string): string {
  return readEnv(name);
}
