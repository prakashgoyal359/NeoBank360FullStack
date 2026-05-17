import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'open-account',
    loadComponent: () =>
      import('./pages/open-account/open-account.component').then((m) => m.OpenAccountComponent),
  },
  {
    path: 'user',
    loadComponent: () => import('./pages/user/user.component').then((m) => m.UserComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [AdminGuard],
  },
  { path: '**', redirectTo: '/login' },
];
