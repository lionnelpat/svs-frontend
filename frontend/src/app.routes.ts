import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import { Notfound } from './app/pages/notfound/notfound';
import { LoginFormComponent } from './app/auth/components/login/login-form.component';
import { AdminGuard } from './app/auth/guards/admin.guard';
import { AuthGuard } from './app/auth/guards/auth.guard';
import {UnauthorizedComponent} from "./app/pages/unauthorized/unauthorized";
import {UserRole} from "./app/auth/enums/roles.enum";
import {EnhancedRoleGuard} from "./app/auth/guards/enhanced-role.guard";
import {Permission} from "./app/auth/enums/permissions.enum";
import {PermissionGuard} from "./app/auth/guards/permission.guard";


export const appRoutes: Routes = [
    // Routes d'authentification
    {
        path: 'auth',
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

    // Routes protégées
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
            // Dashboard - Accessible à tous les utilisateurs connectés
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'dashboard',
                loadChildren: () => import('./app/pages/dashboard/dashboard.module').then(m => m.DashboardModule),
                data: {
                    breadcrumb: 'Tableau de Bord'
                }
            },

            // Gestion des entreprises - Lecture pour tous, écriture pour MANAGER+
            {
                path: 'companies',
                loadChildren: () => import('./app/pages/companies/companies.routes'),
                canActivate: [PermissionGuard],
                data: {
                    breadcrumb: 'Entreprises',
                    permissions: [Permission.COMPANIES_READ]
                }
            },

            // Gestion des factures - Selon les permissions
            {
                path: 'invoices',
                loadChildren: () => import('./app/pages/invoices/invoices.routes'),
                canActivate: [PermissionGuard],
                data: {
                    breadcrumb: 'Factures',
                    permissions: [Permission.INVOICES_READ]
                }
            },

            // Gestion des opérations - USER minimum
            {
                path: 'operations',
                loadChildren: () => import('./app/pages/operations/operations.routes'),
                canActivate: [EnhancedRoleGuard],
                data: {
                    breadcrumb: 'Opérations',
                    minimumRole: UserRole.USER
                }
            },

            // Gestion des navires - Permissions spécifiques
            {
                path: 'ships',
                loadChildren: () => import('./app/pages/ships/ships.routes'),
                canActivate: [PermissionGuard],
                data: {
                    breadcrumb: 'Navires',
                    permissions: [Permission.SHIPS_READ]
                }
            },

            // Gestion des dépenses - MANAGER minimum
            {
                path: 'expenses',
                loadChildren: () => import('./app/pages/expenses/expenses.routes'),
                canActivate: [EnhancedRoleGuard],
                data: {
                    breadcrumb: 'Dépenses',
                    minimumRole: UserRole.MANAGER
                }
            },

            // Administration des catégories - ADMIN requis
            {
                path: 'categories',
                loadChildren: () => import('./app/pages/expense-category/expense-category.routes'),
                canActivate: [AdminGuard],
                data: {
                    breadcrumb: 'Catégories'
                }
            },

            // Administration des fournisseurs - MANAGER minimum
            {
                path: 'suppliers',
                loadChildren: () => import('./app/pages/expense-supplier/expense-supplier.routes'),
                canActivate: [EnhancedRoleGuard],
                data: {
                    breadcrumb: 'Fournisseurs',
                    minimumRole: UserRole.MANAGER
                }
            },

            // Méthodes de paiement - ADMIN requis
            {
                path: 'payment-methods',
                loadChildren: () => import('./app/pages/payment-methods/payment-method.routes'),
                canActivate: [AdminGuard],
                data: {
                    breadcrumb: 'Méthodes de Paiement'
                }
            },

            // Gestion des rôles - SUPER_ADMIN uniquement
            {
                path: 'roles',
                loadChildren: () => import('./app/pages/roles/roles.routes'),
                canActivate: [EnhancedRoleGuard],
                data: {
                    breadcrumb: 'Gestion des Rôles',
                    roles: [UserRole.ADMIN]
                }
            },

            // Gestion des utilisateurs - ADMIN minimum
            // {
            //     path: 'users',
            //     loadChildren: () => import('./app/pages/users/users.routes'),
            //     canActivate: [PermissionGuard],
            //     data: {
            //         breadcrumb: 'Utilisateurs',
            //         permissions: [Permission.USERS_READ]
            //     }
            // },

            // Rapports - Permissions spécifiques
            // {
            //     path: 'reports',
            //     loadChildren: () => import('./app/pages/reports/reports.routes'),
            //     canActivate: [PermissionGuard],
            //     data: {
            //         breadcrumb: 'Rapports',
            //         permissions: [Permission.REPORTS_VIEW]
            //     }
            // },

            // Analytics - MANAGER minimum
            // {
            //     path: 'analytics',
            //     loadChildren: () => import('./app/pages/analytics/analytics.routes'),
            //     canActivate: [PermissionGuard],
            //     data: {
            //         breadcrumb: 'Analyses',
            //         permissions: [Permission.ANALYTICS_VIEW]
            //     }
            // },

            // Administration système - SUPER_ADMIN uniquement
            // {
            //     path: 'admin',
            //     loadChildren: () => import('./app/pages/admin/admin.routes'),
            //     canActivate: [EnhancedRoleGuard],
            //     data: {
            //         breadcrumb: 'Administration',
            //         roles: [UserRole.SUPER_ADMIN]
            //     }
            // }
        ]
    },

    // Pages d'erreur
    {
        path: 'notfound',
        component: Notfound
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent
    },

    // Redirections
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/notfound'
    }
];

