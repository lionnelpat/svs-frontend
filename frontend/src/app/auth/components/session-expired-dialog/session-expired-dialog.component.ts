import {Component, OnInit} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {Button, ButtonDirective} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {PaginatorModule} from "primeng/paginator";
import {ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../login/services/auth.service";
import {Ripple} from "primeng/ripple";

@Component({
  selector: 'app-session-expired-dialog',
  standalone: true,
    imports: [
        DialogModule,
        Button,
        InputTextModule,
        PaginatorModule,
        ReactiveFormsModule,
        ButtonDirective,
        Ripple
    ],
  templateUrl: './session-expired-dialog.component.html',
  styleUrl: './session-expired-dialog.component.scss'
})
export class SessionExpiredDialogComponent implements OnInit {
  visible: boolean = false;

  constructor(private readonly authService: AuthService, private readonly router: Router) {}



  ngOnInit() {
    this.authService.sessionExpired$.subscribe((expired) => {
      if (expired) {
        this.visible = true;
      }
    });
  }

  redirectToSignIn() {
    this.visible = false;
    this.authService.logout();
  }
}
