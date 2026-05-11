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
// import { UpgradeTokenView } from './upgrade-token-view/upgrade-token-view';
// import { Block } from './block/block';
import { EmmaRegistration } from './emma-registration/emma-registration';
import { Eemaregcomplete } from './eemaregcomplete/eemaregcomplete';

export const routes: Routes = [


  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'primary-pax', component: PrimaryUser },
      { path: 'eema-registration', component: EmmaRegistration },
      // { path: 'registration', component: Block },
      { path: 'members-selection', component: RoomSelection },
      { path: 'register', component: UsersForm },
      { path: 'payment-success/:id', component: PaymentSuccess },
      { path: 'process-validation/:id', component: ProcessValidation },
      { path: 'retry-payment', component: RetryPayment },
      { path: 'emma-reg-success', component: Eemaregcomplete },
      // { path: 'upgrade/:token', component: UpgradeTokenView },
      // { path: '', redirectTo: 'registration', pathMatch: 'full' },
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

