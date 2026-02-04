import { Routes } from '@angular/router';
import { RoomSelection } from './room-selection/room-selection';
import { UsersForm } from './users-form/users-form';
import { PrimaryUser } from './primary-user/primary-user';

export const routes: Routes = [
  { path: '', redirectTo: 'primary-pax', pathMatch: 'full' },
  { path: 'primary-pax', component: PrimaryUser },
  // { path: '', redirectTo: 'members-selection', pathMatch: 'full' },
  { path: 'members-selection', component: RoomSelection },
  { path: 'register', component: UsersForm },
  // { path: 'register', component: NewReg },
//   { path: '', component: Registration },
];
