import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { Avatar } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, ButtonDirective, Menu, Avatar],
    template: `
    <div class="user-profile">
      <button
        pButton
        type="button"
        class="p-button-text p-button-plain user-profile-button"
        (click)="userMenu.toggle($event)"
      >
        <p-avatar
          [label]="getUserInitials()"
          styleClass="mr-2"
          shape="circle"
          size="normal"
        ></p-avatar>
        <div class="user-info">
          <span class="user-name">{{ authService.userFullName() }}</span>
          <small class="user-email">{{ authService.currentUser()?.email }}</small>
        </div>
        <i class="pi pi-chevron-down ml-2"></i>
      </button>

      <p-menu
        #userMenu
        [model]="menuItems"
        [popup]="true"
        styleClass="user-menu"
      ></p-menu>
    </div>
  `,
    styles: [`
    .user-profile {
      .user-profile-button {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border-radius: 2rem;

        &:hover {
          background-color: var(--surface-100);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-left: 0.5rem;

          .user-name {
            font-weight: 600;
            color: #FFFFFFDD;
            font-size: 0.9rem;
          }

          .user-email {
            color: #FFFFFFDD;
            font-size: 0.75rem;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .user-info {
        display: none !important;
      }
    }
  `]
})
export class UserProfileComponent {
    public readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    menuItems: MenuItem[] = [
        {
            label: 'Mon Profil',
            icon: 'pi pi-user',
            command: () => this.navigateToProfile()
        },
        {
            label: 'Paramètres',
            icon: 'pi pi-cog',
            command: () => this.navigateToSettings()
        },
        {
            separator: true
        },
        {
            label: 'Se déconnecter',
            icon: 'pi pi-sign-out',
            command: () => this.logout()
        }
    ];

    getUserInitials(): string {
        const user = this.authService.currentUser();
        if (!user) return 'U';

        const firstName = user.firstName?.charAt(0) || '';
        const lastName = user.lastName?.charAt(0) || '';

        return (firstName + lastName).toUpperCase() || user.email.charAt(0).toUpperCase();
    }

    private navigateToProfile(): void {
        this.router.navigate(['/profile']);
    }

    private navigateToSettings(): void {
        this.router.navigate(['/settings']);
    }

    private logout(): void {
        this.authService.logout().subscribe({
            next: () => {
                // La redirection est gérée par le service
            },
            error: (error) => {
                console.error('Erreur lors de la déconnexion:', error);
                // Même en cas d'erreur, rediriger vers login
                this.router.navigate(['/auth/login']);
            }
        });
    }
}
