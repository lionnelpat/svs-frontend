// core/services/error-handler.service.ts
import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { MessageService } from 'primeng/api';
import { ErrorResponse } from '../../auth/interfaces/auth.interface';

export interface AppError {
    message: string;
    code?: string;
    details?: any;
}

@Injectable({
    providedIn: 'root',
})
export class ErrorHandlerService {
    constructor(
        private readonly logger: LoggerService,
        private readonly messageService: MessageService
    ) {}

    handleError(error: any): void {
        console.error('Erreur capturée:', error);

        // Si c'est une ErrorResponse de notre API
        if (error.error && this.isApiErrorResponse(error.error)) {
            this.handleApiError(error.error);
        } else if (error.status) {
            // Erreur HTTP standard
            this.handleHttpError(error);
        } else {
            // Erreur générique
            this.showGenericError();
        }
    }

    handleErrorWithContext(error: any, context?: string): void {
        const errorMessage = this.extractErrorMessage(error);
        const fullContext = context ? `${context} - ${errorMessage}` : errorMessage;

        this.logger.error(fullContext, error);

        // Affichage d'un message utilisateur convivial
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: this.getUserFriendlyMessage(error),
            life: 5000
        });
    }

    private isApiErrorResponse(errorBody: any): errorBody is ErrorResponse {
        return errorBody &&
            typeof errorBody.code === 'string' &&
            typeof errorBody.message === 'string' &&
            typeof errorBody.success === 'boolean' &&
            errorBody.suggestions;
    }

    private handleApiError(errorResponse: ErrorResponse): void {
        const severity = this.getSeverityFromCode(errorResponse.code);

        this.messageService.add({
            severity: severity,
            summary: this.getSummaryFromCode(errorResponse.code),
            detail: errorResponse.message,
            life: this.getLifeFromSeverity(severity)
        });

        // Actions spécifiques selon le code d'erreur
        this.handleSpecificErrorActions(errorResponse);
    }

    private handleHttpError(error: any): void {
        let message = 'Une erreur est survenue';

        switch (error.status) {
            case 401:
                message = 'Vous n\'êtes pas autorisé à accéder à cette ressource';
                break;
            case 403:
                message = 'Accès interdit';
                break;
            case 404:
                message = 'Ressource non trouvée';
                break;
            case 500:
                message = 'Erreur serveur interne';
                break;
            case 0:
                message = 'Impossible de contacter le serveur';
                break;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: message,
            life: 5000
        });
    }

    private showGenericError(): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur inattendue est survenue',
            life: 5000
        });
    }

    private getSeverityFromCode(code: string): string {
        const warnCodes = ['INVALID_CREDENTIALS', 'ACCOUNT_DISABLED', 'ACCOUNT_LOCKED'];
        const infoCodes = ['CREDENTIALS_EXPIRED', 'ACCOUNT_EXPIRED'];

        if (warnCodes.includes(code)) {
            return 'warn';
        } else if (infoCodes.includes(code)) {
            return 'info';
        } else {
            return 'error';
        }
    }

    private getSummaryFromCode(code: string): string {
        const summaries: { [key: string]: string } = {
            'INVALID_CREDENTIALS': 'Identifiants incorrects',
            'ACCOUNT_DISABLED': 'Compte désactivé',
            'ACCOUNT_LOCKED': 'Compte verrouillé',
            'ACCOUNT_EXPIRED': 'Compte expiré',
            'CREDENTIALS_EXPIRED': 'Mot de passe expiré',
            'VALIDATION_ERROR': 'Erreur de validation',
            'AUTH_ERROR': 'Erreur d\'authentification',
            'INTERNAL_SERVER_ERROR': 'Erreur système'
        };

        return summaries[code] || 'Erreur';
    }

    private getLifeFromSeverity(severity: string): number {
        switch (severity) {
            case 'info':
                return 4000;
            case 'warn':
                return 6000;
            case 'error':
                return 8000;
            default:
                return 5000;
        }
    }

    private handleSpecificErrorActions(errorResponse: ErrorResponse): void {
        switch (errorResponse.code) {
            case 'INVALID_CREDENTIALS':
                // Focus sur le champ mot de passe par exemple
                setTimeout(() => {
                    const passwordField = document.getElementById('password');
                    if (passwordField) {
                        passwordField.focus();
                    }
                }, 100);
                break;

            case 'ACCOUNT_LOCKED':
                // Afficher un dialog avec les suggestions
                this.showSuggestionDialog(errorResponse);
                break;

            case 'CREDENTIALS_EXPIRED':
                // Rediriger vers la page de réinitialisation
                // this.router.navigate(['/auth/reset-password']);
                break;
        }
    }

    private showSuggestionDialog(errorResponse: ErrorResponse): void {
        // Vous pouvez utiliser PrimeNG Dialog ici
        this.messageService.add({
            severity: 'info',
            summary: 'Suggestion',
            detail: errorResponse?.suggestions?.message,
            life: 10000
        });
    }

    private extractErrorMessage(error: any): string {
        if (typeof error === 'string') return error;
        if (error?.message) return error.message;
        if (error?.error?.message) return error.error.message;
        return 'Erreur inconnue';
    }

    private getUserFriendlyMessage(error: any): string {
        // Conversion des erreurs techniques en messages utilisateur
        const technicalMessage = this.extractErrorMessage(error).toLowerCase();

        if (technicalMessage.includes('network')) {
            return 'Problème de connexion réseau';
        }
        if (technicalMessage.includes('timeout')) {
            return 'La requête a pris trop de temps';
        }
        if (technicalMessage.includes('validation')) {
            return 'Données invalides, veuillez vérifier votre saisie';
        }
        return 'Une erreur inattendue s\'est produite';
    }
}
