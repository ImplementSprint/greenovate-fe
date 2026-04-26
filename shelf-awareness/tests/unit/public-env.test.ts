describe("public-env", () => {
  const mutableEnv = process.env as Record<
    string,
    string | undefined
  >;
  const originalNodeEnv = process.env.NODE_ENV;
  const envKey = "NEXT_PUBLIC_TEST_VALUE";

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete mutableEnv.NODE_ENV;
    } else {
      mutableEnv.NODE_ENV = originalNodeEnv;
    }
    delete mutableEnv[envKey];
    jest.resetModules();
  });

  it("returns an explicit env value when present", () => {
    mutableEnv.NODE_ENV = "production";
    mutableEnv[envKey] = " configured ";

    jest.isolateModules(() => {
      const { getNextPublicEnv } =
        jest.requireActual<typeof import("../../src/lib/public-env")>(
          "../../src/lib/public-env",
        );
      expect(getNextPublicEnv(envKey, "fallback")).toBe("configured");
    });
  });

  it("returns the development fallback outside production", () => {
    mutableEnv.NODE_ENV = "development";

    jest.isolateModules(() => {
      const { getNextPublicEnv } =
        jest.requireActual<typeof import("../../src/lib/public-env")>(
          "../../src/lib/public-env",
        );
      expect(getNextPublicEnv(envKey, "fallback-value")).toBe(
        "fallback-value",
      );
    });
  });

  it("throws in production when the env value is missing", () => {
    mutableEnv.NODE_ENV = "production";

    jest.isolateModules(() => {
      const { getNextPublicEnv } =
        jest.requireActual<typeof import("../../src/lib/public-env")>(
          "../../src/lib/public-env",
        );
      expect(() => getNextPublicEnv(envKey)).toThrow(
        `${envKey} is required in production.`,
      );
    });
  });

  it("returns an empty string for missing optional env values", () => {
    mutableEnv.NODE_ENV = "test";

    jest.isolateModules(() => {
      const { getOptionalNextPublicEnv } =
        jest.requireActual<typeof import("../../src/lib/public-env")>(
          "../../src/lib/public-env",
        );
      expect(getOptionalNextPublicEnv(envKey)).toBe("");
    });
  });
});
