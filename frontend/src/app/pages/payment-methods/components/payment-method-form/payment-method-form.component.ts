import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoggerService } from '../../../../core/services/logger.service';
import { Textarea } from 'primeng/textarea';
import { getErrorMessage } from '../../../../core/utilities/error';
import { FormErrorUtils } from '../../../../core/utilities/form-error.utils';
import { PaymentMethod, PaymentMethodCreate } from '../../interfaces/payment-method.interface';
import { PaymentMethodService } from '../../service/payment-method.service';
import { PAYMENT_METHOD_KEY } from '../../constants/constants';


@Component({
    selector: 'app-payment-method-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        DividerModule,
        Textarea
    ],
    standalone: true,
    providers: [ConfirmationService, MessageService],
    templateUrl: './payment-method-form.component.html',
    styleUrl: './payment-method-form.component.scss'
})
export class PaymentMethodFormComponent implements OnInit, OnChanges {
    @Input() paymentMethod: PaymentMethod | null = null;
    @Input() visible = false; // ✅ Ajout de l'Input visible manquant
    @Output() formSubmit = new EventEmitter<PaymentMethod>();
    @Output() formCancel = new EventEmitter<void>();

    paymentMethodForm!: FormGroup;
    loading = false;
    isEditMode = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly paymentMethodService: PaymentMethodService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['paymentMethod']) {
            this.updateForm();
        }
        // ✅ Correction : Reset du formulaire quand le modal se ferme
        if (changes['visible'] && !this.visible && changes['visible'].previousValue) {
            this.resetForm();
        }
    }

    private initForm(): void {
        this.paymentMethodForm = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            code: ['', [Validators.required, Validators.minLength(2)]],
            description: ['']
        });
    }

    private updateForm(): void {
        if (this.paymentMethod) {
            this.isEditMode = true;
            this.paymentMethodForm.patchValue({
                nom: this.paymentMethod.nom,
                code: this.paymentMethod.code,
                description: this.paymentMethod.description
            });
        } else {
            this.isEditMode = false;
            this.resetForm(); // ✅ Reset quand pas de paymentMethod
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.paymentMethodForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit(): void {
        if (this.paymentMethodForm.valid) {
            this.loading = true;
            const formValue = this.paymentMethodForm.value;

            if (this.isEditMode && this.paymentMethod) {
                const updatedPaymentMethod: PaymentMethod = {
                    ...this.paymentMethod,
                    ...formValue
                };

                this.paymentMethodService.updatePaymentMethod(this.paymentMethod.id, updatedPaymentMethod).subscribe({
                    next: (paymentMethod) => {
                        // ✅ Suppression du toast ici - sera géré par le parent
                        this.formSubmit.emit(paymentMethod);
                        this.loading = false;
                        this.resetForm(); // ✅ Reset après succès
                    },
                    error: (error) => {
                        this.handleError(error);
                    }
                });
            } else {
                const createRequest: PaymentMethodCreate = formValue;

                this.paymentMethodService.createPaymentMethod(createRequest).subscribe({
                    next: (paymentMethod) => {
                        // ✅ Suppression du toast ici - sera géré par le parent
                        this.formSubmit.emit(paymentMethod);
                        this.loading = false;
                        this.resetForm(); // ✅ Reset après succès
                    },
                    error: (error) => {
                        this.handleError(error);
                    }
                });
            }
        } else {
            this.markAllFieldsAsTouched();
            this.messageService.add({
                key: PAYMENT_METHOD_KEY,
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez corriger les erreurs dans le formulaire'
            });
        }
    }

    onCancel(): void {
        this.resetForm(); // ✅ Reset à l'annulation
        this.formCancel.emit();
    }

    private handleError(error: any): void {
        this.loading = false;
        this.logger.error('Erreur lors de la modification ou création', error);
        if (error?.error?.details) {
            FormErrorUtils.applyServerErrors(this.paymentMethodForm, error.error.details);
        }

        this.messageService.add({
            key: PAYMENT_METHOD_KEY,
            severity: 'error',
            summary: 'Erreur',
            detail: getErrorMessage(error)
        });
    }

    private markAllFieldsAsTouched(): void {
        Object.keys(this.paymentMethodForm.controls).forEach(key => {
            this.paymentMethodForm.get(key)?.markAsTouched();
        });
    }

    private resetForm(): void {
        this.paymentMethodForm.reset();
        this.isEditMode = false;
        this.loading = false; // ✅ Reset du loading aussi
        // ✅ Ne pas mettre paymentMethod à null ici car c'est géré par le parent
    }

    protected readonly PAYMENT_METHOD_KEY = PAYMENT_METHOD_KEY;
}
