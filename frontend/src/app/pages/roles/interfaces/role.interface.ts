// interfaces/role.interface.ts
export interface Role {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date | null;
    userCount: number;
    displayName: string;
}

export interface PaginatedResponse<T> {
    roles: T[]; // ou `items: T[]` selon ton backend
    total: number;
    page: number;
    size: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}


export interface CreateRoleRequest {
    name: string;
    description: string;
    displayName: string;
    isActive?: boolean;
}

export interface UpdateRoleRequest {
    name?: string;
    description?: string;
    displayName?: string;
    isActive?: boolean;
}

export interface RoleSearchParams {
    search?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export interface RoleResponse {
    roles: Role[];        // Au lieu de content
    total: number;        // Au lieu de totalElements
    page: number;         // Au lieu de number
    size: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}
