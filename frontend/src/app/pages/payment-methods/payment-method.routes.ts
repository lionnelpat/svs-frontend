// payment-method.routes.ts

import { Routes } from '@angular/router';

export const paymentMethodRoutes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path: 'list',
        loadComponent: () => import('./payment-methods.component').then(c => c.PaymentMethodsComponent),
        data: {
            title: 'Méthodes de paiement',
            breadcrumb: 'Liste'
        }
    }
];
