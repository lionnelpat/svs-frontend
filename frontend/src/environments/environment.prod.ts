// src/environments/environment.prod.ts
export const environment = {
    production: true,
    apiBaseUrl: 'https://svs-api-backend.salanevision.com/api/v1', // URL de production

    // Configuration pour les requêtes HTTP
    httpTimeout: 30000,
    retryAttempts: 2,

    // Configuration pour les notificationsa
    toastDuration: 3000,

    // Configuration pour la pagination
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],

    // Configuration pour les uploads
    maxFileSize: 10485760,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

    // Configuration pour le cache
    cacheTimeout: 600000, // 10 minutes

    // Debug
    enableLogging: false,

    // Configuration Dashboard
    dashboard: {
        defaultNumberOfMonths: 12,
        defaultLimit: 6,
        refreshInterval: 600000, // 10 minutes en production
        enableAutoRefresh: true
    },

    // Configuration des graphiques (identique)
    charts: {
        defaultColors: {
            primary: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            hover: ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'],
            expenses: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'],
            expensesHover: ['#dc2626', '#d97706', '#059669', '#0891b2', '#7c3aed', '#db2777']
        },
        animation: {
            duration: 800,
            easing: 'easeInOutQuart'
        }
    }
};
