import React, { ReactNode, useMemo, useState } from 'react';
import '../../styles/variables.css';
import './Table.css';
import { cn } from '../../utils/cn';
import type { Rounded } from '../../utils/types';

/* ── Types ──────────────────────────────────────────────────── */

export interface TableColumn<T = any> {
  /** Unique column identifier — also used as fallback dataIndex */
  key: string;
  /** Header cell content */
  title: ReactNode;
  /** Row field to read (defaults to key) */
  dataIndex?: string;
  /** Custom cell renderer — overrides default value display */
  render?: (value: any, row: T, index: number) => ReactNode;
  /** Column width — CSS string or pixel number */
  width?: string | number;
  /** Horizontal text alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable click-to-sort on this column */
  sortable?: boolean;
  /** Pin column to left or right edge */
  fixed?: 'left' | 'right';
}

export type TableSortDir = 'asc' | 'desc';

export interface TablePaginationConfig {
  /** Rows per page (default: 10) */
  pageSize?: number;
  /** Override total item count — set this for server-side pagination */
  total?: number;
  /** Show "X–Y / Z" counter (default: true) */
  showTotal?: boolean;
  /** Render a page-size selector with these options */
  pageSizeOptions?: number[];
  /** Called on page or page-size change */
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableProps<T = any> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Table rows */
  data: T[];
  /** Field name or function for unique row keys */
  rowKey?: string | ((row: T) => string | number);
  /** Show skeleton rows */
  loading?: boolean;
  /** Number of skeleton rows (default: 5) */
  loadingRows?: number;
  /** Border every cell and the table outline */
  bordered?: boolean;
  /** Alternate background on even rows */
  striped?: boolean;
  /** Highlight rows on hover */
  hoverable?: boolean;
  /** Cell padding preset */
  size?: 'sm' | 'md' | 'lg';
  /** Content when data is empty */
  empty?: ReactNode;
  /** Caption text below the table */
  caption?: string;
  /** Keep header row fixed while body scrolls */
  stickyHeader?: boolean;
  /** Called when a sortable header is clicked */
  onSort?: (key: string, dir: TableSortDir) => void;
  /** className on the outermost wrapper element */
  className?: string;
  /** Border-radius preset — visible when bordered={true} */
  rounded?: Rounded;

  /* ── Custom colors ── */
  /** Header background colour */
  headerBg?: string;
  /** Header text colour */
  headerColor?: string;
  /** Table body background colour */
  bodyBg?: string;
  /** Table body text colour */
  bodyColor?: string;
  /** Row hover background colour */
  hoverBg?: string;

  /* ── Layout ── */
  /** Fix the table height and enable inner vertical scroll */
  scrollY?: string | number;
  /** Table stretches to fill its container (default: true) */
  fullWidth?: boolean;

  /* ── Pagination ── */
  pagination?: TablePaginationConfig;
}

/* ── Helpers ────────────────────────────────────────────────── */

const SKELETON_WIDTHS = ['long', 'short', 'medium', 'long', 'medium'] as const;

function getRowKey<T>(
  row: T,
  rowKey: TableProps<T>['rowKey'],
  index: number,
): string | number {
  if (!rowKey) return index;
  if (typeof rowKey === 'function') return rowKey(row);
  return (row as any)[rowKey as string] ?? index;
}

function colWidthPx(width?: string | number): number {
  if (width == null) return 0;
  if (typeof width === 'number') return width;
  const n = parseInt(width, 10);
  return isNaN(n) ? 0 : n;
}

function getPaginationRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

/* ── Main component ─────────────────────────────────────────── */

