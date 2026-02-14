import { Routes } from '@angular/router';
import { RoomSelection } from './room-selection/room-selection';
import { UsersForm } from './users-form/users-form';
import { PrimaryUser } from './primary-user/primary-user';
import { PaymentSuccess } from './payment-success/payment-success';
import { RetryPayment } from './retry-payment/retry-payment';
import { Notfound } from './notfound/notfound';
import { MainLayout } from './layouts/main-layout/main-layout';
import { BlankLayout } from './layouts/blank-layout/blank-layout';
import { ProcessValidation } from './process-validation/process-validation';

export const routes: Routes = [


  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'primary-pax', component: PrimaryUser },
      { path: 'members-selection', component: RoomSelection },
      { path: 'register', component: UsersForm },
      { path: 'payment-success/:id', component: PaymentSuccess },
      { path: 'process-validation/:id', component: ProcessValidation },
      { path: 'retry-payment', component: RetryPayment },
      { path: '', redirectTo: 'primary-pax', pathMatch: 'full' },
    ]
  },
  {
    path: '',
    component: BlankLayout,
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./admin/admin-module').then(m => m.AdminModule)
      },
      { path: '**', component: Notfound }
    ]
  }


];

