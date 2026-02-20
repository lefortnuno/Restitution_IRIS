import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const paginationRange = useMemo(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (page > 2) pages.push("...");
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex flex-end justify-end mt-4 p-2 border-t border-gray-300 gap-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 border rounded"
      >
        <ChevronLeft />
      </button>
      {paginationRange.map((p, i) => (
        <button
          key={i}
          onClick={() => typeof p === "number" && onPageChange(p)}
          disabled={typeof p !== "number"}
          className={`px-3 py-1 border rounded ${
            p === page ? "bg-teal-500 text-white border-teal-500" : ""
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1 border rounded"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
