export const fetchInterestRows = async <TRow,>(
  endpoint: string,
  token: string,
): Promise<TRow[]> => {
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = response.ok ? await response.json() : { data: [] };
  return (payload?.data ?? []) as TRow[];
};

export const mapInterestRows = <TRow,>(
  rows: TRow[],
  getKey: (row: TRow) => string,
  getValue: (row: TRow) => number,
) => {
  const mapped = new Map<string, number>();
  rows.forEach((row) => mapped.set(getKey(row), getValue(row)));
  return mapped;
};
