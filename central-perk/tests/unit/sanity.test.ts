import { projectId, supabaseUrl, publicAnonKey } from "@/utils/supabase/info";

describe("Supabase Info Utility", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should have basic properties defined", () => {
    expect(typeof projectId).toBe("string");
    expect(typeof supabaseUrl).toBe("string");
    expect(typeof publicAnonKey).toBe("string");
  });

  it("should generate a supabaseUrl with projectId", () => {
    if (projectId) {
      expect(supabaseUrl).toContain(projectId);
    }
  });

  it("should derive projectId from URL if explicit ID is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://xyz123.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    
    const info = require("@/utils/supabase/info");
    expect(info.projectId).toBe("xyz123");
  });

  it("should pick publicAnonKey from env vars", () => {
    // Clear higher precedence keys
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    const info = require("@/utils/supabase/info");
    expect(info.publicAnonKey).toBe("test-key");
  });
});
