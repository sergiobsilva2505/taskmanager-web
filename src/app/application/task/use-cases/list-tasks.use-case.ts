import { inject, Injectable } from '@angular/core';
import { PagedResult, ListTasksQuery, TaskRepositoryPort } from '../ports/task-repository.port';
import { Task } from '@domain/task/task.entity';

@Injectable({ providedIn: 'root' })
export class ListTasksUseCase {
  private readonly repository = inject(TaskRepositoryPort);

  execute(query: ListTasksQuery = {}): Promise<PagedResult<Task>> {
    return this.repository.list(query);
  }
}
