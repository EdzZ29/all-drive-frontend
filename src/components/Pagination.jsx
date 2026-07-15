import { ChevronLeft, ChevronRight } from 'lucide-react';

const PER_PAGE_OPTIONS = [5, 10, 15, 20, 25, 30];

// Reusable pagination bar: "Items per page" selector + Prev/Next + page count.
// Controlled — the parent owns `page` and `perPage` state.
const Pagination = ({
  page,
  perPage,
  totalItems,
  onPageChange,
  onPerPageChange,
  options = PER_PAGE_OPTIONS,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const current = Math.min(page, totalPages);
  const start = totalItems === 0 ? 0 : (current - 1) * perPage + 1;
  const end = Math.min(current * perPage, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Items per page</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          {options.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="hidden text-gray-400 sm:inline">
          {start}–{end} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, current - 1))}
          disabled={current <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} />
          Prev
        </button>
        <span className="text-gray-500">
          Page {current} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, current + 1))}
          disabled={current >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
