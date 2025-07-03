import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import { Notfound } from './app/pages/notfound/notfound';
import { expenseCategoryRoutes } from './app/pages/expense-category/expense-category.routes';
import { expenseSupplierRoutes } from './app/pages/expense-supplier/expense-supplier.routes';
import { paymentMethodRoutes } from './app/pages/payment-methods/payment-method.routes';
import { LoginFormComponent } from './app/auth/components/login/login-form.component';
import { GuestGuard } from './app/auth/components/login/guards/guest.guard';
import { AuthGuard } from './app/auth/components/login/guards/auth.guard';
import { RolesComponent } from './app/pages/roles/roles.component';
import { RoleGuard } from './app/auth/components/login/guards/role.guard';
import {UnauthorizedComponent} from "./app/pages/unauthorized/unauthorized";

export const appRoutes: Routes = [
    {
        path: 'auth',
        canActivate: [GuestGuard], // Empêche l'accès si déjà connecté
        children: [
            {
                path: 'login',
                component: LoginFormComponent
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard], // Protège toutes les routes enfants
        canActivateChild: [AuthGuard],
        children: [
            { path: '', component: DashboardComponent },
            {
                path: 'dashboard',
                loadChildren: () => import('./app/pages/dashboard/dashboard.module').then(m => m.DashboardModule),
                data: {
                    breadcrumb: 'Tableau de Bord'
                }
            },
            {
                path: 'companies',
                loadChildren: () => import('./app/pages/companies/companies.routes')
            },
            {
                path: 'invoices',
                loadChildren: () => import('./app/pages/invoices/invoices.routes')
            },
            {
                path: 'operations',
                loadChildren: () => import('./app/pages/operations/operations.routes')
            },
            {
                path: 'ships',
                loadChildren: () => import('./app/pages/ships/ships.routes')
            },
            {
                path: 'expenses',
                loadChildren: () => import('./app/pages/expenses/expenses.routes')
            },
            {
                path: 'categories',
                loadChildren: () => expenseCategoryRoutes
            },
            {
                path: 'suppliers',
                loadChildren: () => expenseSupplierRoutes
            },
            {
                path: 'payment-methods',
                loadChildren: () => paymentMethodRoutes
            },
            {
                path: 'roles',
                component: RolesComponent,
                canActivate: [], // Optionnel: protection par rôle
                data: {
                    breadcrumb: 'Gestion des Rôles',
                    roles: [''] // Rôles autorisés
                }
            },

        ]
    },
    // Page d'erreur 404
    {
        path: 'notfound',
        component: Notfound
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent
    },

    // Redirection par défaut vers la page de connexion
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },

    // Toute autre route non trouvée
    {
        path: '**',
        redirectTo: '/notfound'
    }
];
