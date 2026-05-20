import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Content } from './layouts/content/content';
import { AddDynamics } from './components/add-dynamics/add-dynamics';

const routes: Routes = [
  {
    path: '',
    component: Content,
    children: [
      { path: 'add-event', component: AddDynamics },
      { path: '', redirectTo: 'add-event', pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
