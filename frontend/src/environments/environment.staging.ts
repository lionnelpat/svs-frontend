// src/environments/environment.ts
export const environment = {
    production: true,
    apiBaseUrl: 'https://svs-api-backend.model-technologie.com/api/v1',  // Important: correspond au proxy Nginx
    apiVersion: 'v1',

    // Configuration spécifique staging
    enableDebug: true,
    logLevel: 'debug',

    // Timeout augmenté pour le staging
    httpTimeout: 60000,

    // Désactivation du cache
    cacheTimeout: 0,

    // URL absolue pour les assets
    assetsPath: '/assets/',

    // Configuration pour les requêtes HTTP
    retryAttempts: 3,

    // Configuration pour les notifications
    toastDuration: 5000, // 5 secondes

    // Configuration pour la pagination
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],

    // Configuration pour les uploads (si nécessaire plus tard)
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

    // Debug
    enableLogging: true
};
