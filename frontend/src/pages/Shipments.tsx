import { useMemo, useState } from "react";

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
import { usePaginatedFilter } from "@/hooks/use-paginated-filter";
import {
  ALL_ORDERS,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  type MockOrder,
  type OrderStatus,
} from "@/lib/mock-orders";

const PAGE_SIZE = 10;

export default function Shipments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);
  const [orders, setOrders] = useState(ALL_ORDERS);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesKeyword =
        !keyword ||
        o.customerName.toLowerCase().includes(keyword) ||
        o.productName.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const { currentPage, totalPages, paged, setPage, resetPage } =
    usePaginatedFilter(filtered, PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    resetPage();
  }

  function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSelectedOrder((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    );
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
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter((value as OrderStatus | "all" | null) ?? "all");
            resetPage();
          }}
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
            <SelectItem value="paid">결제완료</SelectItem>
            <SelectItem value="preparing">상품준비중</SelectItem>
            <SelectItem value="shipping">배송중</SelectItem>
            <SelectItem value="delivered">배송완료</SelectItem>
            <SelectItem value="cancelled">취소·반품</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground sm:ml-auto">
          총 {filtered.length}건
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
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="border-r border-dashed border-border font-mono text-xs text-muted-foreground">
                    {order.id}
                  </TableCell>
                  <TableCell className="truncate font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="hidden truncate text-muted-foreground sm:table-cell">
                    {order.productName}
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
                    {order.orderedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="pr-0"
                      onClick={() => setSelectedOrder(order)}
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
                  {selectedOrder.id}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">상품명</span>
                  <span>{selectedOrder.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">운송장번호</span>
                  <span className="font-mono">{selectedOrder.trackingNo ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">주문일</span>
                  <span className="font-mono">{selectedOrder.orderedAt}</span>
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
                      <SelectItem value="paid">결제완료</SelectItem>
                      <SelectItem value="preparing">상품준비중</SelectItem>
                      <SelectItem value="shipping">배송중</SelectItem>
                      <SelectItem value="delivered">배송완료</SelectItem>
                      <SelectItem value="cancelled">취소·반품</SelectItem>
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
