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
import { cn } from "@/lib/utils";
import {
  ALL_PRODUCTS,
  CATEGORIES,
  LOW_STOCK_THRESHOLD,
  PRODUCT_STATUS_LABEL,
  type MockProduct,
  type ProductStatus,
} from "@/lib/mock-products";

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<
  ProductStatus,
  "default" | "secondary" | "destructive"
> = {
  selling: "default",
  hidden: "secondary",
  soldout: "destructive",
};

function formatWon(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);
  const [products, setProducts] = useState(ALL_PRODUCTS);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesKeyword = !keyword || p.name.toLowerCase().includes(keyword);
      const matchesCategory = category === "all" || p.category === category;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesKeyword && matchesCategory && matchesStatus;
    });
  }, [products, search, category, statusFilter]);

  const { currentPage, totalPages, paged, setPage, resetPage } =
    usePaginatedFilter(filtered, PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    resetPage();
  }

  function handleStatusChange(id: string, status: ProductStatus) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    setSelectedProduct((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">상품 관리</h1>
        <p className="text-sm text-muted-foreground">
          등록된 상품의 가격과 재고, 노출 상태를 확인합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="상품명 검색"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value ?? "all");
            resetPage();
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="카테고리">
              {(value: string) => (value === "all" ? "전체 카테고리" : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter((value as ProductStatus | "all" | null) ?? "all");
            resetPage();
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="상태">
              {(value: ProductStatus | "all") =>
                value === "all" ? "전체 상태" : PRODUCT_STATUS_LABEL[value]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="selling">판매중</SelectItem>
            <SelectItem value="soldout">품절</SelectItem>
            <SelectItem value="hidden">숨김</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground sm:ml-auto">
          총 {filtered.length}개
        </span>
      </div>

      <div className="overflow-hidden rounded-md ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow className="border-t-2 border-b-2 border-foreground/25 hover:bg-transparent">
              <TableHead className="w-20 border-r border-dashed border-border font-mono text-xs tracking-wider text-muted-foreground">
                번호
              </TableHead>
              <TableHead>상품명</TableHead>
              <TableHead className="hidden w-24 md:table-cell">카테고리</TableHead>
              <TableHead className="w-28 text-right">판매가</TableHead>
              <TableHead className="w-16 text-right">재고</TableHead>
              <TableHead className="w-20">상태</TableHead>
              <TableHead className="hidden w-28 text-right lg:table-cell">수정일</TableHead>
              <TableHead className="w-24 text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="border-r border-dashed border-border font-mono text-xs text-muted-foreground">
                    {product.id}
                  </TableCell>
                  <TableCell className="truncate font-medium">{product.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatWon(product.price)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono tabular-nums",
                      product.stock <= LOW_STOCK_THRESHOLD
                        ? "text-destructive font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {product.stock}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[product.status]}>
                      {PRODUCT_STATUS_LABEL[product.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-muted-foreground lg:table-cell">
                    {product.updatedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="pr-0"
                      onClick={() => setSelectedProduct(product)}
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
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent>
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription className="font-mono">
                  {selectedProduct.id}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">카테고리</span>
                  <span>{selectedProduct.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">판매가</span>
                  <span className="font-mono">{formatWon(selectedProduct.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">재고</span>
                  <span className="font-mono">{selectedProduct.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">수정일</span>
                  <span className="font-mono">{selectedProduct.updatedAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">상태</span>
                  <Select
                    value={selectedProduct.status}
                    onValueChange={(value) => {
                      if (value)
                        handleStatusChange(selectedProduct.id, value as ProductStatus);
                    }}
                  >
                    <SelectTrigger size="sm" className="w-28">
                      <SelectValue>
                        {(value: ProductStatus) => PRODUCT_STATUS_LABEL[value]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selling">판매중</SelectItem>
                      <SelectItem value="soldout">품절</SelectItem>
                      <SelectItem value="hidden">숨김</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
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
