// src/app/pages/users/components/user-form/user-form.component.ts
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import {FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { Subject, takeUntil, of } from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import { UserService } from '../../service/user.service';
import { RoleService } from '../../../roles/services/role.service';
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    USER_ERROR_MESSAGES,
    UserRole
} from '../../interfaces/user.interface';
import { USER_VALIDATION_RULES } from '../../constants/constants';
import {ButtonDirective} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {Panel} from "primeng/panel";
import {NgIf} from "@angular/common";
import {Password} from "primeng/password";
import {Divider} from "primeng/divider";
import {PrimeTemplate} from "primeng/api";
import {MultiSelect} from "primeng/multiselect";
import {Checkbox} from "primeng/checkbox";
import {InputText} from "primeng/inputtext";

interface RoleOption {
    id: number;
    name: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

@Component({
    selector: 'app-user-form',
    standalone: true,
    templateUrl: './user-form.component.html',
    imports: [
        ButtonDirective,
        Ripple,
        Panel,
        NgIf,
        Password,
        Divider,
        PrimeTemplate,
        MultiSelect,
        Checkbox,
        InputText,
        ReactiveFormsModule,
        FormsModule
    ],
    styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit, OnChanges, OnDestroy {
    private readonly userService = inject(UserService);
    private readonly roleService = inject(RoleService);
    private readonly fb = inject(FormBuilder);
    private readonly destroy$ = new Subject<void>();

    // Inputs
    @Input() user: User | null = null;
    @Input() isEditMode = false;
    @Input() canManageRoles = false;

    // Outputs
    @Output() userSaved = new EventEmitter<User>();
    @Output() cancelled = new EventEmitter<void>();

    // Formulaire
    userForm!: FormGroup;
    passwordForm!: FormGroup;
    submitted = false;
    loading = false;

    // Options des rôles
    availableRoles: UserRole[] = [];
    selectedRoles: UserRole[] = [];

    // Configuration
    showPasswordSection = false;
    showChangePassword = false;
    passwordRequired = true;

    // Messages d'erreur
    readonly ERROR_MESSAGES = USER_ERROR_MESSAGES;

    // Validation rules
    readonly VALIDATION_RULES = USER_VALIDATION_RULES;

    constructor() {
        this.initializeForms();
    }

    ngOnInit() {
        this.loadAvailableRoles();
        this.setupFormValidation();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['user'] && this.userForm) {
            this.populateForm();
        }

        if (changes['isEditMode']) {
            this.passwordRequired = !this.isEditMode;
            this.updatePasswordValidation();
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Initialise les formulaires
     */
    private initializeForms(): void {
        this.userForm = this.fb.group({
            username: ['', [
                Validators.required,
                Validators.minLength(this.VALIDATION_RULES.USERNAME.MIN_LENGTH),
                Validators.maxLength(this.VALIDATION_RULES.USERNAME.MAX_LENGTH),
                Validators.pattern(this.VALIDATION_RULES.USERNAME.PATTERN)
            ]],
            email: ['', [
                Validators.required,
                Validators.email,
                Validators.maxLength(this.VALIDATION_RULES.EMAIL.MAX_LENGTH)
            ]],
            firstName: ['', [
                Validators.required,
                Validators.minLength(this.VALIDATION_RULES.NAME.MIN_LENGTH),
                Validators.maxLength(this.VALIDATION_RULES.NAME.MAX_LENGTH),
                Validators.pattern(this.VALIDATION_RULES.NAME.PATTERN)
            ]],
            lastName: ['', [
                Validators.required,
                Validators.minLength(this.VALIDATION_RULES.NAME.MIN_LENGTH),
                Validators.maxLength(this.VALIDATION_RULES.NAME.MAX_LENGTH),
                Validators.pattern(this.VALIDATION_RULES.NAME.PATTERN)
            ]],
            phone: ['', [
                Validators.pattern(this.VALIDATION_RULES.PHONE.PATTERN)
            ]],
            isActive: [true],
            isEmailVerified: [false],
            roleIds: [[], [Validators.required]]
        });

        this.passwordForm = this.fb.group({
            password: ['', [
                this.passwordRequired ? Validators.required : Validators.nullValidator,
                Validators.minLength(this.VALIDATION_RULES.PASSWORD.MIN_LENGTH),
                Validators.maxLength(this.VALIDATION_RULES.PASSWORD.MAX_LENGTH)
            ]],
            confirmPassword: ['', [
                this.passwordRequired ? Validators.required : Validators.nullValidator
            ]]
        }, {
            validators: this.passwordMatchValidator
        });

        // En mode édition, désactiver le nom d'utilisateur
        if (this.isEditMode) {
            this.userForm.get('username')?.disable();
        }
    }

    /**
     * Validateur pour vérifier que les mots de passe correspondent
     */
    private passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (!password || !confirmPassword) {
            return null;
        }

        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        } else {
            // Supprimer l'erreur de correspondance si elle existe
            const errors = confirmPassword.errors;
            if (errors) {
                delete errors['passwordMismatch'];
                confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
            }
        }

        return null;
    }

    /**
     * Met à jour la validation du mot de passe
     */
    private updatePasswordValidation(): void {
        const passwordControl = this.passwordForm.get('password');
        const confirmPasswordControl = this.passwordForm.get('confirmPassword');

        if (this.passwordRequired) {
            passwordControl?.setValidators([
                Validators.required,
                Validators.minLength(this.VALIDATION_RULES.PASSWORD.MIN_LENGTH),
                Validators.maxLength(this.VALIDATION_RULES.PASSWORD.MAX_LENGTH)
            ]);
            confirmPasswordControl?.setValidators([Validators.required]);
        } else {
            passwordControl?.setValidators([
                Validators.minLength(this.VALIDATION_RULES.PASSWORD.MIN_LENGTH),
                Validators.maxLength(this.VALIDATION_RULES.PASSWORD.MAX_LENGTH)
            ]);
            confirmPasswordControl?.setValidators([]);
        }

        passwordControl?.updateValueAndValidity();
        confirmPasswordControl?.updateValueAndValidity();
    }

    /**
     * Configure la validation du formulaire
     */
    private setupFormValidation(): void {
        // Validation asynchrone du nom d'utilisateur (unicité)
        if (!this.isEditMode) {
            const usernameControl = this.userForm.get('username');
            usernameControl?.setAsyncValidators([this.usernameUniqueValidator.bind(this)]);
        }

        // Validation asynchrone de l'email (unicité)
        const emailControl = this.userForm.get('email');
        emailControl?.setAsyncValidators([this.emailUniqueValidator.bind(this)]);
    }

    /**
     * Validateur asynchrone pour l'unicité du nom d'utilisateur
     */
    private usernameUniqueValidator(control: AbstractControl) {
        if (!control.value || control.value.length < 3) {
            return of(null);
        }

        // TODO: Implémenter la vérification d'unicité côté serveur
        // return this.userService.checkUsernameUnique(control.value)
        //     .pipe(
        //         map(isUnique => isUnique ? null : { usernameExists: true }),
        //         catchError(() => of(null))
        //     );

        return of(null);
    }

    /**
     * Validateur asynchrone pour l'unicité de l'email
     */
    private emailUniqueValidator(control: AbstractControl) {
        if (!control.value || !control.valid) {
            return of(null);
        }

        // Ignorer la validation si c'est l'email actuel en mode édition
        if (this.isEditMode && this.user && control.value === this.user.email) {
            return of(null);
        }

        // TODO: Implémenter la vérification d'unicité côté serveur
        // return this.userService.checkEmailUnique(control.value)
        //     .pipe(
        //         map(isUnique => isUnique ? null : { emailExists: true }),
        //         catchError(() => of(null))
        //     );

        return of(null);
    }

    /**
     * Charge les rôles disponibles
     */
    private loadAvailableRoles(): void {
        this.roleService.getActiveRoles().pipe(
            map(response => response.map(role => ({
                id: role.id,
                name: role.name,
                description: role.description,
                isActive: role.isActive
            })))
        ).subscribe((formattedRoles: UserRole[]) => {
            // Appliquer les permissions
            if (!this.canManageRoles) {
                this.availableRoles = formattedRoles.filter(role =>
                    role.name === 'ROLE_USER' || role.name === 'ROLE_MANAGER'
                );
            } else {
                this.availableRoles = formattedRoles;
            }
        });
    }

    /**
     * Remplit le formulaire avec les données de l'utilisateur
     */
    private populateForm(): void {
        if (!this.user) {
            this.userForm.reset({
                isActive: true,
                isEmailVerified: false,
                roleIds: []
            });
            this.selectedRoles = [];
            return;
        }

        // Remplir le formulaire principal
        this.userForm.patchValue({
            username: this.user.username,
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            phone: this.user.phone,
            isActive: this.user.isActive,
            isEmailVerified: this.user.isEmailVerified,
            roleIds: this.user.roles.map(role => role.id)
        });

        // Sélectionner les rôles
        this.selectedRoles = this.availableRoles.filter(role =>
            this.user!.roles.some(userRole => userRole.id === role.id)
        );
    }

    /**
     * Gère le changement de sélection des rôles
     */
    onRolesChange(selectedRoles: UserRole[]): void {
        this.selectedRoles = selectedRoles;
        const roleIds = selectedRoles.map(role => role.id);
        this.userForm.patchValue({ roleIds });
    }

    /**
     * Bascule l'affichage de la section mot de passe
     */
    togglePasswordSection(): void {
        this.showPasswordSection = !this.showPasswordSection;

        if (this.isEditMode) {
            this.passwordRequired = this.showPasswordSection;
            this.updatePasswordValidation();
        }
    }

    /**
     * Sauvegarde l'utilisateur
     */
    onSave(): void {
        this.submitted = true;

        // Valider le formulaire principal
        if (this.userForm.invalid) {
            this.markFormGroupTouched(this.userForm);
            return;
        }

        // Valider le formulaire de mot de passe si nécessaire
        if ((!this.isEditMode || this.showPasswordSection) && this.passwordForm.invalid) {
            this.markFormGroupTouched(this.passwordForm);
            return;
        }

        this.loading = true;

        if (this.isEditMode) {
            this.updateUser();
        } else {
            this.createUser();
        }
    }

    /**
     * Crée un nouvel utilisateur
     */
    private createUser(): void {
        const formValue = { ...this.userForm.value };
        const passwordValue = this.passwordForm.value;

        const createRequest: CreateUserRequest = {
            username: formValue.username,
            email: formValue.email,
            password: passwordValue.password,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            phone: formValue.phone || undefined,
            isActive: formValue.isActive,
            isEmailVerified: formValue.isEmailVerified,
            roleIds: formValue.roleIds
        };

        this.userService.createUser(createRequest)
            .pipe(
                takeUntil(this.destroy$),
                catchError(error => {
                    this.loading = false;
                    this.handleFormErrors(error);
                    return of(null);
                })
            )
            .subscribe(user => {
                if (user) {
                    this.loading = false;
                    this.userSaved.emit(user);
                }
            });
    }

    /**
     * Met à jour un utilisateur existant
     */
    private updateUser(): void {
        if (!this.user) return;

        const formValue = { ...this.userForm.getRawValue() }; // getRawValue pour inclure les champs désactivés

        const updateRequest: UpdateUserRequest = {
            email: formValue.email,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            phone: formValue.phone || undefined,
            isActive: formValue.isActive,
            isEmailVerified: formValue.isEmailVerified,
            roleIds: formValue.roleIds
        };

        this.userService.updateUser(this.user.id, updateRequest)
            .pipe(
                takeUntil(this.destroy$),
                catchError(error => {
                    this.loading = false;
                    this.handleFormErrors(error);
                    return of(null);
                })
            )
            .subscribe(user => {
                if (user) {
                    // Changer le mot de passe si nécessaire
                    if (this.showPasswordSection && this.passwordForm.valid && this.passwordForm.value.password) {
                        this.changePassword(user);
                    } else {
                        this.loading = false;
                        this.userSaved.emit(user);
                    }
                }
            });
    }

    /**
     * Change le mot de passe de l'utilisateur
     */
    private changePassword(user: User): void {
        const passwordValue = this.passwordForm.value;

        const changePasswordRequest = {
            userId: user.id,
            newPassword: passwordValue.password,
            confirmPassword: passwordValue.confirmPassword
        };

        this.userService.changePassword(changePasswordRequest)
            .pipe(
                takeUntil(this.destroy$),
                catchError(error => {
                    this.loading = false;
                    this.handleFormErrors(error);
                    return of(null);
                })
            )
            .subscribe(response => {
                if (response) {
                    this.loading = false;
                    this.userSaved.emit(user);
                }
            });
    }

    /**
     * Annule l'édition
     */
    onCancel(): void {
        this.cancelled.emit();
    }

    /**
     * Marque tous les champs d'un formulaire comme touchés
     */
    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    /**
     * Gère les erreurs du formulaire
     */
    private handleFormErrors(error: any): void {
        if (error.error && error.error.violations) {
            // Gestion des erreurs de validation côté serveur
            error.error.violations.forEach((violation: any) => {
                const control = this.userForm.get(violation.field) || this.passwordForm.get(violation.field);
                if (control) {
                    control.setErrors({ serverError: violation.message });
                }
            });
        }
    }

    /**
     * Obtient le message d'erreur pour un champ
     */
    getFieldError(fieldName: string, formGroup: FormGroup = this.userForm): string {
        const control = formGroup.get(fieldName);
        if (!control || !control.errors || !control.touched) {
            return '';
        }

        const errors = control.errors;

        if (errors['required']) {
            return this.getRequiredMessage(fieldName);
        }

        if (errors['email']) {
            return this.ERROR_MESSAGES.EMAIL_INVALID;
        }

        if (errors['minlength']) {
            return this.getMinLengthMessage(fieldName, errors['minlength'].requiredLength);
        }

        if (errors['maxlength']) {
            return this.getMaxLengthMessage(fieldName, errors['maxlength'].requiredLength);
        }

        if (errors['pattern']) {
            return this.getPatternMessage(fieldName);
        }

        if (errors['passwordMismatch']) {
            return this.ERROR_MESSAGES.PASSWORD_MISMATCH;
        }

        if (errors['usernameExists']) {
            return this.ERROR_MESSAGES.USERNAME_EXISTS;
        }

        if (errors['emailExists']) {
            return this.ERROR_MESSAGES.EMAIL_EXISTS;
        }

        if (errors['serverError']) {
            return errors['serverError'];
        }

        return 'Erreur de validation';
    }

    /**
     * Messages d'erreur personnalisés
     */
    private getRequiredMessage(fieldName: string): string {
        const messages: { [key: string]: string } = {
            username: this.ERROR_MESSAGES.USERNAME_REQUIRED,
            email: this.ERROR_MESSAGES.EMAIL_REQUIRED,
            password: this.ERROR_MESSAGES.PASSWORD_REQUIRED,
            confirmPassword: this.ERROR_MESSAGES.PASSWORD_REQUIRED,
            firstName: this.ERROR_MESSAGES.FIRST_NAME_REQUIRED,
            lastName: this.ERROR_MESSAGES.LAST_NAME_REQUIRED,
            roleIds: this.ERROR_MESSAGES.ROLES_REQUIRED
        };
        return messages[fieldName] || `${fieldName} est requis`;
    }

    private getMinLengthMessage(fieldName: string, requiredLength: number): string {
        if (fieldName === 'username') {
            return this.ERROR_MESSAGES.USERNAME_MIN_LENGTH;
        }
        if (fieldName === 'password') {
            return this.ERROR_MESSAGES.PASSWORD_MIN_LENGTH;
        }
        return `Minimum ${requiredLength} caractères requis`;
    }

    private getMaxLengthMessage(fieldName: string, maxLength: number): string {
        if (fieldName === 'username') {
            return this.ERROR_MESSAGES.USERNAME_MAX_LENGTH;
        }
        return `Maximum ${maxLength} caractères autorisés`;
    }

    private getPatternMessage(fieldName: string): string {
        const messages: { [key: string]: string } = {
            username: this.VALIDATION_RULES.USERNAME.PATTERN_MESSAGE,
            firstName: this.VALIDATION_RULES.NAME.PATTERN_MESSAGE,
            lastName: this.VALIDATION_RULES.NAME.PATTERN_MESSAGE,
            phone: this.VALIDATION_RULES.PHONE.PATTERN_MESSAGE,
            password: this.VALIDATION_RULES.PASSWORD.PATTERN_MESSAGE
        };
        return messages[fieldName] || 'Format invalide';
    }

    /**
     * Vérifie si un champ a une erreur
     */
    hasFieldError(fieldName: string, formGroup: FormGroup = this.userForm): boolean {
        const control = formGroup.get(fieldName);
        return !!(control && control.errors && control.touched);
    }

    /**
     * Obtient la classe CSS pour un champ
     */
    getFieldClass(fieldName: string, formGroup: FormGroup = this.userForm): string {
        return this.hasFieldError(fieldName, formGroup) ? 'ng-invalid ng-dirty w-full' : '';
    }
}
