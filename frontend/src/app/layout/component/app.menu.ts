import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../auth/components/login/services/auth.service';

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
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Gestion Maritime',
                items: [
                    {
                        label: 'Factures',
                        icon: 'pi pi-receipt',
                        routerLink: ['/invoices/list']
                    },
                    {
                        label: 'Dépenses',
                        icon: 'pi pi-wallet',
                        routerLink: ['/expenses/list']
                    }

                ]
            },
            {
                label: 'Opérations',
                items: [
                    {
                        label: 'Types d\'opérations',
                        icon: 'pi pi-cog',
                        routerLink: ['/operations/list']
                    },
                    {
                        label: 'sociétés',
                        icon: 'pi pi-building',
                        routerLink: ['/companies/list']
                    },
                    {
                        label: 'navires',
                        icon: 'pi pi-compass',
                        routerLink: ['/ships/list']
                    },
                    {
                        label: 'type de dépenses',
                        icon: 'pi pi-cog',
                        routerLink: ['/categories/list']
                    },
                    {
                        label: 'Fournisseurs',
                        icon: 'pi pi-briefcase',
                        routerLink: ['/suppliers/list']
                    },
                    {
                        label: 'Méthodes de paiement',
                        icon: 'pi pi-dollar',
                        routerLink: ['/payment-methods/list']
                    }
                ]
            },
            {
                label: 'Administration',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Gestion des Rôles',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/roles'],
                        // Optionnel: afficher seulement pour certains rôles
                        // visible: this.authService.hasAnyRole([''])
                    },
                    {
                        label: 'Gestion des Utilisateurs',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/users'],
                        // visible: this.authService.hasAnyRole([''])
                    }
                ]
            },
        ];
    }

    constructor(private authService: AuthService) {}
}


