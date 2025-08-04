import {UserRole} from "./roles.enum";
import {Permission} from "./permissions.enum";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.SUPER_ADMIN]: [
        // Accès complet à tout
        ...Object.values(Permission)
    ],

    [UserRole.ADMIN]: [
        // Gestion des utilisateurs (sauf création d'admin)
        Permission.USERS_CREATE,
        Permission.USERS_READ,
        Permission.USERS_UPDATE,
        Permission.USERS_DELETE,

        // Gestion des rôles
        Permission.ROLES_READ,
        Permission.ROLES_UPDATE,

        // Gestion complète du business
        Permission.INVOICES_CREATE,
        Permission.INVOICES_READ,
        Permission.INVOICES_UPDATE,
        Permission.INVOICES_DELETE,
        Permission.INVOICES_APPROVE,

        Permission.COMPANIES_CREATE,
        Permission.COMPANIES_READ,
        Permission.COMPANIES_UPDATE,
        Permission.COMPANIES_DELETE,

        Permission.SHIPS_CREATE,
        Permission.SHIPS_READ,
        Permission.SHIPS_UPDATE,
        Permission.SHIPS_DELETE,
        Permission.SHIPS_APPROVED,
        Permission.SHIPS_REJECTED,

        Permission.OPERATIONS_CREATE,
        Permission.OPERATIONS_READ,
        Permission.OPERATIONS_UPDATE,
        Permission.OPERATIONS_DELETE,
        Permission.OPERATIONS_APPROVED,
        Permission.OPERATIONS_REJECTED,

        Permission.EXPENSES_CREATE,
        Permission.EXPENSES_READ,
        Permission.EXPENSES_UPDATE,
        Permission.EXPENSES_DELETE,
        Permission.EXPENSES_APPROVED,
        Permission.EXPENSES_REJECTED,
        Permission.EXPENSES_MARK_AS_PAID,

        Permission.EXPENSES_CATEGORY_CREATE,
        Permission.EXPENSES_CATEGORY_READ,
        Permission.EXPENSES_CATEGORY_UPDATE,
        Permission.EXPENSES_CATEGORY_DELETE,

        Permission.PAYMENT_METHOD_CREATE,
        Permission.PAYMENT_METHOD_READ,
        Permission.PAYMENT_METHOD_UPDATE,
        Permission.PAYMENT_METHOD_DELETE,

        Permission.REPORTS_VIEW,
        Permission.ANALYTICS_VIEW
    ],

    [UserRole.MANAGER]: [
        // Lecture des utilisateurs
        Permission.USERS_READ,
        // Lecture des roles
        Permission.ROLES_READ,

        // Gestion business sans suppression
        Permission.INVOICES_CREATE,
        Permission.INVOICES_READ,
        Permission.INVOICES_UPDATE,
        Permission.INVOICES_APPROVE,

        Permission.COMPANIES_CREATE,
        Permission.COMPANIES_READ,
        Permission.COMPANIES_UPDATE,

        Permission.SHIPS_CREATE,
        Permission.SHIPS_READ,
        Permission.SHIPS_UPDATE,
        Permission.SHIPS_APPROVED,
        Permission.SHIPS_REJECTED,

        Permission.OPERATIONS_CREATE,
        Permission.OPERATIONS_READ,
        Permission.OPERATIONS_UPDATE,
        Permission.OPERATIONS_APPROVED,
        Permission.OPERATIONS_REJECTED,

        Permission.EXPENSES_CREATE,
        Permission.EXPENSES_READ,
        Permission.EXPENSES_UPDATE,
        Permission.EXPENSES_APPROVED,
        Permission.EXPENSES_REJECTED,
        Permission.EXPENSES_MARK_AS_PAID,

        Permission.EXPENSES_CATEGORY_CREATE,
        Permission.EXPENSES_CATEGORY_READ,
        Permission.EXPENSES_CATEGORY_UPDATE,

        Permission.PAYMENT_METHOD_CREATE,
        Permission.PAYMENT_METHOD_READ,
        Permission.PAYMENT_METHOD_UPDATE,

        Permission.REPORTS_VIEW,
        Permission.ANALYTICS_VIEW
    ],

    [UserRole.USER]: [
        // Opérations de base
        Permission.INVOICES_CREATE,
        Permission.INVOICES_READ,
        Permission.INVOICES_UPDATE,

        Permission.COMPANIES_READ,

        Permission.SHIPS_READ,
        Permission.SHIPS_CREATE,
        Permission.SHIPS_UPDATE,

        Permission.OPERATIONS_CREATE,
        Permission.OPERATIONS_READ,
        Permission.OPERATIONS_UPDATE,

        Permission.EXPENSES_CREATE,
        Permission.EXPENSES_READ,
        Permission.EXPENSES_UPDATE,

        Permission.PAYMENT_METHOD_CREATE,
        Permission.PAYMENT_METHOD_READ,
        Permission.PAYMENT_METHOD_UPDATE,

        Permission.EXPENSES_CATEGORY_CREATE,
        Permission.EXPENSES_CATEGORY_READ,
        Permission.EXPENSES_CATEGORY_UPDATE,

        Permission.REPORTS_VIEW
    ],

    [UserRole.VIEWER]: [
        // Lecture seule
        Permission.INVOICES_READ,
        Permission.COMPANIES_READ,
        Permission.OPERATIONS_CREATE,
        Permission.SHIPS_READ,
        Permission.OPERATIONS_READ,
        Permission.EXPENSES_READ,
        Permission.EXPENSES_CATEGORY_READ,
        Permission.PAYMENT_METHOD_READ,
        Permission.REPORTS_VIEW
    ]
};
