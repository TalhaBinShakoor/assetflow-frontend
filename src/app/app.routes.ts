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
      import('./features/dashboard/dashboard').then(
        (component) => component.Dashboard,
      ),
  },
  {
  path: '**',
  loadComponent: () =>
    import('./features/not-found/not-found').then(
      (component) => component.NotFound,
    ),
},
];