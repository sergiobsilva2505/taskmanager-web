import { inject, Injectable } from '@angular/core';
import { Dashboard } from '@domain/task/dashboard.entity';
import { TaskRepositoryPort } from '../ports/task-repository.port';

@Injectable({ providedIn: 'root' })
export class GetDashboardUseCase {
  private readonly repository = inject(TaskRepositoryPort);

  execute(): Promise<Dashboard> {
    return this.repository.getDashboard();
  }
}
