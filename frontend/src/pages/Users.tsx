import { useMemo, useState } from "react";
import { DownloadIcon } from "lucide-react";

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
  generateMockUsers,
  USER_STATUS_LABEL,
  type MockUser,
  type UserStatus,
} from "@/lib/mock-users";

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<
  UserStatus,
  "default" | "secondary" | "destructive"
> = {
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
};

const ALL_USERS = generateMockUsers();

function exportToCsv(users: MockUser[]) {
  const header = [
    "ID",
    "이름",
    "이메일",
    "전화번호",
    "상태",
    "가입일",
    "최근 로그인",
  ];
  const rows = users.map((u) => [
    u.id,
    u.name,
    u.email,
    u.phone,
    USER_STATUS_LABEL[u.status],
    u.joinedAt,
    u.lastLoginAt,
  ]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const bom = String.fromCharCode(0xfeff);
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Users() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [users, setUsers] = useState(ALL_USERS);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesKeyword =
        !keyword ||
        u.name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const { currentPage, totalPages, paged, setPage, resetPage } =
    usePaginatedFilter(filtered, PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    resetPage();
  }

  function handleStatusFilterChange(value: UserStatus | "all") {
    setStatusFilter(value);
    resetPage();
  }

  function handleStatusChange(id: string, status: UserStatus) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    setSelectedUser((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    );
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
          onClick={() => exportToCsv(filtered)}
        >
          <DownloadIcon />
          CSV 내보내기
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="이름 또는 이메일 검색"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            handleStatusFilterChange((value as UserStatus | "all" | null) ?? "all")
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="상태">
              {(value: UserStatus | "all") =>
                value === "all" ? "전체 상태" : USER_STATUS_LABEL[value]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">휴면</SelectItem>
            <SelectItem value="suspended">정지</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground sm:ml-auto">
          총 {filtered.length}명
        </span>
      </div>

      <div className="overflow-hidden rounded-md ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow className="border-t-2 border-b-2 border-foreground/25 hover:bg-transparent">
              <TableHead className="border-r border-dashed border-border font-mono text-xs tracking-wider text-muted-foreground">
                번호
              </TableHead>
              <TableHead>이름</TableHead>
              <TableHead className="hidden md:table-cell">이메일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="hidden lg:table-cell">가입일</TableHead>
              <TableHead className="hidden xl:table-cell">최근 로그인</TableHead>
              <TableHead className="pr-4.5 text-right">액션</TableHead>
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
              paged.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="border-r border-dashed border-border font-mono text-xs text-muted-foreground">
                    {user.id}
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[user.status]}>
                      {USER_STATUS_LABEL[user.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden font-mono text-muted-foreground lg:table-cell">
                    {user.joinedAt}
                  </TableCell>
                  <TableCell className="hidden font-mono text-muted-foreground xl:table-cell">
                    {user.lastLoginAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
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
                  {selectedUser.id}
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
                  <span className="font-mono">{selectedUser.joinedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">최근 로그인</span>
                  <span className="font-mono">{selectedUser.lastLoginAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">상태</span>
                  <Select
                    value={selectedUser.status}
                    onValueChange={(value) => {
                      if (value) handleStatusChange(selectedUser.id, value as UserStatus);
                    }}
                  >
                    <SelectTrigger size="sm" className="w-28">
                      <SelectValue>
                        {(value: UserStatus) => USER_STATUS_LABEL[value]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">휴면</SelectItem>
                      <SelectItem value="suspended">정지</SelectItem>
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
