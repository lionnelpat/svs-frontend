import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [RouterModule, ButtonModule, NgOptimizedImage],
    styles: `
        .logo {
            width: 100px;
            height: auto;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
    `,
    template: `
        <div class="flex items-center justify-center min-h-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <img ngSrc="assets/images/logo.jpeg" class="logo" alt="logo svs" height="374" width="329">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                        <span class="text-primary font-bold text-3xl">403</span>
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Accès Refusé</h1>
                        <div class="text-surface-600 dark:text-surface-200 mb-8">Vous n'avez pas les autorisations nécessaires pour accéder à cette ressource.</div>
                        <a routerLink="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-lock !text-2xl"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0 block">Demander une autorisation</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Contactez votre administrateur pour obtenir l'accès</span>
                            </span>
                        </a>
                        <a routerLink="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-question-circle !text-2xl"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0">Centre d'aide</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Consultez notre documentation pour plus d'informations</span>
                            </span>
                        </a>
                        <a routerLink="/" class="w-full flex items-center mb-8 py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-home !text-2xl"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0">Retour à l'accueil</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Revenir à la page principale de l'application</span>
                            </span>
                        </a>
                        <p-button label="Retour au tableau de bord" routerLink="/" />
                    </div>
                </div>
            </div>
        </div>`
})
export class UnauthorizedComponent {}