export function Table<T = any>({
  columns,
  data,
  rowKey,
  loading = false,
  loadingRows = 5,
  bordered = false,
  striped = false,
  hoverable = false,
  size = 'md',
  empty,
  caption,
  stickyHeader = false,
  onSort,
  className,
  headerBg,
  headerColor,
  bodyBg,
  bodyColor,
  hoverBg,
  scrollY,
  fullWidth = true,
  pagination,
  rounded,
}: TableProps<T>) {
  /* ── Sort state ── */
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<TableSortDir>('asc');

  /* ── Pagination state ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(
    pagination?.pageSize ?? 10,
  );

  /* ── Sort handler ── */
  const handleSort = (key: string) => {
    const nextDir: TableSortDir =
      sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(nextDir);
    setCurrentPage(1);
    onSort?.(key, nextDir);
  };

  /* ── Sorted data ── */
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    const field = col.dataIndex ?? col.key;
    return [...data].sort((a, b) => {
      const av = (a as any)[field];
      const bv = (b as any)[field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  /* ── Pagination calculations ── */
  const hasPagination = !!pagination;
  const pageSize = pagination?.pageSize ?? currentPageSize;
  const total = pagination?.total ?? sortedData.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Server-side mode: parent passes pre-sliced data and sets total explicitly
  const isServerSide =
    pagination?.total != null && pagination.total !== data.length;

  const displayData = useMemo(() => {
    if (!hasPagination || isServerSide) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, hasPagination, isServerSide, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    pagination?.onChange?.(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    setCurrentPageSize(newSize);
    setCurrentPage(1);
    pagination?.onChange?.(1, newSize);
  };

  /* ── Fixed column offset metadata ── */
  const fixedMeta = useMemo(() => {
    const meta = columns.map(() => ({
      leftOffset: 0,
      rightOffset: 0,
      isLastLeft: false,
      isFirstRight: false,
    }));

    let leftOff = 0;
    const leftIdxs: number[] = [];
    columns.forEach((col, i) => {
      if (col.fixed === 'left') {
        meta[i].leftOffset = leftOff;
        leftOff += colWidthPx(col.width);
        leftIdxs.push(i);
      }
    });
    if (leftIdxs.length) meta[leftIdxs[leftIdxs.length - 1]].isLastLeft = true;

    let rightOff = 0;
    const rightIdxs: number[] = [];
    for (let i = columns.length - 1; i >= 0; i--) {
      if (columns[i].fixed === 'right') {
        meta[i].rightOffset = rightOff;
        rightOff += colWidthPx(columns[i].width);
        rightIdxs.push(i);
      }
    }
    if (rightIdxs.length)
      meta[rightIdxs[rightIdxs.length - 1]].isFirstRight = true;

    return meta;
  }, [columns]);

  /* ── Dynamic CSS variables for custom colors ── */
  const colorVars = {
    ...(headerBg && { '--dsg-table-header-bg': headerBg }),
    ...(headerColor && { '--dsg-table-header-color': headerColor }),
    ...(bodyBg && { '--dsg-table-body-bg': bodyBg }),
    ...(bodyColor && { '--dsg-table-body-color': bodyColor }),
    ...(hoverBg && { '--dsg-table-hover-bg': hoverBg }),
  } as React.CSSProperties;

  /* ── Scroll style ── */
  const scrollStyle: React.CSSProperties =
    scrollY != null
      ? {
          maxHeight:
            typeof scrollY === 'number' ? `${scrollY}px` : scrollY,
          overflowY: 'auto' as const,
        }
      : {};

  const isEmpty = !loading && displayData.length === 0;
  const hasFixed = columns.some((c) => c.fixed);
  const enableStickyHeader = stickyHeader || scrollY != null;

  /* ── Cell style builder ── */
  const getCellStyle = (col: TableColumn<T>, ci: number): React.CSSProperties => {
    const fm = fixedMeta[ci];
    return {
      ...(col.width != null
        ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
        : undefined),
      ...(col.fixed === 'left' ? { left: fm.leftOffset } : undefined),
      ...(col.fixed === 'right' ? { right: fm.rightOffset } : undefined),
    };
  };

  /* ── Fixed cell class builder ── */
  const getFixedCellClass = (col: TableColumn<T>, ci: number, isHeader: boolean) =>
    cn(
      col.fixed === 'left' && (isHeader ? 'dsg-table__th--fixed-left' : 'dsg-table__td--fixed-left'),
      col.fixed === 'right' && (isHeader ? 'dsg-table__th--fixed-right' : 'dsg-table__td--fixed-right'),
      fixedMeta[ci].isLastLeft && 'dsg-table__cell--last-left',
      fixedMeta[ci].isFirstRight && 'dsg-table__cell--first-right',
    );

  return (
    <div
      className={cn(
        'dsg-table-wrapper',
        bordered && 'dsg-table-wrapper--outlined',
        rounded && `dsg-table-wrapper--rounded-${rounded}`,
        className,
      )}
      style={colorVars}
    >
      {/* ── Scroll container ── */}
      <div
        className={cn('dsg-table-scroll', hasFixed && 'dsg-table-scroll--fixed')}
        style={scrollStyle}
      >
        <table
          className={cn(
            'dsg-table',
            `dsg-table--${size}`,
            bordered && 'dsg-table--bordered',
            striped && 'dsg-table--striped',
            hoverable && 'dsg-table--hoverable',
            enableStickyHeader && 'dsg-table--sticky',
            !fullWidth && 'dsg-table--auto',
          )}
        >
          {caption && (
            <caption className="dsg-table__caption">{caption}</caption>
          )}

          {/* ── Header ── */}
          <thead>
            <tr>
              {columns.map((col, ci) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      'dsg-table__th',
                      col.align && `dsg-table__th--${col.align}`,
                      col.sortable && 'dsg-table__th--sortable',
                      getFixedCellClass(col, ci, true),
                    )}
                    style={getCellStyle(col, ci)}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    aria-sort={
                      col.sortable && isSorted
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {col.sortable ? (
                      <span className="dsg-table__th-inner">
                        {col.title}
                        <SortIcon active={isSorted ? sortDir : null} />
                      </span>
                    ) : (
                      col.title
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {loading ? (
              /* Skeleton rows */
              Array.from({ length: loadingRows }, (_, ri) => (
                <tr key={`skeleton-${ri}`}>
                  {columns.map((col, ci) => (
                    <td
                      key={col.key}
                      className={cn(
                        'dsg-table__td',
                        getFixedCellClass(col, ci, false),
                      )}
                      style={getCellStyle(col, ci)}
                    >
                      <span
                        className={cn(
                          'dsg-table__skeleton-cell',
                          `dsg-table__skeleton-cell--${
                            SKELETON_WIDTHS[(ri + ci) % SKELETON_WIDTHS.length]
                          }`,
                        )}
                        style={{
                          animationDelay: `${(ri * 0.1 + ci * 0.05).toFixed(2)}s`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : isEmpty ? (
              /* Empty state */
              <tr>
                <td colSpan={columns.length} className="dsg-table__td">
                  <div className="dsg-table__empty">
                    {empty ?? 'Không có dữ liệu'}
                  </div>
                </td>
              </tr>
            ) : (
              /* Data rows */
              displayData.map((row, ri) => (
                <tr key={getRowKey(row, rowKey, ri)}>
                  {columns.map((col, ci) => {
                    const field = col.dataIndex ?? col.key;
                    const value = (row as any)[field];
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'dsg-table__td',
                          col.align && `dsg-table__td--${col.align}`,
                          getFixedCellClass(col, ci, false),
                        )}
                        style={getCellStyle(col, ci)}
                      >
                        {col.render
                          ? col.render(value, row, ri)
                          : value != null
                            ? value
                            : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {hasPagination && !loading && total > 0 && (
        <TablePaginator
          currentPage={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          total={total}
          showTotal={pagination?.showTotal !== false}
          pageSizeOptions={pagination?.pageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}

Table.displayName = 'Table';

/* ── Sort icon ──────────────────────────────────────────────── */

function SortIcon({ active }: { active: 'asc' | 'desc' | null }) {
  return (
    <span className="dsg-table__sort-icon" aria-hidden="true">
      <svg viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 0L10 6H0L5 0Z"
          className={cn(
            'dsg-table__sort-arrow',
            active === 'asc' && 'dsg-table__sort-arrow--active',
          )}
        />
      </svg>
      <svg viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 6L0 0H10L5 6Z"
          className={cn(
            'dsg-table__sort-arrow',
            active === 'desc' && 'dsg-table__sort-arrow--active',
          )}
        />
      </svg>
    </span>
  );
}

/* ── Pagination component ───────────────────────────────────── */

interface TablePaginatorProps {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  total: number;
  showTotal: boolean;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function TablePaginator({
  currentPage,
  pageCount,
  pageSize,
  total,
  showTotal,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: TablePaginatorProps) {
  const pages = getPaginationRange(currentPage, pageCount);
  const from = total === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, total);
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="dsg-table-pagination">
      {showTotal && (
        <span className="dsg-table-pagination__total">
          {from}–{to} / {total}
        </span>
      )}

      <div className="dsg-table-pagination__controls">
        {/* Prev */}
        <button
          className="dsg-table-pagination__btn"
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 11L5 7L9 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="dsg-table-pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={cn(
                'dsg-table-pagination__btn',
                p === currentPage && 'dsg-table-pagination__btn--active',
              )}
              onClick={() => onPageChange(p as number)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          className="dsg-table-pagination__btn"
          onClick={() => currentPage < pageCount && onPageChange(currentPage + 1)}
          disabled={currentPage >= pageCount}
          aria-label="Next page"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5 3L9 7L5 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Page size selector */}
      {pageSizeOptions && pageSizeOptions.length > 0 && (
        <select
          className="dsg-table-pagination__size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s} / trang
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
