import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { SVSTheme } from './app/themes/svs-theme';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthInterceptor } from './app/auth/components/login/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        // Router avec configuration de scroll
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation()
        ),

        // ✅ HTTP Client avec support des intercepteurs DI (IMPORTANT!)
        provideHttpClient(withInterceptorsFromDi()),

        // ✅ Intercepteur d'authentification
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },

        // Animations asynchrones
        provideAnimationsAsync(),

        // PrimeNG avec votre thème personnalisé
        providePrimeNG({
            theme: {
                preset: SVSTheme,
                options: {
                    prefix: 'p',
                    darkModeSelector: false,
                    cssLayer: false
                }
            }
        }),

        // Services PrimeNG
        MessageService,
        ConfirmationService
    ]
};
