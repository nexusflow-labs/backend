import {
  PaginatedResult,
  PaginationMeta,
  OffsetPaginationParams,
  CursorPaginationParams,
} from './pagination.interface';

/**
 * Default pagination values
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  LIMIT: 20,
};

/**
 * Build Prisma skip/take for offset pagination
 */
export function buildOffsetPagination(params: OffsetPaginationParams): {
  skip: number;
  take: number;
} {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(
    PAGINATION_DEFAULTS.MAX_PAGE_SIZE,
    Math.max(1, params.pageSize),
  );

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Build Prisma cursor/take for cursor pagination
 */
export function buildCursorPagination(params: CursorPaginationParams): {
  cursor?: { id: string };
  skip?: number;
  take: number;
} {
  const limit = Math.min(
    PAGINATION_DEFAULTS.MAX_PAGE_SIZE,
    Math.max(1, params.limit),
  );

  if (params.cursor) {
    return {
      cursor: { id: params.cursor },
      skip: 1, // Skip the cursor item
      take: limit,
    };
  }

  return {
    take: limit,
  };
}

/**
 * Build offset pagination metadata
 */
export function buildOffsetPaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    totalItems,
    totalPages,
    page,
    pageSize,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Build cursor pagination metadata
 */
export function buildCursorPaginationMeta<T extends { id: string }>(
  items: T[],
  limit: number,
  hasMore?: boolean,
): PaginationMeta {
  const hasNextPage = hasMore ?? items.length === limit;
  const nextCursor =
    hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

  return {
    nextCursor,
    hasNextPage,
    hasPreviousPage: false, // Cursor pagination typically doesn't track previous
  };
}

/**
 * Create a paginated result with offset pagination
 */
export function createOffsetPaginatedResult<T>(
  items: T[],
  totalItems: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items,
    meta: buildOffsetPaginationMeta(totalItems, page, pageSize),
  };
}

/**
 * Create a paginated result with cursor pagination
 */
export function createCursorPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number,
  hasMore?: boolean,
): PaginatedResult<T> {
  return {
    items,
    meta: buildCursorPaginationMeta(items, limit, hasMore),
  };
}

/**
 * Build Prisma orderBy clause from sort parameters
 */
export function buildOrderBy(
  sortBy: string,
  sortDirection: 'asc' | 'desc' = 'desc',
  allowedFields: string[] = [],
): Record<string, 'asc' | 'desc'>[] {
  // Validate sort field
  const field = allowedFields.includes(sortBy) ? sortBy : 'createdAt';

  return [{ [field]: sortDirection }];
}

/**
 * Parse a date string to Date object for filtering
 */
export function parseDateFilter(dateString?: string): Date | undefined {
  if (!dateString) return undefined;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Build Prisma where clause for date range filter
 */
export function buildDateRangeFilter(
  field: string,
  from?: Date,
  to?: Date,
): Record<string, unknown> | undefined {
  if (!from && !to) return undefined;

  const filter: Record<string, Date> = {};

  if (from) {
    filter.gte = from;
  }

  if (to) {
    filter.lte = to;
  }

  return { [field]: filter };
}

/**
 * Build Prisma where clause for search across multiple fields
 */
export function buildSearchFilter(
  searchTerm: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  if (!searchTerm || searchTerm.trim() === '') return undefined;

  const term = searchTerm.trim();

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: term,
        mode: 'insensitive',
      },
    })),
  };
}
