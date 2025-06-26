import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Role, RoleSearchParams } from '../../interfaces/role.interface';
import { RoleService } from '../../services/role.service';
import { LoggerService } from '../../../../core/services/logger.service';
import {  PaginatorModule } from 'primeng/paginator';
import {  ToastModule } from 'primeng/toast';

export interface RoleListEvent {
    type: 'edit' | 'view' | 'delete';
    role?: Role;
}


@Component({
    selector: 'app-role-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        TagModule,
        ConfirmDialogModule,
        TooltipModule,
        BadgeModule,
        ChipModule,
        IconFieldModule,
        InputIconModule,
        PaginatorModule,
        ToastModule
    ],
    templateUrl: './role-list.component.html',
    styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
    @Output() roleEvent = new EventEmitter<RoleListEvent>();

    roles: Role[] = [];
    loading = false;
    totalRecords = 0;
    currentPage = 0;
    pageSize = 10;

    // Filtres
    searchTerm = '';
    selectedStatus: boolean | null = null;

    // Options pour les dropdowns
    statusOptions = [
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false }
    ];


    constructor(
        private readonly roleService: RoleService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.loadRoles();
    }

    loadRoles(): void {
        this.loading = true;

        const filter: RoleSearchParams = {
            search: this.searchTerm || undefined,
            isActive: this.selectedStatus !== null ? this.selectedStatus : undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.roleService.getRoles(filter).subscribe({
            next: (response) => {
                console.log('API Response:', response);
                this.roles = response.roles;  // Utilisez response.roles au lieu de response.content
                this.totalRecords = response.total;  // Utilisez response.total au lieu de response.totalElements
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec du chargement des rôles'
                });
                console.error('Error loading roles:', error);
            }
        });
    }


    onLazyLoad(event: any): void {
        this.currentPage = Math.floor(event.first / event.rows);
        this.pageSize = event.rows;
        this.loadRoles();
    }

    onSearch(): void {
        this.currentPage = 0;
        this.loading = true;

        const filter: RoleSearchParams = {
            search: this.searchTerm || undefined,
            isActive: this.selectedStatus !== null ? this.selectedStatus : undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.roleService.searchRoles(filter).subscribe({
            next: (response) => {
                console.log('API Response:', response);
                this.roles = response.roles;  // Utilisez response.roles au lieu de response.content
                this.totalRecords = response.total;  // Utilisez response.total au lieu de response.totalElements
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec du chargement des rôles'
                });
                console.error('Error loading roles:', error);
            }
        });
    }

    onFilter(): void {
        this.currentPage = 0;
        this.loadRoles();
    }

    onEdit(role: Role): void {
        this.roleEvent.emit({ type: 'edit', role });
    }

    onDelete(role: Role): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer le role "${role.name}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteRole(role);
            }
        });
    }

    onToggleStatus(role: Role): void {
        const action = role.isActive ? 'désactiver' : 'activer';
        this.confirmationService.confirm({
            message: `Voulez-vous ${action} le role "${role.name}" ?`,
            header: `Confirmation`,
            icon: 'pi pi-question-circle',
            acceptLabel: `Oui, ${action}`,
            rejectLabel: 'Annuler',
            accept: () => {
                this.toggleRoleStatus(role);
            }
        });
    }

    private deleteRole(role: Role): void {
        this.roleService.deleteRole(role.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Role "${role.name}" supprimé avec succès`
                });
                this.loadRoles();
            },
            error: (error) => {
                this.logger.error('Erreur lors de la suppression', error);
            }
        });
    }

    private toggleRoleStatus(role: Role): void {
        this.roleService.toggleRoleStatus(role.id, role.isActive).subscribe({
            next: (updatedRole) => {
                const status = updatedRole.isActive ? 'activé' : 'désactivé';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Role "${updatedRole.name}" ${status} avec succès`
                });
                this.loadRoles();
            },
            error: (error) => {
                this.logger.error('Erreur lors du changement de statut', error);
            }
        });
    }

    hasActiveFilters(): boolean {
        return !!(this.searchTerm || this.selectedStatus !== null);
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedStatus = null;
        this.currentPage = 0;
        this.loadRoles();

        this.messageService.add({
            severity: 'info',
            summary: 'Filtres effacés',
            detail: 'Tous les filtres ont été supprimés'
        });
    }

    getEmptyMessage(): string {
        if (this.hasActiveFilters()) {
            return 'Aucun role ne correspond à vos critères de recherche.';
        }
        return 'Aucun role n\'a été enregistré pour le moment.';
    }

    onPageChange(event: any): void {
        this.currentPage = event.page;
        this.pageSize = event.rows;
        this.loadRoles();
    }
}
