import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoggerService } from '../../core/services/logger.service';
import { Button } from 'primeng/button';
import { PaymentMethodListComponent } from './components/payment-method-list/payment-method-list.component';
import { PaymentMethod, PaymentMethodEvent } from './interfaces/payment-method.interface';
import { PAYMENT_METHOD_KEY } from './constants/constants';
import { PaymentMethodFormComponent } from './components/payment-method-form/payment-method-form.component';


@Component({
    selector: 'app-payment-methods',
    imports: [
        CommonModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        Button,
        PaymentMethodListComponent,
        PaymentMethodFormComponent
    ],
    providers: [ConfirmationService, MessageService],
    standalone: true,
    templateUrl: './payment-methods.component.html',
    styleUrl: './payment-methods.component.scss'
})
export class PaymentMethodsComponent {
    // État des dialogs
    showFormDialog = false;
    showDetailDialog = false;

    @ViewChild(PaymentMethodListComponent) paymentMethodList: PaymentMethodListComponent | undefined;

    // Données
    selectedPaymentMethod: PaymentMethod | null = null;

    // Mode du formulaire
    isEditMode = false;

    constructor(
        private readonly logger: LoggerService,
        private readonly messageService: MessageService // ✅ Ajout du MessageService
    ) {
    }

    get formDialogTitle(): string {
        return this.isEditMode ? 'Modifier la méthode de paiement' : 'Nouvelle méthode de paiement';
    }

    /**
     * Gestionnaire d'événements de la liste des méthodes de paiement
     */
    onPaymentMethodEvent(event: PaymentMethodEvent): void {
        this.logger.debug('Événement méthode paiement reçu', event);

        switch (event.type) {
            case 'create':
                this.openCreateDialog();
                break;
            case 'edit':
                this.openEditDialog(event.paymentMethod!);
                break;
            case 'view':
                this.openDetailDialog(event.paymentMethod!);
                break;
            default:
                this.logger.warn('Type d\'événement non géré', event.type);
        }
    }

    onFormSubmit(paymentMethod: PaymentMethod): void {
        this.logger.info('Formulaire soumis avec succès', { id: paymentMethod.id, nom: paymentMethod.nom });

        // ✅ Affichage du toast de succès dans le parent
        this.messageService.add({
            key: PAYMENT_METHOD_KEY,
            severity: 'success',
            summary: 'Succès',
            detail: this.isEditMode
                ? `Méthode de paiement "${paymentMethod.nom}" modifiée avec succès`
                : `Méthode de paiement "${paymentMethod.nom}" créée avec succès`
        });

        // ✅ Fermeture du dialog et reload de la liste
        this.closeFormDialog();
        this.paymentMethodList?.loadPaymentMethods();
    }

    onFormCancel(): void {
        this.logger.info('Formulaire annulé');
        this.closeFormDialog();
    }

    onFormDialogHide(): void {
        // ✅ Cette méthode est appelée quand l'utilisateur ferme le dialog par X ou ESC
        this.closeFormDialog();
    }

    private closeFormDialog(): void {
        this.showFormDialog = false;
        // ✅ Utilisation d'un délai pour permettre à l'animation de se terminer
        setTimeout(() => {
            this.selectedPaymentMethod = null;
            this.isEditMode = false;
        }, 100);
    }

    /**
     * Ouvre le dialog de création
     */
    private openCreateDialog(): void {
        this.selectedPaymentMethod = null;
        this.isEditMode = false;
        this.showFormDialog = true;
        this.logger.info('Dialog de création de méthode de paiement ouvert');
    }

    /**
     * Ouvre le dialog d'édition
     */
    private openEditDialog(paymentMethod: PaymentMethod): void {
        this.selectedPaymentMethod = paymentMethod;
        this.isEditMode = true;
        this.showFormDialog = true;
        this.logger.info(`Dialog d'édition ouvert pour la méthode de paiement: ${paymentMethod.nom}`);
    }

    /**
     * Ouvre le dialog de détails
     */
    private openDetailDialog(paymentMethod: PaymentMethod): void {
        this.selectedPaymentMethod = paymentMethod;
        this.showDetailDialog = true;
        this.logger.info(`Dialog de détails ouvert pour la méthode de paiement: ${paymentMethod.nom}`);
    }

    onCreate() {
        this.openCreateDialog();
    }

    protected readonly PAYMENT_METHOD_KEY = PAYMENT_METHOD_KEY;
}
