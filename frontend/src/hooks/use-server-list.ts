import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/api-types";

export function useServerList<T>(
  endpoint: string,
  params: Record<string, string | undefined>,
  pageSize = 10,
) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params);

  // Reset to page 1 whenever the filters change. Adjusting state during render
  // (React's recommended pattern for "reset state when a prop changes") avoids
  // the extra render pass a useEffect-based reset would cause.
  const [prevParamsKey, setPrevParamsKey] = useState(paramsKey);
  if (paramsKey !== prevParamsKey) {
    setPrevParamsKey(paramsKey);
    if (page !== 1) setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    // Data fetch: loading/error must reset synchronously when the request
    // (re)starts, before the async response arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    apiFetch<PaginatedResponse<T>>(endpoint, {
      params: { ...JSON.parse(paramsKey), page: String(page), pageSize: String(pageSize) },
    })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, page, pageSize, paramsKey]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function patchItem(predicate: (item: T) => boolean, updater: (item: T) => T) {
    setItems((prev) => prev.map((item) => (predicate(item) ? updater(item) : item)));
  }

  return { items, total, totalPages, currentPage: page, setPage, loading, error, patchItem };
}
