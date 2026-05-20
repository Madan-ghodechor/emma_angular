import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Content } from './layouts/content/content';
import { AppBootstrap } from './app-bootstrap/app-bootstrap';
import { Blank } from './layouts/blank/blank';
import { NotFound } from './pages/not-found/not-found';

const routes: Routes = [
  {
    path: '',
    component: Blank,
    children: [
      { path: '', component: AppBootstrap },
      // { path: '', redirectTo: 'primary-pax', pathMatch: 'full' },
    ]
  },
  {
    path: '',
    component: Content,
    children: [
      // { path: '', component: AppBootstrap },
      // { path: '', redirectTo: 'primary-pax', pathMatch: 'full' },
    ]
  },
  {
    path: 'admin',
    component: Blank,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./admin/admin-module').then(m => m.AdminModule)
      },
    ]
  },
  { path: '**', component: NotFound }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewFlowRoutingModule { }
