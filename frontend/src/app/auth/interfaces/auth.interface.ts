import { Role } from '../../pages/roles/interfaces/role.interface';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin: string;
    fullName: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export interface ErrorResponse {
    path: string;
    code: string;
    method: string;
    success: boolean;
    suggestions?: {
        endpoint: string;
        action: string;
        message: string;
    };
    error: boolean;
    message: string;
    status: number;
    timestamp: string;
}
