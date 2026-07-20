import { useMemo, useState } from "react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Badge } from "@/components/ui/badge";
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
  type OrderStatus,
} from "@/lib/mock-orders";

const PAGE_SIZE = 10;

export default function Shipments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return ALL_ORDERS.filter((o) => {
      const matchesKeyword =
        !keyword ||
        o.customerName.toLowerCase().includes(keyword) ||
        o.productName.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [search, statusFilter]);

  const { currentPage, totalPages, paged, setPage, resetPage } =
    usePaginatedFilter(filtered, PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    resetPage();
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
              <TableHead className="border-r border-dashed border-border font-mono text-xs tracking-wider text-muted-foreground">
                주문번호
              </TableHead>
              <TableHead>고객명</TableHead>
              <TableHead className="hidden sm:table-cell">상품명</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="hidden text-right md:table-cell">운송장번호</TableHead>
              <TableHead className="hidden text-right lg:table-cell">주문일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
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
                  <TableCell className="font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
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
    </div>
  );
}
