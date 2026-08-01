import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const base =
  "inline-flex h-9 min-w-[36px] items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function Pagination({ current, total, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 || total <= 0) return null;

  const maxVisible = 5;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const go = (page) =>
    onPageChange(Math.min(totalPages, Math.max(1, page)));

  const activeCls = "border-primary-600 bg-primary-600 text-white";
  const inactiveCls =
    "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";
  const disabledCls = "cursor-not-allowed opacity-50";

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => go(current - 1)}
        disabled={current <= 1}
        className={`${base} ${current <= 1 ? disabledCls : inactiveCls}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <span className="px-1 py-1 text-xs text-gray-500 dark:text-gray-400">
          <MoreHorizontal className="h-4 w-4" />
        </span>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => go(p)}
          className={`${base} ${p === current ? activeCls : inactiveCls}`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <span className="px-1 py-1 text-xs text-gray-500 dark:text-gray-400">
          <MoreHorizontal className="h-4 w-4" />
        </span>
      )}

      <button
        type="button"
        onClick={() => go(current + 1)}
        disabled={current >= totalPages}
        className={`${base} ${
          current >= totalPages ? disabledCls : inactiveCls
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
