import { inject, Injectable } from '@angular/core';
import { Task } from '@domain/task/task.entity';
import { TaskStatus } from '@domain/task/task.value-objects';
import { TaskRepositoryPort } from '../ports/task-repository.port';

@Injectable({ providedIn: 'root' })
export class ChangeTaskStatusUseCase {
  private readonly repository = inject(TaskRepositoryPort);

  execute(id: string, status: TaskStatus): Promise<Task> {
    return this.repository.changeStatus(id, status);
  }
}
