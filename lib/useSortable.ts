import { useState, useMemo } from "react";

type Direction = "asc" | "desc";

/**
 * Generic sort hook for any array.
 *
 * ```tsx
 * const { sorted, sortKey, sortDir, toggleSort } = useSortable(rows, "lastName");
 *
 * <Th sort={sortKey === "lastName" ? sortDir : null} onSort={() => toggleSort("lastName")}>
 *   Last Name
 * </Th>
 * ```
 */
export function useSortable<T extends Record<string, unknown>>(
  data: T[],
  defaultKey: keyof T,
  defaultDir: Direction = "asc"
) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<Direction>(defaultDir);

  function toggleSort(key: keyof T) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, toggleSort };
}
