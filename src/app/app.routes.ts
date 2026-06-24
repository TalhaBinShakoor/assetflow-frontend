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
    path: 'admin/assets',
    loadComponent: () =>
      import('./features/admin/admin-assets/admin-assets').then(
        (component) => component.AdminAssets,
      ),
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
    path: 'assets/new',
    loadComponent: () =>
      import('./features/assets/asset-form/asset-form').then((component) => component.AssetForm),
  },
  {
    path: 'assets/:id/edit',
    loadComponent: () =>
      import('./features/assets/asset-form/asset-form').then((component) => component.AssetForm),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found').then((component) => component.NotFound),
  },
];
