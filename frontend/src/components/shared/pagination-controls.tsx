import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text="이전"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(1, currentPage - 1));
            }}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === currentPage}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            text="다음"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.min(totalPages, currentPage + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
