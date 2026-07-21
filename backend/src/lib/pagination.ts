export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function parseSearch(query: Record<string, unknown>) {
  return typeof query.search === "string" ? query.search.trim() : "";
}

export function parseFilter<T extends string>(
  query: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const value = query[key];
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}
