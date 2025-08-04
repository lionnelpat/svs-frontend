export enum Permission {
    // Gestion des utilisateurs
    USERS_CREATE = 'users.create',
    USERS_READ = 'users.read',
    USERS_UPDATE = 'users.update',
    USERS_DELETE = 'users.delete',

    // Gestion des rôles
    ROLES_CREATE = 'roles.create',
    ROLES_READ = 'roles.read',
    ROLES_UPDATE = 'roles.update',
    ROLES_DELETE = 'roles.delete',

    // Gestion des factures
    INVOICES_CREATE = 'invoices.create',
    INVOICES_READ = 'invoices.read',
    INVOICES_UPDATE = 'invoices.update',
    INVOICES_DELETE = 'invoices.delete',
    INVOICES_APPROVE = 'invoices.approve',

    // Gestion des entreprises
    COMPANIES_CREATE = 'companies.create',
    COMPANIES_READ = 'companies.read',
    COMPANIES_UPDATE = 'companies.update',
    COMPANIES_DELETE = 'companies.delete',

    // Gestion des navires
    SHIPS_CREATE = 'ships.create',
    SHIPS_READ = 'ships.read',
    SHIPS_UPDATE = 'ships.update',
    SHIPS_DELETE = 'ships.delete',
    SHIPS_APPROVED = 'ships.approved',
    SHIPS_REJECTED = 'ships.rejected',

    // Gestion des opérations
    OPERATIONS_CREATE = 'operations.create',
    OPERATIONS_READ = 'operations.read',
    OPERATIONS_UPDATE = 'operations.update',
    OPERATIONS_DELETE = 'operations.delete',
    OPERATIONS_APPROVED = 'operations.approved',
    OPERATIONS_REJECTED = 'operations.rejected',

    // Gestion des dépenses
    EXPENSES_CREATE = 'expenses.create',
    EXPENSES_READ = 'expenses.read',
    EXPENSES_UPDATE = 'expenses.update',
    EXPENSES_DELETE = 'expenses.delete',
    EXPENSES_APPROVED = 'expenses.approve',
    EXPENSES_REJECTED = 'expenses.reject',
    EXPENSES_MARK_AS_PAID = 'expenses.mars-as-paid',

    // Gestion des types de dépenses
    EXPENSES_CATEGORY_CREATE = 'expense-categories.create',
    EXPENSES_CATEGORY_READ = 'expense-categories.read',
    EXPENSES_CATEGORY_UPDATE = 'expense-categories.update',
    EXPENSES_CATEGORY_DELETE = 'expense-categories.delete',

    // Gestion des dépenses
    PAYMENT_METHOD_CREATE = 'payment-methods.create',
    PAYMENT_METHOD_READ = 'payment-methods.read',
    PAYMENT_METHOD_UPDATE = 'payment-methods.update',
    PAYMENT_METHOD_DELETE = 'payment-methods.delete',

    // Rapports et analytics
    REPORTS_VIEW = 'reports.view',
    ANALYTICS_VIEW = 'analytics.view',

    // Administration système
    SYSTEM_SETTINGS = 'system.settings',
    AUDIT_LOGS = 'audit.logs'
}
