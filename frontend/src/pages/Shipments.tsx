import { useState } from "react";

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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">배송 관리</h1>
        <p className="text-sm text-muted-foreground">
          주문별 배송 상태와 운송장 번호를 확인합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="고객명 또는 상품명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter((value as OrderStatus | "all" | null) ?? "all")
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="상태">
              {(value: OrderStatus | "all") =>
                value === "all" ? "전체 상태" : ORDER_STATUS_LABEL[value]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="PAID">결제완료</SelectItem>
            <SelectItem value="PREPARING">상품준비중</SelectItem>
            <SelectItem value="SHIPPING">배송중</SelectItem>
            <SelectItem value="DELIVERED">배송완료</SelectItem>
            <SelectItem value="CANCELLED">취소·반품</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground sm:ml-auto">
          총 {total}건
        </span>
      </div>

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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">운송장번호</span>
                  <span className="font-mono">{selectedOrder.trackingNo ?? "-"}</span>
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
                      <SelectItem value="PAID">결제완료</SelectItem>
                      <SelectItem value="PREPARING">상품준비중</SelectItem>
                      <SelectItem value="SHIPPING">배송중</SelectItem>
                      <SelectItem value="DELIVERED">배송완료</SelectItem>
                      <SelectItem value="CANCELLED">취소·반품</SelectItem>
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
