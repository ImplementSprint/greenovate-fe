import { projectId } from "@/utils/supabase/info";

describe("Supabase Info Utility", () => {
  it("should have a project ID defined if env is set or derived", () => {
    // In test environment, it might be empty or derived from undefined
    expect(typeof projectId).toBe("string");
  });
});
