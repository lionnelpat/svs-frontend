import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { CalendarModule } from 'primeng/calendar';
import { LoggerService } from '../../../../core/services/logger.service';
import { MessageService } from 'primeng/api';
import { CreateRoleRequest, Role, UpdateRoleRequest } from '../../interfaces/role.interface';
import { RoleService } from '../../services/role.service';
import { Textarea } from 'primeng/textarea';

@Component({
    selector: 'app-role-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        DividerModule,
        CalendarModule,
        Textarea
    ],
    templateUrl: './role-form.component.html',
    styleUrls: ['./role-form.component.scss']
})
export class RoleFormComponent implements OnInit, OnChanges {
    @Input() role: Role | null = null;
    @Input() visible = false;
    @Output() formSubmit = new EventEmitter<Role>();
    @Output() formCancel = new EventEmitter<void>();

    roleForm!: FormGroup;
    loading = false;
    isEditMode = false;

    readonly MAX_DESCRIPTION_LENGTH = 1000;

    constructor(
        private fb: FormBuilder,
        private roleService: RoleService,
        private messageService: MessageService,
        private logger: LoggerService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['role'] && this.roleForm) {
            this.updateForm();
        }
    }

    private initForm(): void {
        this.roleForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
            isActive: [true]
        });

        // Validation personnalisée pour tonnage net < tonnage brut
        // this.shipForm.addValidators(this.tonnageValidator);

        this.updateForm();
    }


    private updateForm(): void {
        if (this.role) {
            this.isEditMode = true;
            this.roleForm.patchValue({
                name: this.role.name,
                displayName: this.role.displayName,
                description: this.role.description,
                isActive: this.role.isActive
            });
        } else {
            this.isEditMode = false;
            this.roleForm.reset();
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.roleForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onCallSignChange(event: any): void {
        const value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        this.roleForm.patchValue({ id: value }, { emitEvent: false });
    }


    onSubmit(): void {
        if (this.roleForm.valid) {
            this.loading = true;
            const formValue = this.roleForm.value;

            if (this.isEditMode && this.role) {
                const updateRequest: UpdateRoleRequest = {
                    id: this.role.id,
                    ...formValue
                };

                this.roleService.updateRole(this.role.id, updateRequest).subscribe({
                    next: (updatedRole) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Role "${updatedRole.name}" modifié avec succès`
                        });
                        this.formSubmit.emit(updatedRole);
                        this.loading = false;
                        this.resetForm();
                    },
                    error: (error) => {
                        this.loading = false;
                        this.logger.error('Erreur lors de la modification', error);
                    }
                });
            } else {
                const createRequest: CreateRoleRequest = formValue;

                this.roleService.createRole(createRequest).subscribe({
                    next: (newRole) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Role "${newRole.name}" créé avec succès`
                        });
                        this.formSubmit.emit(newRole);
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
            Object.keys(this.roleForm.controls).forEach(key => {
                this.roleForm.get(key)?.markAsTouched();
            });

            this.messageService.add({
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
        this.roleForm.reset();
        this.isEditMode = false;
        this.role = null;
    }

    getFieldError(fieldName: string): string | null {
        const control = this.roleForm.get(fieldName);
        if (control?.errors && control.touched) {
            if (control.errors['required']) return `${fieldName} est obligatoire`;
            if (control.errors['minlength']) return `${fieldName} trop court`;
            if (control.errors['maxlength']) return `${fieldName} trop long`;
            if (control.errors['min']) return `Valeur minimale non respectée`;
        }
        return null;
    }
}
