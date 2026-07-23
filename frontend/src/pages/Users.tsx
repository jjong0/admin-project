import { useState } from "react";
import { DownloadIcon } from "lucide-react";

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
import { apiDownload, apiFetch, ApiError } from "@/lib/api-client";
import type { Customer, CustomerStatus } from "@/lib/api-types";
import { CUSTOMER_STATUS_LABEL, formatDate } from "@/lib/status";

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<
  CustomerStatus,
  "default" | "secondary" | "destructive"
> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  SUSPENDED: "destructive",
};

export default function Users() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const { items, total, currentPage, totalPages, setPage, loading, error, patchItem } =
    useServerList<Customer>(
      "/api/customers",
      { search: debouncedSearch, status: statusFilter === "all" ? undefined : statusFilter },
      PAGE_SIZE,
    );

  async function handleStatusChange(id: number, status: CustomerStatus) {
    const updated = await apiFetch<Customer>(`/api/customers/${id}`, {
      method: "PATCH",
      body: { status },
    });
    patchItem((c) => c.id === id, () => updated);
    setSelectedUser((prev) => (prev && prev.id === id ? updated : prev));
  }

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await apiDownload(
        "/api/customers/export",
        { search: debouncedSearch, status: statusFilter === "all" ? undefined : statusFilter },
        `customers-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch (err) {
      setExportError(err instanceof ApiError ? err.message : "내보내기에 실패했습니다.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">고객 관리</h1>
          <p className="text-sm text-muted-foreground">
            문의 응대와 계정 상태 변경은 여기서 처리합니다.
          </p>
        </div>
        <Button
          variant="outline"
          className="self-start sm:self-auto"
          onClick={handleExport}
          disabled={exporting}
        >
          <DownloadIcon />
          {exporting ? "내보내는 중..." : "CSV 내보내기"}
        </Button>
      </div>

      {exportError && <p className="text-sm text-destructive">{exportError}</p>}

      <ListFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="이름 또는 이메일 검색"
        statusValue={statusFilter}
        onStatusChange={(value) => setStatusFilter((value as CustomerStatus | "all") ?? "all")}
        statusLabels={CUSTOMER_STATUS_LABEL}
        countLabel={`총 ${total}명`}
      />

      <div className="overflow-hidden rounded-md ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow className="border-t-2 border-b-2 border-foreground/25 hover:bg-transparent">
              <TableHead className="w-20 border-r border-dashed border-border font-mono text-xs tracking-wider text-muted-foreground">
                번호
              </TableHead>
              <TableHead className="w-28">이름</TableHead>
              <TableHead className="hidden md:table-cell">이메일</TableHead>
              <TableHead className="w-20">상태</TableHead>
              <TableHead className="hidden w-28 lg:table-cell">가입일</TableHead>
              <TableHead className="w-24 text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="border-r border-dashed border-border font-mono text-xs text-muted-foreground">
                    {user.code}
                  </TableCell>
                  <TableCell className="truncate font-medium">{user.name}</TableCell>
                  <TableCell className="hidden truncate text-muted-foreground md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[user.status]}>
                      {CUSTOMER_STATUS_LABEL[user.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden font-mono text-muted-foreground lg:table-cell">
                    {formatDate(user.joinedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="pr-0"
                      onClick={() => setSelectedUser(user)}
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
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedUser.name}</DialogTitle>
                <DialogDescription className="font-mono">
                  {selectedUser.code}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">이메일</span>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">전화번호</span>
                  <span className="font-mono">{selectedUser.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">가입일</span>
                  <span className="font-mono">{formatDate(selectedUser.joinedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">상태</span>
                  <Select
                    value={selectedUser.status}
                    onValueChange={(value) => {
                      if (value) handleStatusChange(selectedUser.id, value as CustomerStatus);
                    }}
                  >
                    <SelectTrigger size="sm" className="w-28">
                      <SelectValue>
                        {(value: CustomerStatus) => CUSTOMER_STATUS_LABEL[value]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CUSTOMER_STATUS_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
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