// export const appRoutes: Routes = [
//     // Routes d'authentification
//     {
//         path: 'auth',
//         canActivate: [],
//         children: [
//             {
//                 path: 'login',
//                 component: LoginFormComponent
//             },
//             {
//                 path: '',
//                 redirectTo: 'login',
//                 pathMatch: 'full'
//             }
//         ]
//     },
//
//     // Routes protégées
//     {
//         path: '',
//         component: AppLayout,
//         canActivate: [AuthGuard],
//         canActivateChild: [AuthGuard],
//         children: [
//             // Dashboard - Accessible à tous les utilisateurs connectés
//             {
//                 path: '',
//                 component: DashboardComponent
//             },
//             {
//                 path: 'dashboard',
//                 loadChildren: () => import('./app/pages/dashboard/dashboard.module').then(m => m.DashboardModule),
//                 data: {
//                     breadcrumb: 'Tableau de Bord'
//                 }
//             },
//
//             // Gestion des entreprises - Lecture pour tous, écriture pour MANAGER+
//             {
//                 path: 'companies',
//                 loadChildren: () => import('./app/pages/companies/companies.routes'),
//                 canActivate: [PermissionGuard],
//                 data: {
//                     breadcrumb: 'Entreprises',
//                     permissions: [Permission.COMPANIES_READ]
//                 }
//             },
//
//             // Gestion des factures - Selon les permissions
//             {
//                 path: 'invoices',
//                 loadChildren: () => import('./app/pages/invoices/invoices.routes'),
//                 canActivate: [PermissionGuard],
//                 data: {
//                     breadcrumb: 'Factures',
//                     permissions: [Permission.INVOICES_READ]
//                 }
//             },
//
//             // Gestion des opérations - USER minimum
//             {
//                 path: 'operations',
//                 loadChildren: () => import('./app/pages/operations/operations.routes'),
//                 canActivate: [EnhancedRoleGuard],
//                 data: {
//                     breadcrumb: 'Opérations',
//                     minimumRole: UserRole.USER
//                 }
//             },
//
//             // Gestion des navires - Permissions spécifiques
//             {
//                 path: 'ships',
//                 loadChildren: () => import('./app/pages/ships/ships.routes'),
//                 canActivate: [PermissionGuard],
//                 data: {
//                     breadcrumb: 'Navires',
//                     permissions: [Permission.SHIPS_READ]
//                 }
//             },
//
//             // Gestion des dépenses - MANAGER minimum
//             {
//                 path: 'expenses',
//                 loadChildren: () => import('./app/pages/expenses/expenses.routes'),
//                 canActivate: [EnhancedRoleGuard],
//                 data: {
//                     breadcrumb: 'Dépenses',
//                     minimumRole: UserRole.MANAGER
//                 }
//             },
//
//             // Administration des catégories - ADMIN requis
//             {
//                 path: 'categories',
//                 loadChildren: () => import('./app/pages/expense-category/expense-category.routes'),
//                 canActivate: [PermissionGuard],
//                 data: {
//                     breadcrumb: 'Catégories',
//                     minimumRole: UserRole.MANAGER
//                 }
//             },
//
//             // // Administration des fournisseurs - MANAGER minimum
//             {
//                 path: 'suppliers',
//                 loadChildren: () => import('./app/pages/expense-supplier/expense-supplier.routes'),
//                 canActivate: [EnhancedRoleGuard],
//                 data: {
//                     breadcrumb: 'Fournisseurs',
//                     minimumRole: UserRole.MANAGER
//                 }
//             },
//
//             // // Méthodes de paiement - ADMIN requis
//             {
//                 path: 'payment-methods',
//                 loadChildren: () => import('./app/pages/payment-methods/payment-method.routes'),
//                 canActivate: [AdminGuard],
//                 data: {
//                     breadcrumb: 'Méthodes de Paiement',
//                     minimumRole: UserRole.MANAGER
//                 }
//             },
//
//             // // Gestion des rôles - SUPER_ADMIN uniquement
//             {
//                 path: 'roles',
//                 loadChildren: () => import('./app/pages/roles/roles.routes'),
//                 canActivate: [AdminGuard],
//                 data: {
//                     breadcrumb: 'Gestion des Rôles',
//                     roles: [UserRole.MANAGER]
//                 }
//             },
//             //
//             // // Gestion des utilisateurs - ADMIN minimum
//             // {
//             //     path: 'users',
//             //     loadChildren: () => import('./app/pages/users/users.routes'),
//             //     canActivate: [PermissionGuard],
//             //     data: {
//             //         breadcrumb: 'Utilisateurs',
//             //         permissions: [Permission.USERS_READ]
//             //     }
//             // },
//             //
//             // // Rapports - Permissions spécifiques
//             // {
//             //     path: 'reports',
//             //     loadChildren: () => import('./app/pages/reports/reports.routes'),
//             //     canActivate: [PermissionGuard],
//             //     data: {
//             //         breadcrumb: 'Rapports',
//             //         permissions: [Permission.REPORTS_VIEW]
//             //     }
//             // },
//             //
//             // // Analytics - MANAGER minimum
//             // {
//             //     path: 'analytics',
//             //     loadChildren: () => import('./app/pages/analytics/analytics.routes'),
//             //     canActivate: [PermissionGuard],
//             //     data: {
//             //         breadcrumb: 'Analyses',
//             //         permissions: [Permission.ANALYTICS_VIEW]
//             //     }
//             // },
//             //
//             // // Administration système - SUPER_ADMIN uniquement
//             // {
//             //     path: 'admin',
//             //     loadChildren: () => import('./app/pages/admin/admin.routes'),
//             //     canActivate: [EnhancedRoleGuard],
//             //     data: {
//             //         breadcrumb: 'Administration',
//             //         roles: [UserRole.SUPER_ADMIN]
//             //     }
//             // }
//         ]
//     },
//
//     // Pages d'erreur
//     {
//         path: 'notfound',
//         component: Notfound
//     },
//     {
//         path: 'unauthorized',
//         component: UnauthorizedComponent
//     },
//
//     // Redirections
//     {
//         path: '',
//         redirectTo: '/dashboard',
//         pathMatch: 'full'
//     },
//     {
//         path: '**',
//         redirectTo: '/notfound'
//     }
// ];
