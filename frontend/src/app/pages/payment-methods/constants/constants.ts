// constants/payment-method.constants.ts

import { PaymentMethodSortOption } from '../interfaces/payment-method.interface';

export const PAYMENT_METHOD_KEY = 'paymentMethod';

export const PAYMENT_METHOD_CONSTANTS = {
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],

    // Validation
    MAX_NAME_LENGTH: 100,
    MAX_CODE_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 500,
    MIN_NAME_LENGTH: 2,
    MIN_CODE_LENGTH: 2,

    // Messages
    MESSAGES: {
        CREATE_SUCCESS: 'Méthode de paiement créée avec succès',
        UPDATE_SUCCESS: 'Méthode de paiement mise à jour avec succès',
        DELETE_SUCCESS: 'Méthode de paiement supprimée avec succès',
        DELETE_CONFIRM: 'Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?',
        TOGGLE_STATUS_SUCCESS: 'Statut de la méthode de paiement modifié avec succès',
        FORM_INVALID: 'Veuillez corriger les erreurs dans le formulaire',
        REQUIRED_FIELDS: 'Les champs marqués d\'un * sont obligatoires'
    },

    // Validation messages
    VALIDATION_MESSAGES: {
        REQUIRED: 'Ce champ est obligatoire',
        MIN_LENGTH: 'Minimum {0} caractères requis',
        MAX_LENGTH: 'Maximum {0} caractères autorisés',
        PATTERN: 'Format invalide',
        CODE_ALREADY_EXISTS: 'Ce code existe déjà',
        NAME_ALREADY_EXISTS: 'Ce nom existe déjà'
    },

    // Regex patterns
    PATTERNS: {
        CODE: /^[A-Z0-9_-]+$/,
        NAME: /^[a-zA-ZÀ-ÿ0-9\s\-_'\.]+$/
    },

    // Status
    STATUS: {
        ACTIVE: { label: 'Actif', value: true, severity: 'success' as const },
        INACTIVE: { label: 'Inactif', value: false, severity: 'danger' as const }
    },

    // Table configuration
    TABLE: {
        ROWS_PER_PAGE: 10,
        SHOW_CURRENT_PAGE_REPORT: true,
        CURRENT_PAGE_REPORT_TEMPLATE: 'Affichage de {first} à {last} sur {totalRecords} méthodes de paiement',
        EMPTY_MESSAGE: 'Aucune méthode de paiement trouvée'
    }
} as const;

export const PAYMENT_METHOD_SORT_OPTIONS: PaymentMethodSortOption[] = [
    { label: 'Nom (A-Z)', value: 'nom', direction: 'asc' },
    { label: 'Nom (Z-A)', value: 'nom', direction: 'desc' },
    { label: 'Code (A-Z)', value: 'code', direction: 'asc' },
    { label: 'Code (Z-A)', value: 'code', direction: 'desc' },
    { label: 'Date création (récent)', value: 'createdAt', direction: 'desc' },
    { label: 'Date création (ancien)', value: 'createdAt', direction: 'asc' },
    { label: 'Statut (actif d\'abord)', value: 'actif', direction: 'desc' },
    { label: 'Statut (inactif d\'abord)', value: 'actif', direction: 'asc' }
];

export const PAYMENT_METHOD_STATUS_OPTIONS = [
    { label: 'Tous les statuts', value: null },
    { label: 'Actif', value: true },
    { label: 'Inactif', value: false }
];

// Icônes pour les actions
export const PAYMENT_METHOD_ICONS = {
    ADD: 'pi pi-plus',
    EDIT: 'pi pi-pencil',
    DELETE: 'pi pi-trash',
    VIEW: 'pi pi-eye',
    SEARCH: 'pi pi-search',
    REFRESH: 'pi pi-refresh',
    FILTER: 'pi pi-filter',
    TOGGLE_STATUS: 'pi pi-power-off',
    SAVE: 'pi pi-check',
    CANCEL: 'pi pi-times',
    CLOSE: 'pi pi-times'
} as const;
