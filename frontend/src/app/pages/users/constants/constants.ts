// src/app/pages/users/constants/constants.ts
import { UserStatus, UserTableColumn } from '../interfaces/user.interface';

// Configuration des API endpoints
export const USER_API_ENDPOINTS = {
    BASE: '/admin/users',
    LIST: '',
    ACTIVE: '/active',
    SEARCH: '/search',
    BY_ID: (id: number) => `/${id}`,
    CREATE: '',
    UPDATE: (id: number) => `/${id}`,
    ACTIVATE: (id: number) => `/${id}/activate`,
    DEACTIVATE: (id: number) => `/${id}/deactivate`,
    UNLOCK: (id: number) => `/${id}/unlock`,
    DELETE: (id: number) => `/${id}`,
    CAN_DELETE: (id: number) => `/${id}/can-delete`,
    CHANGE_PASSWORD: '/change-password',
    ASSIGN_ROLES: '/assign-roles',
    BULK_ACTIONS: '/bulk-actions',
    EXPORT: '/export',
    STATS: '/stats',
    ACTIVITIES: '/activities'
} as const;

// Configuration de pagination par défaut
export const DEFAULT_PAGINATION = {
    PAGE: 0,
    SIZE: 10,
    SORT_BY: 'id',
    SORT_DIR: 'desc',
    SIZE_OPTIONS: [5, 10, 25, 50, 100]
} as const;

// Configuration des filtres
export const USER_FILTERS = {
    STATUS_OPTIONS: [
        { label: 'Tous', value: null },
        { label: 'Actifs', value: true },
        { label: 'Inactifs', value: false }
    ],
    EMAIL_VERIFICATION_OPTIONS: [
        { label: 'Tous', value: null },
        { label: 'Vérifiés', value: true },
        { label: 'Non vérifiés', value: false }
    ]
} as const;

// Règles de validation
export const USER_VALIDATION_RULES = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50,
        PATTERN: /^[a-zA-Z0-9_-]+$/,
        PATTERN_MESSAGE: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        PATTERN_MESSAGE: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MAX_LENGTH: 100
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50,
        PATTERN: /^[a-zA-ZÀ-ÿ\s-']+$/,
        PATTERN_MESSAGE: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    },
    PHONE: {
        PATTERN: /^(\+221|00221)?\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}$/,
        PATTERN_MESSAGE: 'Format de téléphone sénégalais invalide (ex: +221 77 123 45 67)'
    }
} as const;

// Configuration des colonnes de la table
export const USER_TABLE_COLUMNS: UserTableColumn[] = [
    {
        field: 'avatar',
        header: '',
        sortable: false,
        filterable: false,
        width: '60px',
        visible: true
    },
    {
        field: 'username',
        header: 'Nom d\'utilisateur',
        sortable: true,
        filterable: true,
        visible: true
    },
    {
        field: 'fullName',
        header: 'Nom complet',
        sortable: true,
        filterable: true,
        visible: true
    },
    {
        field: 'email',
        header: 'Email',
        sortable: true,
        filterable: true,
        visible: true
    },
    {
        field: 'phone',
        header: 'Téléphone',
        sortable: false,
        filterable: false,
        visible: true
    },
    {
        field: 'roles',
        header: 'Rôles',
        sortable: false,
        filterable: true,
        visible: true
    },
    {
        field: 'status',
        header: 'Statut',
        sortable: true,
        filterable: true,
        visible: true,
        width: '120px'
    },
    {
        field: 'lastLogin',
        header: 'Dernière connexion',
        sortable: true,
        filterable: false,
        visible: true,
        width: '150px'
    },
    {
        field: 'createdAt',
        header: 'Date de création',
        sortable: true,
        filterable: false,
        visible: false,
        width: '150px'
    },
    {
        field: 'actions',
        header: 'Actions',
        sortable: false,
        filterable: false,
        visible: true,
        width: '200px'
    }
];

// Configuration des statuts utilisateur avec styles
export const USER_STATUS_CONFIG = {
    [UserStatus.ACTIVE]: {
        label: 'Actif',
        severity: 'success' as const,
        icon: 'pi pi-check-circle'
    },
    [UserStatus.INACTIVE]: {
        label: 'Inactif',
        severity: 'secondary' as const,
        icon: 'pi pi-times-circle'
    },
    [UserStatus.LOCKED]: {
        label: 'Verrouillé',
        severity: 'danger' as const,
        icon: 'pi pi-lock'
    },
    [UserStatus.PENDING_VERIFICATION]: {
        label: 'En attente',
        severity: 'warning' as const,
        icon: 'pi pi-clock'
    }
} as const;

