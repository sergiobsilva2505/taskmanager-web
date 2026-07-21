import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@ui/layout/shell.component').then((m) => m.ShellComponent),
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
    ],
  },
];
