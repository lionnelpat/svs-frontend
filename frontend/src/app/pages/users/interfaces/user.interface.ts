// src/app/pages/users/interfaces/user.interface.ts
export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetTokenExpiry?: string;
    lastLogin?: string;
    loginAttempts: number;
    accountLockedUntil?: string;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    roles: UserRole[];
    fullName: string;
}

export interface UserRole {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    roleIds: number[];
}

export interface UpdateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    roleIds: number[];
}

export interface ChangePasswordRequest {
    userId: number;
    newPassword: string;
    confirmPassword: string;
}

export interface UserSummary {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isActive: boolean;
}

export interface UserSearchFilter {
    search?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    roleIds?: number[];
    createdFrom?: string;
    createdTo?: string;
    lastLoginFrom?: string;
    lastLoginTo?: string;
}

export interface UserPageResponse {
    users: User[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    lockedUsers: number;
    unverifiedUsers: number;
    newUsersThisMonth: number;
}

export interface UserActivity {
    id: number;
    userId: number;
    username: string;
    action: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

export interface RoleAssignmentRequest {
    userId: number;
    roleIds: number[];
}

export interface BulkUserAction {
    userIds: number[];
    action: 'activate' | 'deactivate' | 'unlock' | 'delete' | 'assign_roles';
    roleIds?: number[]; // Pour l'assignation de rôles
}

export interface UserExportRequest {
    format: 'excel' | 'csv' | 'pdf';
    filter?: UserSearchFilter;
    includeRoles?: boolean;
    includeStats?: boolean;
}

// Types d'événements pour les notifications
export type UserEventType =
    | 'user_created'
    | 'user_updated'
    | 'user_activated'
    | 'user_deactivated'
    | 'user_deleted'
    | 'user_locked'
    | 'user_unlocked'
    | 'password_changed'
    | 'roles_assigned';

export interface UserEvent {
    type: UserEventType;
    userId: number;
    username: string;
    data?: any;
    timestamp: string;
}

// Énumérations
export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    LOCKED = 'LOCKED',
    PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export enum UserActionType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    ACTIVATE = 'ACTIVATE',
    DEACTIVATE = 'DEACTIVATE',
    UNLOCK = 'UNLOCK',
    DELETE = 'DELETE',
    CHANGE_PASSWORD = 'CHANGE_PASSWORD',
    ASSIGN_ROLES = 'ASSIGN_ROLES'
}

// Types pour la table
export interface UserTableColumn {
    field: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    visible?: boolean;
}

// Configuration des colonnes par défaut
export const DEFAULT_USER_COLUMNS: UserTableColumn[] = [
    { field: 'username', header: 'Nom d\'utilisateur', sortable: true, filterable: true, visible: true },
    { field: 'fullName', header: 'Nom complet', sortable: true, filterable: true, visible: true },
    { field: 'email', header: 'Email', sortable: true, filterable: true, visible: true },
    { field: 'phone', header: 'Téléphone', sortable: false, filterable: false, visible: true },
    { field: 'roles', header: 'Rôles', sortable: false, filterable: true, visible: true },
    { field: 'isActive', header: 'Statut', sortable: true, filterable: true, visible: true },
    { field: 'lastLogin', header: 'Dernière connexion', sortable: true, filterable: false, visible: true },
    { field: 'createdAt', header: 'Date de création', sortable: true, filterable: false, visible: false },
    { field: 'actions', header: 'Actions', sortable: false, filterable: false, visible: true, width: '150px' }
];

// Messages d'erreur personnalisés
export const USER_ERROR_MESSAGES = {
    USERNAME_REQUIRED: 'Le nom d\'utilisateur est requis',
    USERNAME_MIN_LENGTH: 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
    USERNAME_MAX_LENGTH: 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères',
    USERNAME_EXISTS: 'Ce nom d\'utilisateur existe déjà',
    EMAIL_REQUIRED: 'L\'email est requis',
    EMAIL_INVALID: 'Format d\'email invalide',
    EMAIL_EXISTS: 'Cet email existe déjà',
    PASSWORD_REQUIRED: 'Le mot de passe est requis',
    PASSWORD_MIN_LENGTH: 'Le mot de passe doit contenir au moins 8 caractères',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
    FIRST_NAME_REQUIRED: 'Le prénom est requis',
    LAST_NAME_REQUIRED: 'Le nom est requis',
    PHONE_INVALID: 'Format de téléphone invalide',
    ROLES_REQUIRED: 'Au moins un rôle doit être assigné',
    USER_NOT_FOUND: 'Utilisateur non trouvé',
    CANNOT_DELETE_SELF: 'Vous ne pouvez pas supprimer votre propre compte',
    CANNOT_DELETE_ADMIN: 'Impossible de supprimer un administrateur',
    USER_LOCKED: 'Le compte utilisateur est verrouillé',
    INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes pour cette action'
} as const;
