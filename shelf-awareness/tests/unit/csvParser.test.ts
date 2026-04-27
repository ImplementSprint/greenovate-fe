import Papa from "papaparse";
import { parseCSVFile, parseCSVString } from "@/lib/csvParser";

describe("parseCSVString", () => {
  it("parses supported header aliases and trims values", () => {
    const result = parseCSVString(`
      item_code, quantity
      SKU-001 , 4
      SKU-002, 7
    `);

    expect(result.data).toEqual([
      { sku: "SKU-001", qty: 4 },
      { sku: "SKU-002", qty: 7 },
    ]);
    expect(result.skippedRows).toBe(0);
    expect(result.errors).toEqual([]);
  });

  it("skips empty sku, invalid qty, and negative qty rows", () => {
    const result = parseCSVString(`
      sku,qty
      ,4
      SKU-003,nope
      SKU-004,-2
      SKU-005,9
    `);

    expect(result.data).toEqual([{ sku: "SKU-005", qty: 9 }]);
    expect(result.skippedRows).toBe(3);
    expect(result.errors).toContain(
      'Row 3: invalid QTY "nope" for SKU "SKU-003"',
    );
    expect(result.errors).toContain(
      'Row 4: invalid QTY "-2" for SKU "SKU-004"',
    );
  });

  it("throws when required headers are missing", () => {
    expect(() =>
      parseCSVString(`
        product,amount
        SKU-001,5
      `),
    ).toThrow("CSV string is missing required sku / qty columns.");
  });

  it("parses a csv file and reports skipped rows", async () => {
    const file = new File(
      ["barcode,amount\nSKU-010,5\n,2\nSKU-011,-1\nSKU-012,6\n"],
      "counts.csv",
      { type: "text/csv" },
    );

    await expect(parseCSVFile(file)).resolves.toMatchObject({
      data: [
        { sku: "SKU-010", qty: 5 },
        { sku: "SKU-012", qty: 6 },
      ],
      skippedRows: 2,
    });
  });

  it("rejects file parsing when the qty header is missing", async () => {
    const file = new File(["sku,name\nSKU-001,Widget\n"], "bad.csv", {
      type: "text/csv",
    });

    await expect(parseCSVFile(file)).rejects.toThrow(
      "CSV is missing a recognised QTY column.",
    );
  });

  it("rejects file parsing when the sku header is missing", async () => {
    const file = new File(["quantity,name\n5,Widget\n"], "bad.csv", {
      type: "text/csv",
    });

    await expect(parseCSVFile(file)).rejects.toThrow(
      "CSV is missing a recognised SKU column.",
    );
  });

  it("reports malformed rows from string parsing", () => {
    const result = parseCSVString('sku,qty\n"SKU-001,5');

    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects when papaparse invokes the file error callback", async () => {
    const parseSpy = jest
      .spyOn(Papa, "parse")
      .mockImplementation((_input, config) => {
        if (
          config &&
          typeof config === "object" &&
          "error" in config &&
          typeof config.error === "function"
        ) {
          config.error(new Error("disk failed"));
        }

        return {} as ReturnType<typeof Papa.parse>;
      });

    const file = new File(["sku,qty\nSKU-001,1\n"], "broken.csv", {
      type: "text/csv",
    });

    await expect(parseCSVFile(file)).rejects.toThrow(
      "PapaParse failed to read file: disk failed",
    );

    parseSpy.mockRestore();
  });
});
