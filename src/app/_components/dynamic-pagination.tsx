import If from "./ui/if";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type Props = {
  totalElements: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pagesToSeen: number;
  elementsPerPage?: number;
};

//TODO: Fix later generation of pages
export default function DynamicPagination({
  totalElements,
  currentPage = 1,
  onPageChange,
  pagesToSeen,
  elementsPerPage = 10,
}: Props) {
  const totalPages = Math.ceil(totalElements / elementsPerPage);
  const startPage = Math.max(1, currentPage - pagesToSeen + 1);
  const endPage = Math.min(totalPages, currentPage + pagesToSeen);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            href="#"
            onClick={() => onPageChange(currentPage - 1)}
          />
        </PaginationItem>
        <If condition={startPage > 1}>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </If>
        {Array.from(
          { length: endPage - startPage + 1 },
          (_, index) => startPage + index,
        ).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={() => onPageChange(page)}
              className={page === currentPage ? "bg-gray-100" : ""}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <If condition={endPage < totalPages}>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </If>
        <PaginationItem>
          <PaginationNext
            className={
              currentPage === totalPages || totalPages === 0
                ? "pointer-events-none opacity-50"
                : ""
            }
            href="#"
            onClick={() => onPageChange(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
