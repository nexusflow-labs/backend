/**
 * Offset-based pagination parameters
 */
export interface OffsetPaginationParams {
  page: number; // 1-based
  pageSize: number; // default 20, max 100
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

/**
 * Combined pagination parameters (supports both modes)
 */
export interface PaginationParams {
  mode: 'offset' | 'cursor';
  page?: number;
  pageSize?: number;
  cursor?: string;
  limit?: number;
}

/**
 * Pagination metadata in response
 */
export interface PaginationMeta {
  // Offset pagination fields
  totalItems?: number;
  totalPages?: number;
  page?: number;
  pageSize?: number;

  // Cursor pagination fields
  nextCursor?: string | null;

  // Common fields
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Generic paginated result wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

/**
 * Filter parameters for date ranges
 */
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}
