import { PaginationQuery } from '../types';

export const parsePagination = (query: PaginationQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder: sortOrder as 'asc' | 'desc' };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const generateAssetTag = (lastTag?: string): string => {
  if (!lastTag) return 'AF-0001';
  const num = parseInt(lastTag.replace('AF-', ''), 10);
  return `AF-${String(num + 1).padStart(4, '0')}`;
};

export const generateEmployeeId = (lastId?: string): string => {
  if (!lastId) return 'EMP-0001';
  const num = parseInt(lastId.replace('EMP-', ''), 10);
  return `EMP-${String(num + 1).padStart(4, '0')}`;
};