// Configuration des actions en lot
export const BULK_ACTIONS = [
    {
        label: 'Activer',
        value: 'activate',
        icon: 'pi pi-check',
        severity: 'success' as const
    },
    {
        label: 'Désactiver',
        value: 'deactivate',
        icon: 'pi pi-times',
        severity: 'warning' as const
    },
    {
        label: 'Déverrouiller',
        value: 'unlock',
        icon: 'pi pi-unlock',
        severity: 'info' as const
    },
    {
        label: 'Assigner des rôles',
        value: 'assign_roles',
        icon: 'pi pi-users',
        severity: 'secondary' as const
    },
    {
        label: 'Supprimer',
        value: 'delete',
        icon: 'pi pi-trash',
        severity: 'danger' as const
    }
] as const;

// Configuration des formats d'export
export const EXPORT_FORMATS = [
    {
        label: 'Excel (.xlsx)',
        value: 'excel',
        icon: 'pi pi-file-excel'
    },
    {
        label: 'CSV (.csv)',
        value: 'csv',
        icon: 'pi pi-file'
    },
    {
        label: 'PDF (.pdf)',
        value: 'pdf',
        icon: 'pi pi-file-pdf'
    }
] as const;

// Messages de confirmation
export const CONFIRMATION_MESSAGES = {
    DELETE_USER: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
    DELETE_MULTIPLE_USERS: (count: number) => `Êtes-vous sûr de vouloir supprimer ${count} utilisateur(s) ? Cette action est irréversible.`,
    ACTIVATE_USER: 'Êtes-vous sûr de vouloir activer cet utilisateur ?',
    DEACTIVATE_USER: 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?',
    UNLOCK_USER: 'Êtes-vous sûr de vouloir déverrouiller ce compte utilisateur ?',
    BULK_ACTION: (action: string, count: number) => `Êtes-vous sûr de vouloir ${action} ${count} utilisateur(s) ?`,
    RESET_PASSWORD: 'Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?'
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
    USER_CREATED: 'Utilisateur créé avec succès',
    USER_UPDATED: 'Utilisateur mis à jour avec succès',
    USER_DELETED: 'Utilisateur supprimé avec succès',
    USER_ACTIVATED: 'Utilisateur activé avec succès',
    USER_DEACTIVATED: 'Utilisateur désactivé avec succès',
    USER_UNLOCKED: 'Compte utilisateur déverrouillé avec succès',
    PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
    ROLES_ASSIGNED: 'Rôles assignés avec succès',
    BULK_ACTION_COMPLETED: (count: number) => `Action effectuée sur ${count} utilisateur(s) avec succès`,
    DATA_EXPORTED: 'Données exportées avec succès'
} as const;

// Configuration des tooltips
export const TOOLTIPS = {
    ACTIVATE: 'Activer l\'utilisateur',
    DEACTIVATE: 'Désactiver l\'utilisateur',
    UNLOCK: 'Déverrouiller le compte',
    EDIT: 'Modifier l\'utilisateur',
    DELETE: 'Supprimer l\'utilisateur',
    VIEW_DETAILS: 'Voir les détails',
    CHANGE_PASSWORD: 'Changer le mot de passe',
    ASSIGN_ROLES: 'Assigner des rôles',
    EXPORT: 'Exporter les données',
    REFRESH: 'Actualiser la liste',
    FILTER: 'Filtrer les résultats',
    SEARCH: 'Rechercher un utilisateur'
} as const;

// Configuration des icônes
export const ICONS = {
    USER: 'pi pi-user',
    USERS: 'pi pi-users',
    ADD_USER: 'pi pi-user-plus',
    EDIT_USER: 'pi pi-user-edit',
    DELETE_USER: 'pi pi-user-minus',
    ACTIVE: 'pi pi-check-circle',
    INACTIVE: 'pi pi-times-circle',
    LOCKED: 'pi pi-lock',
    UNLOCK: 'pi pi-unlock',
    EMAIL: 'pi pi-envelope',
    PHONE: 'pi pi-phone',
    CALENDAR: 'pi pi-calendar',
    SEARCH: 'pi pi-search',
    FILTER: 'pi pi-filter',
    EXPORT: 'pi pi-download',
    REFRESH: 'pi pi-refresh',
    SETTINGS: 'pi pi-cog',
    ROLES: 'pi pi-shield'
} as const;

// Animation et transition
export const ANIMATIONS = {
    FADE_IN: 'fadeIn',
    SLIDE_DOWN: 'slideDown',
    ZOOM_IN: 'zoomIn'
} as const;

// Configuration des rôles système (non modifiables)
export const SYSTEM_ROLES = {
    SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
    ADMIN: 'ROLE_ADMIN'
} as const;
