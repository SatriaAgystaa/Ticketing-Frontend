/** Standard API success response */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/** Standard API error response */
export interface ApiError {
  success: false;
  code: string;
  message: string;
  errors?: FieldError[];
  request_id?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

/** Paginated response shorthand */
export type PaginatedResponse<T> = ApiResponse<T[]>;

/** Union type for any API response */
export type ApiResult<T> = ApiResponse<T> | ApiError;
