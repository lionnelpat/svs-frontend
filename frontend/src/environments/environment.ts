// src/environments/environment.ts
export const environment = {
    production: false,
    apiBaseUrl: 'http://localhost:8081/api/v1', // Ajustez selon votre configuration backend

    // Configuration pour les requêtes HTTP
    httpTimeout: 30000, // 30 secondes
    retryAttempts: 3,

    // Configuration pour les notifications
    toastDuration: 5000, // 5 secondes

    // Configuration pour la pagination
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],

    // Configuration pour les uploads (si nécessaire plus tard)
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

    // Configuration pour le cache
    cacheTimeout: 300000, // 5 minutes

    // Debug
    enableLogging: true,


    // Configuration Dashboard
    dashboard: {
        defaultNumberOfMonths: 12,
        defaultLimit: 6,
        refreshInterval: 300000, // 5 minutes en millisecondes
        enableAutoRefresh: false
    },

    // Configuration des graphiques
    charts: {
        defaultColors: {
            primary: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            hover: ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'],
            expenses: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'],
            expensesHover: ['#dc2626', '#d97706', '#059669', '#0891b2', '#7c3aed', '#db2777']
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    }
};
