import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoggerService } from '../../core/services/logger.service';
import { Button } from 'primeng/button';
import { RoleListComponent, RoleListEvent } from './components/role-list/role-list.component';
import { Role } from './interfaces/role.interface';
import { RoleFormComponent } from './components/role-form/role-form.component';

@Component({
    selector: 'app-roles',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        Button,
        RoleListComponent,
        RoleFormComponent
    ],
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.scss'
})
export class RolesComponent {
    // État des dialogs
    showFormDialog = false;
    showDetailDialog = false;

    // Données
    selectedRole: Role | null = null;

    // Mode du formulaire
    isEditMode = false;

    @ViewChild(RoleListComponent, { static: true }) roleListComponent: RoleListComponent | undefined;

    constructor(
        private readonly logger: LoggerService
    ) {}

    get formDialogTitle(): string {
        return this.isEditMode ? 'Modifier le role' : 'Nouveau role';
    }

    /**
     * Gestionnaire d'événements de la liste des navires
     */
    onRoleEvent(event: RoleListEvent): void {
        this.logger.debug('Événement navire reçu', event);

        switch (event.type) {
            case 'edit':
                this.openEditDialog(event.role!);
                break;
            case 'view':
                this.openDetailDialog(event.role!);
                break;
            default:
                this.logger.warn('Type d\'événement non géré', event.type);
        }
    }

    /**
     * Ouvre le dialog de création
     */
    private openCreateDialog(): void {
        this.selectedRole = null;
        this.isEditMode = false;
        this.showFormDialog = true;
        this.logger.info('Dialog de création de role ouvert');
    }

    /**
     * Ouvre le dialog d'édition
     */
    private openEditDialog(role: Role): void {
        this.selectedRole = role;
        this.isEditMode = true;
        this.showFormDialog = true;
        this.logger.info(`Dialog d'édition ouvert pour le role: ${role.name}`);
    }

    /**
     * Ouvre le dialog de détails
     */
    private openDetailDialog(role: Role): void {
        this.selectedRole = role;
        this.showDetailDialog = true;
        this.logger.info(`Dialog de détails ouvert pour le role: ${role.name}`);
    }

    /**
     * Gestionnaire de soumission du formulaire
     */
    onFormSubmit(role: Role): void {
        this.logger.info('Formulaire soumis avec succès', { roleId: role.id, name: role.name });
        this.closeFormDialog();
        this.roleListComponent?.loadRoles()
        // Le rafraîchissement de la liste est géré par le composant ShipListComponent
    }

    /**
     * Gestionnaire d'annulation du formulaire
     */
    onFormCancel(): void {
        this.logger.info('Formulaire annulé');
        this.closeFormDialog();
    }

    /**
     * Fermeture du dialog de formulaire
     */
    onFormDialogHide(): void {
        this.closeFormDialog();
    }

    /**
     * Ferme le dialog de formulaire
     */
    private closeFormDialog(): void {
        this.showFormDialog = false;
        this.selectedRole = null;
        this.isEditMode = false;
    }

    /**
     * Gestionnaire de fermeture des détails
     */
    onDetailCloseClick(): void {
        this.closeDetailDialog();
    }

    /**
     * Fermeture du dialog de détails
     */
    onDetailDialogHide(): void {
        this.closeDetailDialog();
    }

    /**
     * Ferme le dialog de détails
     */
    private closeDetailDialog(): void {
        this.showDetailDialog = false;
        this.selectedRole = null;
    }

    onCreate() {
        this.openCreateDialog();
    }
}
