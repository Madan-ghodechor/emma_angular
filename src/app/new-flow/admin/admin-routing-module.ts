import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Content } from './layouts/content/content';
import { AddDynamics } from './components/add-dynamics/add-dynamics';
import { EventsList } from './components/events-list/events-list';

const routes: Routes = [
  {
    path: '',
    component: Content,
    children: [
      { path: 'event-list', component: EventsList },
      { path: 'add-event', component: AddDynamics },
      { path: '', redirectTo: 'event-list', pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
