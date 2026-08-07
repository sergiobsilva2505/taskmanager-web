import { Routes } from '@angular/router';
import { authGuard } from '@infrastructure/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@ui/layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@ui/features/tasks/task-list.component').then((m) => m.TaskListComponent),
      },
      {
        path: 'tasks/:id',
        loadComponent: () =>
          import('@ui/features/tasks/task-detail.component').then((m) => m.TaskDetailComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@ui/features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@ui/features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@ui/features/auth/register.component').then((m) => m.RegisterComponent),
  },
];
