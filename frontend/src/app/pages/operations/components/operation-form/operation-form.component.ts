// pages/operations/components/operation-form/operation-form.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { CreateOperationRequest, Operation, UpdateOperationRequest } from '../../../../shared/models/operation.model';
import { OperationService } from '../../../service/operation.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { MessageService } from 'primeng/api';
import {Toast} from "primeng/toast";
import {OPERATION_KEY} from "../../constants/constant";
import {Textarea} from "primeng/textarea";

@Component({
    selector: 'app-operation-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        DividerModule,
        Toast,
        Textarea
    ],
    templateUrl: './operation-form.component.html',
    styleUrl: "./operation-form.component.scss",
})
export class OperationFormComponent implements OnInit, OnChanges {
    @Input() operation: Operation | null = null;

    @Output() formSubmit = new EventEmitter<Operation>();
    @Output() formCancel = new EventEmitter<void>();

    @Input() set visible(val: boolean) {
        console.log('👁️ FormComponent visible =', val);
        this._visible = val;
    }
    private _visible = false;
    get visible(): boolean {
        return this._visible;
    }

    operationForm!: FormGroup;
    loading = false;
    isEditMode = false;
    exchangeRate = 656; // Taux par défaut XOF/EUR

    constructor(
        private readonly fb: FormBuilder,
        private readonly operationService: OperationService,
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.initForm();
        this.exchangeRate = this.operationService.getExchangeRate();
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('🌀 OperationForm ngOnChanges', changes);
        if (changes['operation'] && this.operationForm) {
            this.updateForm();
        }
    }

    private initForm(): void {
        this.operationForm = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            prixXOF: [0, [Validators.required, Validators.min(0)]],
            prixEURO: [0, [Validators.required, Validators.min(0)]]
        });

        this.updateForm();
    }

    private updateForm(): void {
        if (this.operation) {
            this.isEditMode = true;
            this.operationForm.patchValue({
                nom: this.operation.nom,
                description: this.operation.description,
                prixXOF: this.operation.prixXOF,
                prixEURO: this.operation.prixEURO
            });
        } else {
            this.isEditMode = false;
            this.operationForm.reset({
                nom: '',
                description: '',
                prixXOF: 0,
                prixEURO: 0
            });
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.operationForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onPrixXOFChange(event: any): void {
        const xofValue = event.value || 0;
        if (xofValue > 0 && this.exchangeRate > 0) {
            const euroValue = Math.round((xofValue / this.exchangeRate) * 100) / 100;
            this.operationForm.patchValue({ prixEURO: euroValue }, { emitEvent: false });
        }
    }

    onPrixEUROChange(event: any): void {
        const euroValue = event.value || 0;
        if (euroValue > 0 && this.exchangeRate > 0) {
            const xofValue = Math.round(euroValue * this.exchangeRate);
            this.operationForm.patchValue({ prixXOF: xofValue }, { emitEvent: false });
        }
    }

    showExchangeRate(): boolean {
        const xofValue = this.operationForm.get('prixXOF')?.value || 0;
        const euroValue = this.operationForm.get('prixEURO')?.value || 0;
        return xofValue > 0 && euroValue > 0;
    }

    getCalculatedRate(): string {
        const xofValue = this.operationForm.get('prixXOF')?.value || 0;
        const euroValue = this.operationForm.get('prixEURO')?.value || 0;

        if (euroValue > 0) {
            const rate = Math.round(xofValue / euroValue);
            return new Intl.NumberFormat('fr-FR').format(rate);
        }

        return new Intl.NumberFormat('fr-FR').format(this.exchangeRate);
    }

    onSubmit(): void {
        if (this.operationForm.valid) {
            this.loading = true;
            const formValue = this.operationForm.value;

            if (this.isEditMode && this.operation) {
                const updateRequest: UpdateOperationRequest = {
                    id: this.operation.id,
                    ...formValue
                };

                this.operationService.updateOperation(updateRequest).subscribe({
                    next: (updatedOperation) => {
                        this.messageService.add({
                            key: OPERATION_KEY,
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Opération "${updatedOperation.nom}" modifiée avec succès`
                        });
                        this.formSubmit.emit(updatedOperation);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la modification', error);
                    }
                });
            } else {
                const createRequest: CreateOperationRequest = formValue;

                this.operationService.createOperation(createRequest).subscribe({
                    next: (newOperation) => {
                        this.messageService.add({
                            key: OPERATION_KEY,
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Opération "${newOperation.nom}" créée avec succès`
                        });
                        this.formSubmit.emit(newOperation);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la création', error);
                    }
                });
            }
        } else {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            Object.keys(this.operationForm.controls).forEach(key => {
                this.operationForm.get(key)?.markAsTouched();
            });

            this.messageService.add({
                key: OPERATION_KEY,
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez corriger les erreurs dans le formulaire'
            });
        }
    }

    onCancel(): void {
        this.resetForm();
        this.formCancel.emit();
    }

    private resetForm(): void {
        this.operationForm.reset({
            nom: '',
            description: '',
            prixXOF: 0,
            prixEURO: 0
        });
        this.isEditMode = false;
        this.operation = null;
    }

    protected readonly OPERATION_KEY = OPERATION_KEY;
}
