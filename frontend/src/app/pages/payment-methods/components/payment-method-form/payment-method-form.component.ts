// components/payment-method-form/payment-method-form.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Interfaces & Services
import {
    PaymentMethod,
    PaymentMethodCreate,
    PaymentMethodUpdate
} from '../../interfaces/payment-method.interface';
import { PaymentMethodService } from '../../service/payment-method.service';
import {Textarea} from "primeng/textarea";
import {LoggerService} from "../../../../core/services/logger.service";
import {PAYMENT_METHOD_CONSTANTS} from "../../constants/constants";


@Component({
    selector: 'app-payment-method-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        CheckboxModule,
        MessageModule,
        MessagesModule,
        ProgressSpinnerModule,
        Textarea
    ],
    templateUrl: './payment-method-form.component.html',
    styleUrl: './payment-method-form.component.scss'
})
export class PaymentMethodFormComponent implements OnInit, OnChanges {
    private readonly destroy$ = new Subject<void>();

    @Input() visible = false;
    @Input() mode: 'create' | 'edit' | 'view' = 'create';
    @Input() paymentMethod: PaymentMethod | null = null;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() paymentMethodSave = new EventEmitter<PaymentMethodCreate | PaymentMethodUpdate>();
    @Output() cancel = new EventEmitter<void>();

    paymentMethodForm!: FormGroup;
    saving = false;
    formErrors: any[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly paymentMethodService: PaymentMethodService,
        private readonly logger: LoggerService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.setupValidationWatchers();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['paymentMethod'] && this.paymentMethod) {
            this.populateForm();
        }

        if (changes['mode']) {
            this.updateFormValidators();
        }

