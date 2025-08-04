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
import { ConfirmationService, MessageService } from 'primeng/api';
import { Company, CompanyListFilter } from '../../../../shared/models';
import { CompanyService } from '../../../service/company.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import {UserRoleService} from "../../../../auth/services/user-role.service";
import {UserRole} from "../../../../auth/enums/roles.enum";
import {Permission} from "../../../../auth/enums/permissions.enum";
import {HasPermissionDirective} from "../../../../auth/directives";


export interface CompanyListEvent {
    type: 'create' | 'edit' | 'view' | 'delete';
    company?: Company;
}

@Component({
  selector: 'app-company-list',
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
        IconField,
        InputIcon,
        HasPermissionDirective
    ],
    providers: [ConfirmationService, MessageService],
    standalone: true,
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss'
})

export class CompanyListComponent implements OnInit {
    @Output() companyEvent = new EventEmitter<CompanyListEvent>();

    companies: Company[] = [];
    loading = false;
    totalRecords = 0;
    currentPage = 0;
    pageSize = 10;

    // Filtres
    searchTerm = '';
    selectedCountry: string | null = null;
    selectedStatus: boolean | null = null;

    // Exposer les enums pour le template
    readonly UserRole = UserRole;
    readonly Permission = Permission;

    // Options pour les dropdowns
    countryOptions = [
        { label: 'Sénégal', value: 'Sénégal' },
        { label: 'France', value: 'France' },
        { label: 'Danemark', value: 'Danemark' },
        { label: 'Suisse', value: 'Suisse' },
        { label: 'Chine', value: 'Chine' },
        { label: 'Allemagne', value: 'Allemagne' },
        { label: 'Singapour', value: 'Singapour' }
    ];

    statusOptions = [
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false }
    ];

    constructor(
        private readonly companyService: CompanyService,
        private readonly confirmationService: ConfirmationService,
        private readonly userRoleService: UserRoleService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {}

    // Propriétés computed pour les permissions
    get canCreateCompany(): boolean {
        return this.userRoleService.hasPermission(Permission.COMPANIES_CREATE);
    }

    get canUpdateCompany(): boolean {
        return this.userRoleService.hasPermission(Permission.COMPANIES_UPDATE);
    }

    get canDeleteCompany(): boolean {
        return this.userRoleService.hasPermission(Permission.COMPANIES_DELETE);
    }

    get isManagerOrAbove(): boolean {
        return this.userRoleService.hasMinimumRole(UserRole.MANAGER);
    }

    ngOnInit(): void {
        this.loadCompanies();
    }

    loadCompanies(): void {
        this.loading = true;

        const filter: CompanyListFilter = {
            search: this.searchTerm || undefined,
            pays: this.selectedCountry || undefined,
            active: this.selectedStatus !== null ? this.selectedStatus : undefined,
            page: this.currentPage,
            size: this.pageSize
        };

        this.companyService.getCompanies(filter).subscribe({
            next: (response) => {
                this.companies = response.companies;
                this.totalRecords = response.total;
                this.loading = false;
                this.logger.debug(`${response.companies.length} compagnies chargées`);
            },
            error: (error) => {
                this.loading = false;
                this.logger.error('Erreur lors du chargement des companies', error);
            }
        });
    }

    onLazyLoad(event: any): void {
        this.currentPage = Math.floor(event.first / event.rows);
        this.pageSize = event.rows;
        this.loadCompanies();
    }

    onSearch(): void {
        this.currentPage = 0;
        this.loadCompanies();
    }

    onFilter(): void {
        this.currentPage = 0;
        this.loadCompanies();
    }

    onCreate(): void {
        this.companyEvent.emit({ type: 'create' });
    }

    onView(company: Company): void {
        this.companyEvent.emit({ type: 'view', company });
    }

    onEdit(company: Company): void {
        this.companyEvent.emit({ type: 'edit', company });
    }

    onDelete(company: Company): void {
        this.confirmationService.confirm({
            key: 'delete',
            message: `Êtes-vous sûr de vouloir supprimer la compagnie "${company.nom}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.deleteCompany(company);
            }
        });
    }

    onToggleStatus(company: Company): void {
        const action = company.active ? 'désactiver' : 'activer';
        this.confirmationService.confirm({
            message: `Voulez-vous ${action} la compagnie "${company.nom}" ?`,
            header: `Confirmation`,
            icon: 'pi pi-question-circle',
            acceptLabel: `Oui, ${action}`,
            rejectLabel: 'Annuler',
            accept: () => {
                this.toggleCompanyStatus(company);
            }
        });
    }

    private deleteCompany(company: Company): void {

        // Vérification supplémentaire pour la suppression
        if (this.userRoleService.hasRole(UserRole.SUPER_ADMIN) ||
            (this.userRoleService.hasRole(UserRole.ADMIN))) {

            // Procéder à la suppression
            this.companyService.deleteCompany(company.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Compagnie "${company.nom}" supprimée avec succès`
                    });
                    this.loadCompanies();
                },
                error: (error) => {
                    this.logger.error('Erreur lors de la suppression', error);
                }
            });
        } else {
            // Afficher un message d'erreur
            console.error('Permissions insuffisantes pour supprimer cette entreprise');
        }

    }

    private toggleCompanyStatus(company: Company): void {
        this.companyService.toggleCompanyStatus(company.id).subscribe({
            next: (updatedCompany) => {
                const status = updatedCompany.active ? 'activée' : 'désactivée';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Compagnie "${updatedCompany.nom}" ${status} avec succès`
                });
                this.loadCompanies();
            },
            error: (error) => {
                this.logger.error('Erreur lors du changement de statut', error);
            }
        });
    }

    /**
     * Vérifie si des filtres sont actifs
     */
    hasActiveFilters(): boolean {
        return !!(this.searchTerm || this.selectedCountry || this.selectedStatus !== null);
    }

    /**
     * Efface tous les filtres
     */
    clearFilters(): void {
        this.searchTerm = '';
        this.selectedCountry = null;
        this.selectedStatus = null;
        this.currentPage = 0;
        this.loadCompanies();

        this.messageService.add({
            severity: 'info',
            summary: 'Filtres effacés',
            detail: 'Tous les filtres ont été supprimés'
        });
    }

    /**
     * Retourne le message d'état vide approprié
     */
    getEmptyMessage(): string {
        if (this.hasActiveFilters()) {
            return 'Aucune compagnie ne correspond à vos critères de recherche.';
        }
        return 'Aucune compagnie n\'a été enregistrée pour le moment.';
    }
}
