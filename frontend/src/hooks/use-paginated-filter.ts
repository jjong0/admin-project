import { useState } from "react";

export function usePaginatedFilter<T>(filtered: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function resetPage() {
    setPage(1);
  }

  return { currentPage, totalPages, paged, setPage, resetPage };
}
