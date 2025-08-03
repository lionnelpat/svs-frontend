import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import {UserRole} from "../../auth/enums/roles.enum";
import {Permission} from "../../auth/enums/permissions.enum";
import {RoleService} from "../../auth/services/role.service";

interface MenuItem {
    label: string;
    icon?: string;
    routerLink?: string;
    items?: MenuItem[];
    roles?: UserRole[];
    permissions?: Permission[];
    minimumRole?: UserRole;
    separator?: boolean;
    visible?: boolean;
}


@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit  {
    private readonly roleService = inject(RoleService);

    model: MenuItem[] = [];

    ngOnInit() {
        this.buildMenu();
    }

    private buildMenu() {
        const allMenuItems: MenuItem[] = [
            {
                label: 'Accueil',
                items: [
                    {
                        label: 'Tableau de Bord',
                        icon: 'pi pi-fw pi-home',
                        routerLink: '/dashboard'
                        // Accessible à tous les utilisateurs connectés
                    }
                ]
            },
            {
                label: 'Gestion',
                items: [
                    {
                        label: 'Entreprises',
                        icon: 'pi pi-fw pi-building',
                        routerLink: '/companies/list',
                        permissions: [Permission.COMPANIES_READ]
                    },
                    {
                        label: 'Factures',
                        icon: 'pi pi-fw pi-file',
                        routerLink: '/invoices/list',
                        permissions: [Permission.INVOICES_READ]
                    },
                    {
                        label: 'Opérations',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: '/operations/list',
                        minimumRole: UserRole.USER
                    },
                    {
                        label: 'Navires',
                        icon: 'pi pi-fw pi-send',
                        routerLink: '/ships/list',
                        permissions: [Permission.SHIPS_READ]
                    }
                ]
            },
            {
                label: 'Finances',
                items: [
                    {
                        label: 'Dépenses',
                        icon: 'pi pi-fw pi-money-bill',
                        routerLink: '/expenses/list',
                        minimumRole: UserRole.USER
                    },
                    {
                        label: 'Rapports',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: '/reports/list',
                        permissions: [Permission.REPORTS_VIEW]
                    },
                    {
                        label: 'Analyses',
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: '/analytics/list',
                        permissions: [Permission.ANALYTICS_VIEW]
                    }
                ]
            },
            {
                label: 'Configuration',
                items: [
                    {
                        label: 'Catégories',
                        icon: 'pi pi-fw pi-tags',
                        routerLink: '/categories/list',
                        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
                    },
                    {
                        label: 'Fournisseurs',
                        icon: 'pi pi-fw pi-users',
                        routerLink: '/suppliers/list',
                        minimumRole: UserRole.MANAGER
                    },
                    {
                        label: 'Méthodes de Paiement',
                        icon: 'pi pi-fw pi-credit-card',
                        routerLink: '/payment-methods/list',
                        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
                    }
                ]
            },
            {
                label: 'Administration',
                items: [
                    {
                        label: 'Utilisateurs',
                        icon: 'pi pi-fw pi-user',
                        routerLink: '/users/list',
                        permissions: [Permission.USERS_READ]
                    },
                    {
                        label: 'Rôles',
                        icon: 'pi pi-fw pi-shield',
                        routerLink: '/roles/list',
                        roles: [UserRole.SUPER_ADMIN]
                    },
                    {
                        label: '',
                        separator: true,
                        roles: [UserRole.ADMIN,
                            UserRole.SUPER_ADMIN]
                    },
                    {
                        label: 'Paramètres Système',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: '/admin/settings',
                        permissions: [Permission.SYSTEM_SETTINGS]
                    },
                    {
                        label: 'Logs d\'Audit',
                        icon: 'pi pi-fw pi-list',
                        routerLink: '/admin/audit-logs',
                        permissions: [Permission.AUDIT_LOGS]
                    }
                ]
            }
        ];

        // Filtrer le menu selon les permissions de l'utilisateur
        this.model = this.filterMenuByPermissions(allMenuItems);
    }

    private filterMenuByPermissions(menuItems: MenuItem[]): MenuItem[] {
        return menuItems
            .map(section => ({
                ...section,
                items: section.items ? this.filterMenuItems(section.items) : undefined
            }))
            .filter(section =>
                !section.items || section.items.length > 0
            );
    }

    private filterMenuItems(items: MenuItem[]): MenuItem[] {
        return items.filter(item => this.isMenuItemVisible(item));
    }

    private isMenuItemVisible(item: MenuItem): boolean {
        // Si visible est explicitement défini
        if (item.visible !== undefined) {
            return item.visible;
        }

        // Vérifier les rôles requis
        if (item.roles && item.roles.length > 0) {
            if (!this.roleService.hasAnyRole(item.roles)) {
                return false;
            }
        }

        // Vérifier les permissions requises
        if (item.permissions && item.permissions.length > 0) {
            if (!this.roleService.hasAnyPermission(item.permissions)) {
                return false;
            }
        }

        // Vérifier le rôle minimum
        if (item.minimumRole) {
            if (!this.roleService.hasMinimumRole(item.minimumRole)) {
                return false;
            }
        }

        // Si c'est un séparateur, vérifier les conditions spéciales
        if (item.separator) {
            if (item.roles && !this.roleService.hasAnyRole(item.roles)) {
                return false;
            }
        }

        return true;
    }

}


