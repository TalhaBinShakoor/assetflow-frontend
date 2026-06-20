import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((component) => component.Dashboard),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((component) => component.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((component) => component.Register),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found').then((component) => component.NotFound),
  },
];
