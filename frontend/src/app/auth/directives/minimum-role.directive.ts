import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
    inject,
    OnInit
} from '@angular/core';
import { UserRoleService } from '../services/user-role.service';
import { UserRole } from '../enums/roles.enum';

@Directive({
    selector: '[minimumRole]',
    standalone: true
})
export class MinimumRoleDirective implements OnInit {
    private readonly templateRef = inject(TemplateRef<any>);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly roleService = inject(UserRoleService);

    // private minimumRole!: UserRole;
    private currentlyVisible: boolean = false;

    @Input() set minimumRole(role: UserRole) {
        this.minimumRole = role;
        this.updateView();
    }

    ngOnInit() {
        this.updateView();
    }

    private updateView(): void {
        const hasAccess = this.roleService.hasMinimumRole(this.minimumRole);

        if (hasAccess && !this.currentlyVisible) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.currentlyVisible = true;
        } else if (!hasAccess && this.currentlyVisible) {
            this.viewContainer.clear();
            this.currentlyVisible = false;
        }
    }
}
