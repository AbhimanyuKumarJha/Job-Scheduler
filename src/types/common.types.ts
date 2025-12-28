// Retry policy type
export interface RetryPolicy {
    maxRetries: number;
    backoffStrategy: 'EXPONENTIAL' | 'LINEAR' | 'FIXED';
    initialDelayMs: number;
    maxDelayMs: number;
}

// Pagination type
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: any;
}
