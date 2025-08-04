// payment-methods.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Components
import { PaymentMethodListComponent } from './components/payment-method-list/payment-method-list.component';
import { PaymentMethodFormComponent } from './components/payment-method-form/payment-method-form.component';

// Interfaces & Services
import { PaymentMethod, PaymentMethodEvent, PaymentMethodCreate, PaymentMethodUpdate } from './interfaces/payment-method.interface';
import { PaymentMethodService } from './service/payment-method.service';
import {LoggerService} from "../../core/services/logger.service";
import {PAYMENT_METHOD_CONSTANTS} from "./constants/constants";

@Component({
    selector: 'app-payment-methods',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CardModule,
        ToastModule,
        ConfirmDialogModule,
        PaymentMethodListComponent,
        PaymentMethodFormComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './payment-methods.component.html',
})
export class PaymentMethodsComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    // État du dialog
    showFormDialog = false;
    formMode: 'create' | 'edit' | 'view' = 'create';
    selectedPaymentMethod: PaymentMethod | null = null;

    constructor(
        private readonly paymentMethodService: PaymentMethodService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        this.logger.info('PaymentMethodsComponent initialisé');
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Gère les événements émis par la liste des méthodes de paiement
     */
    handlePaymentMethodEvent(event: PaymentMethodEvent): void {
        this.logger.debug('Événement reçu:', event);

        switch (event.type) {
            case 'create':
                this.openCreateDialog();
                break;
            case 'edit':
                this.openEditDialog(event.paymentMethod!);
                break;
            case 'view':
                this.openViewDialog(event.paymentMethod!);
                break;
            case 'delete':
                this.confirmDelete(event.paymentMethod!);
                break;
        }
    }

    /**
     * Ouvre le dialog de création
     */
    openCreateDialog(): void {
        this.formMode = 'create';
        this.selectedPaymentMethod = null;
        this.showFormDialog = true;
    }

    /**
     * Ouvre le dialog d'édition
     */
    openEditDialog(paymentMethod: PaymentMethod): void {
        this.formMode = 'edit';
        this.selectedPaymentMethod = paymentMethod;
        this.showFormDialog = true;
    }

    /**
     * Ouvre le dialog de visualisation
     */
    openViewDialog(paymentMethod: PaymentMethod): void {
        this.formMode = 'view';
        this.selectedPaymentMethod = paymentMethod;
        this.showFormDialog = true;
    }

    /**
     * Confirme la suppression d'une méthode de paiement
     */
    confirmDelete(paymentMethod: PaymentMethod): void {
        this.confirmationService.confirm({
            message: `${PAYMENT_METHOD_CONSTANTS.MESSAGES.DELETE_CONFIRM}<br><strong>${paymentMethod.nom}</strong>`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            accept: () => this.deletePaymentMethod(paymentMethod.id),
            reject: () => {
                this.logger.debug('Suppression annulée');
            }
        });
    }

    /**
     * Supprime une méthode de paiement
     */
    private deletePaymentMethod(id: number): void {
        this.paymentMethodService.deletePaymentMethod(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: PAYMENT_METHOD_CONSTANTS.MESSAGES.DELETE_SUCCESS
                    });
                    this.logger.info(`Méthode de paiement ${id} supprimée`);
                },
                error: (error) => {
                    this.logger.error('Erreur lors de la suppression:', error);
                }
            });
    }

    /**
     * Gère la visibilité du dialog
     */
    onDialogVisibilityChange(visible: boolean): void {
        this.showFormDialog = visible;
        if (!visible) {
            this.selectedPaymentMethod = null;
        }
    }

    /**
     * Gère la sauvegarde d'une méthode de paiement
     */
    onPaymentMethodSave(data: PaymentMethodCreate | PaymentMethodUpdate): void {
        if (this.formMode === 'create') {
            this.createPaymentMethod(data as PaymentMethodCreate);
        } else if (this.formMode === 'edit' && this.selectedPaymentMethod) {
            this.updatePaymentMethod(this.selectedPaymentMethod.id, data as PaymentMethodUpdate);
        }
    }

    /**
     * Crée une nouvelle méthode de paiement
     */
    private createPaymentMethod(data: PaymentMethodCreate): void {
        this.paymentMethodService.createPaymentMethod(data)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: PAYMENT_METHOD_CONSTANTS.MESSAGES.CREATE_SUCCESS
                    });
                    this.showFormDialog = false;
                    this.logger.info('Méthode de paiement créée:', data);
                },
                error: (error) => {
                    this.logger.error('Erreur lors de la création:', error);
                }
            });
    }

    /**
     * Met à jour une méthode de paiement
     */
    private updatePaymentMethod(id: number, data: PaymentMethodUpdate): void {
        this.paymentMethodService.updatePaymentMethod(id, data)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: PAYMENT_METHOD_CONSTANTS.MESSAGES.UPDATE_SUCCESS
                    });
                    this.showFormDialog = false;
                    this.logger.info(`Méthode de paiement ${id} mise à jour:`, data);
                },
                error: (error) => {
                    this.logger.error('Erreur lors de la mise à jour:', error);
                }
            });
    }

    /**
     * Gère l'annulation du formulaire
     */
    onFormCancel(): void {
        this.showFormDialog = false;
        this.selectedPaymentMethod = null;
        this.logger.debug('Formulaire annulé');
    }
}
