export interface BackendHealthResponse {
  service: string;
  framework: string;
  status: string;
  timestamp: string;
}

export async function fetchBackendHealth() {
  return {
    service: "shelf-awareness",
    framework: "Next.js",
    status: "frontend-only",
    timestamp: new Date().toISOString(),
  } satisfies BackendHealthResponse;
}