        if (changes['visible'] && this.visible) {
            this.resetForm();
        }
    }

    /**
     * Initialise le formulaire
     */
    private initializeForm(): void {
        this.paymentMethodForm = this.fb.group({
            nom: ['', [
                Validators.required,
                Validators.minLength(PAYMENT_METHOD_CONSTANTS.MIN_NAME_LENGTH),
                Validators.maxLength(PAYMENT_METHOD_CONSTANTS.MAX_NAME_LENGTH),
                Validators.pattern(PAYMENT_METHOD_CONSTANTS.PATTERNS.NAME)
            ]],
            code: ['', [
                Validators.required,
                Validators.minLength(PAYMENT_METHOD_CONSTANTS.MIN_CODE_LENGTH),
                Validators.maxLength(PAYMENT_METHOD_CONSTANTS.MAX_CODE_LENGTH),
                Validators.pattern(PAYMENT_METHOD_CONSTANTS.PATTERNS.CODE)
            ]],
            description: ['', [
                Validators.maxLength(PAYMENT_METHOD_CONSTANTS.MAX_DESCRIPTION_LENGTH)
            ]],
            actif: [true]
        });
    }

    /**
     * Configure les watchers de validation
     */
    private setupValidationWatchers(): void {
        // Validation du code en temps réel
        this.paymentMethodForm.get('code')?.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(code => {
                    if (!code || code.length < 2 || this.mode === 'view') {
                        return of(null);
                    }

                    // Ne pas valider si c'est le même code en mode édition
                    if (this.mode === 'edit' && this.paymentMethod?.code === code) {
                        return of(null);
                    }

                    return this.paymentMethodService.checkPaymentMethodExists(undefined, code);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (exists) => {
                    const codeControl = this.paymentMethodForm.get('code');
                    if (exists && codeControl) {
                        codeControl.setErrors({ ...codeControl.errors, codeExists: true });
                    } else if (codeControl?.errors?.['codeExists']) {
                        delete codeControl.errors['codeExists'];
                        if (Object.keys(codeControl.errors).length === 0) {
                            codeControl.setErrors(null);
                        }
                    }
                },
                error: (error) => {
                    this.logger.error('Erreur validation code:', error);
                }
            });

        // Validation du nom en temps réel
        this.paymentMethodForm.get('nom')?.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(nom => {
                    if (!nom || nom.length < 2 || this.mode === 'view') {
                        return of(null);
                    }

                    // Ne pas valider si c'est le même nom en mode édition
                    if (this.mode === 'edit' && this.paymentMethod?.nom === nom) {
                        return of(null);
                    }

                    return this.paymentMethodService.checkPaymentMethodExists(nom);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (exists) => {
                    const nomControl = this.paymentMethodForm.get('nom');
                    if (exists && nomControl) {
                        nomControl.setErrors({ ...nomControl.errors, nomExists: true });
                    } else if (nomControl?.errors?.['nomExists']) {
                        delete nomControl.errors['nomExists'];
                        if (Object.keys(nomControl.errors).length === 0) {
                            nomControl.setErrors(null);
                        }
                    }
                },
                error: (error) => {
                    this.logger.error('Erreur validation nom:', error);
                }
            });

        // Auto-uppercase pour le code
        this.paymentMethodForm.get('code')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(value => {
                if (value && typeof value === 'string') {
                    const upperValue = value.toUpperCase();
                    if (value !== upperValue) {
                        this.paymentMethodForm.get('code')?.setValue(upperValue, { emitEvent: false });
                    }
                }
            });
    }

    /**
     * Met à jour les validateurs selon le mode
     */
    private updateFormValidators(): void {
        if (this.mode === 'view') {
            this.paymentMethodForm.disable();
        } else {
            this.paymentMethodForm.enable();
        }
    }

    /**
     * Remplit le formulaire avec les données
     */
    private populateForm(): void {
        if (this.paymentMethod) {
            this.paymentMethodForm.patchValue({
                nom: this.paymentMethod.nom,
                code: this.paymentMethod.code,
                description: this.paymentMethod.description ?? '',
                actif: this.paymentMethod.actif
            });
        }
    }

    /**
     * Remet à zéro le formulaire
     */
    private resetForm(): void {
        this.formErrors = [];
        this.saving = false;

        if (this.mode === 'create') {
            this.paymentMethodForm.reset({
                nom: '',
                code: '',
                description: '',
                actif: true
            });
        }

        this.paymentMethodForm.markAsUntouched();
        this.updateFormValidators();
    }

    /**
     * Gère la soumission du formulaire
     */
    onSubmit(): void {
        if (this.paymentMethodForm.invalid || this.saving || this.mode === 'view') {
            this.markAllFieldsAsTouched();
            return;
        }

        this.saving = true;
        this.formErrors = [];

        const formValue = this.paymentMethodForm.value;
        const data = {
            nom: formValue.nom?.trim(),
            code: formValue.code?.trim().toUpperCase(),
            description: formValue.description?.trim() ?? undefined
        };

        // Ajouter actif seulement en mode édition
        if (this.mode === 'edit') {
            (data as any).actif = formValue.actif;
        }

        this.paymentMethodSave.emit(data);
    }

    /**
     * Marque tous les champs comme touchés
     */
    private markAllFieldsAsTouched(): void {
        Object.keys(this.paymentMethodForm.controls).forEach(key => {
            this.paymentMethodForm.get(key)?.markAsTouched();
        });
    }

    /**
     * Gère l'annulation
     */
    onCancel(): void {
        this.cancel.emit();
    }

    /**
     * Gère la fermeture du dialog
     */
    onHide(): void {
        this.visibleChange.emit(false);
    }

    /**
     * Vérifie si un champ est invalide
     */
    isFieldInvalid(fieldName: string): boolean {
        const field = this.paymentMethodForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    /**
     * Obtient l'erreur d'un champ
     */
    getFieldError(fieldName: string): string {
        const field = this.paymentMethodForm.get(fieldName);
        if (!field || !field.errors) return '';

        const errors = field.errors;

        if (errors['required']) {
            return PAYMENT_METHOD_CONSTANTS.VALIDATION_MESSAGES.REQUIRED;
        }
        if (errors['minlength']) {
            return PAYMENT_METHOD_CONSTANTS.VALIDATION_MESSAGES.MIN_LENGTH
                .replace('{0}', errors['minlength'].requiredLength);
        }
        if (errors['maxlength']) {
            return PAYMENT_METHOD_CONSTANTS.VALIDATION_MESSAGES.MAX_LENGTH
                .replace('{0}', errors['maxlength'].requiredLength);
        }
        if (errors['pattern']) {
            if (fieldName === 'code') {
                return 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets et underscores';
            }
            return PAYMENT_METHOD_CONSTANTS.VALIDATION_MESSAGES.PATTERN;
        }
        if (errors['codeExists']) {
            return PAYMENT_METHOD_CONSTANTS.VALIDATION_MESSAGES.CODE_ALREADY_EXISTS;
        }
        if (errors['nomExists']) {
            return PAYMENT_METHOD_CONSTANTS.VALIDATION_MESSAGES.NAME_ALREADY_EXISTS;
        }

        return 'Erreur de validation';
    }

    /**
     * Getters pour le template
     */
    get dialogTitle(): string {
        switch (this.mode) {
            case 'create': return 'Nouvelle méthode de paiement';
            case 'edit': return 'Modifier la méthode de paiement';
            case 'view': return 'Détails de la méthode de paiement';
            default: return 'Méthode de paiement';
        }
    }

    get submitButtonLabel(): string {
        return this.mode === 'create' ? 'Créer' : 'Modifier';
    }

    get isViewMode(): boolean {
        return this.mode === 'view';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
