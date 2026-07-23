import { useState } from "react";

import { ListFilters } from "@/components/shared/list-filters";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useServerList } from "@/hooks/use-server-list";
import { apiFetch } from "@/lib/api-client";
import type { OrderDetail, OrderStatus, OrderSummary } from "@/lib/api-types";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, formatDate, formatWon } from "@/lib/status";

const PAGE_SIZE = 10;

export default function Shipments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [trackingNoInput, setTrackingNoInput] = useState("");
  const [savingTrackingNo, setSavingTrackingNo] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  const { items, total, currentPage, totalPages, setPage, loading, error, patchItem } =
    useServerList<OrderSummary>(
      "/api/orders",
      { search: debouncedSearch, status: statusFilter === "all" ? undefined : statusFilter },
      PAGE_SIZE,
    );

  function openOrderDetail(order: OrderSummary) {
    setSelectedOrder(order);
    setOrderDetail(null);
    setTrackingNoInput(order.trackingNo ?? "");
    setDetailLoading(true);
    apiFetch<OrderDetail>(`/api/orders/${order.id}`)
      .then(setOrderDetail)
      .catch(() => setOrderDetail(null))
      .finally(() => setDetailLoading(false));
  }

  async function handleStatusChange(id: number, status: OrderStatus) {
    const updated = await apiFetch<OrderDetail>(`/api/orders/${id}`, {
      method: "PATCH",
      body: { status },
    });
    patchItem((o) => o.id === id, () => updated);
    setSelectedOrder((prev) => (prev && prev.id === id ? updated : prev));
    setOrderDetail(updated);
  }

  async function handleTrackingNoSave() {
    if (!selectedOrder) return;
    setSavingTrackingNo(true);
    try {
      const updated = await apiFetch<OrderDetail>(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        body: { trackingNo: trackingNoInput },
      });
      patchItem((o) => o.id === selectedOrder.id, () => updated);
      setSelectedOrder(updated);
      setOrderDetail(updated);
      setTrackingNoInput(updated.trackingNo ?? "");
    } finally {
      setSavingTrackingNo(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">배송 관리</h1>
        <p className="text-sm text-muted-foreground">
          주문별 배송 상태와 운송장 번호를 확인합니다.
        </p>
      </div>

      <ListFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="고객명 또는 상품명 검색"
        statusValue={statusFilter}
        onStatusChange={(value) => setStatusFilter((value as OrderStatus | "all") ?? "all")}
        statusLabels={ORDER_STATUS_LABEL}
        statusWidth="w-36"
        countLabel={`총 ${total}건`}
      />

      <div className="overflow-hidden rounded-md ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow className="border-t-2 border-b-2 border-foreground/25 hover:bg-transparent">
              <TableHead className="w-28 border-r border-dashed border-border font-mono text-xs tracking-wider text-muted-foreground">
                주문번호
              </TableHead>
              <TableHead className="w-24">고객명</TableHead>
              <TableHead className="hidden sm:table-cell">상품명</TableHead>
              <TableHead className="w-28">상태</TableHead>
              <TableHead className="hidden w-36 text-right md:table-cell">운송장번호</TableHead>
              <TableHead className="hidden w-28 text-right lg:table-cell">주문일</TableHead>
              <TableHead className="w-24 text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="border-r border-dashed border-border font-mono text-xs text-muted-foreground">
                    {order.code}
                  </TableCell>
                  <TableCell className="truncate font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="hidden truncate text-muted-foreground sm:table-cell">
                    {order.productSummary}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-current"
                      style={{ color: ORDER_STATUS_COLOR[order.status] }}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-muted-foreground tabular-nums md:table-cell">
                    {order.trackingNo ?? "-"}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-muted-foreground lg:table-cell">
                    {formatDate(order.orderedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="pr-0"
                      onClick={() => openOrderDetail(order)}
                    >
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent>
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedOrder.customerName}</DialogTitle>
                <DialogDescription className="font-mono">
                  {selectedOrder.code}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">상품 내역</span>
                  {detailLoading ? (
                    <p className="text-muted-foreground">불러오는 중...</p>
                  ) : orderDetail ? (
                    <ul className="flex flex-col gap-1 rounded-md border border-dashed border-border p-2">
                      {orderDetail.items.map((item) => (
                        <li key={item.productId} className="flex justify-between">
                          <span>
                            {item.productName} × {item.quantity}
                          </span>
                          <span className="font-mono">
                            {formatWon(item.unitPrice * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{selectedOrder.productSummary}</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">운송장번호</span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={trackingNoInput}
                      onChange={(e) => setTrackingNoInput(e.target.value)}
                      placeholder="미등록"
                      className="h-7 w-36 font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={savingTrackingNo}
                      onClick={handleTrackingNoSave}
                    >
                      저장
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">주문일</span>
                  <span className="font-mono">{formatDate(selectedOrder.orderedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">상태</span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      if (value)
                        handleStatusChange(selectedOrder.id, value as OrderStatus);
                    }}
                  >
                    <SelectTrigger size="sm" className="w-32">
                      <SelectValue>
                        {(value: OrderStatus) => ORDER_STATUS_LABEL[value]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  닫기
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
