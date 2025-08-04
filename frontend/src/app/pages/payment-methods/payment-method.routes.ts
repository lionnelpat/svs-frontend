// payment-method.routes.ts

import { Routes } from '@angular/router';
import {PaymentMethodsComponent} from "./payment-methods.component";

export default [
    {
        path: 'list',
        component: PaymentMethodsComponent
    }
] as Routes;
