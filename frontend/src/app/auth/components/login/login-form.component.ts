import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Message } from 'primeng/message';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from './services/auth.service';
import { ErrorResponse, LoginRequest } from './interfaces/auth.interface';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputText,
        Password,
        ButtonDirective,
        NgOptimizedImage,
        Message,
        Toast
    ],
    providers: [MessageService]
})
export class LoginFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly messageService = inject(MessageService);

    form!: FormGroup;
    errorMessage = signal<string>('');
    returnUrl = '';

    // Signaux pour l'état réactif
    isLoading = this.authService.isLoading;

    constructor() {
        this.initializeForm();
    }

    ngOnInit(): void {
        // Récupérer l'URL de retour s'il y en a une
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';

        // Si déjà connecté, rediriger
        if (this.authService.isAuthenticated()) {
            this.router.navigate([this.returnUrl]);
        }
    }

    private initializeForm(): void {
        this.form = this.fb.group({
            username: ['admin', [Validators.required, Validators.minLength(5)]],
            password: ['Admin123!', [Validators.required, Validators.minLength(8)]]
        });
    }

    login(): void {
        if (this.form.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.errorMessage.set('');
        const credentials: LoginRequest = this.form.value;

        this.authService.login(credentials).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Connexion réussie',
                    detail: `Bienvenue ${response.user.fullName}!`
                });

                // La redirection est gérée par le service
                setTimeout(() => {
                    this.router.navigate([this.returnUrl]);
                }, 1000);
            },
            error: (error: ErrorResponse) => {
                // ✅ Affiche le vrai message du backend
                this.errorMessage.set(error.message);


                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur de connexion',
                    detail: error.message,
                    life: 5000
                });
            }
        });
    }

    private markFormGroupTouched(): void {
        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.get(key);
            control?.markAsTouched();
        });
    }

    // Méthodes utilitaires pour les validations dans le template
    isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.form.get(fieldName);
        if (field && field.errors && (field.dirty || field.touched)) {
            if (field.errors['required']) {
                return 'Ce champ est requis';
            }
            if (field.errors['username']) {
                return 'Veuillez saisir un username valide';
            }
            if (field.errors['minlength']) {
                return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
            }
        }
        return '';
    }
}
