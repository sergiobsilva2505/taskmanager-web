import { inject, Injectable } from '@angular/core';
import { TaskRepositoryPort } from '../ports/task-repository.port';
import { Task } from '@domain/task/task.entity';

@Injectable({ providedIn: 'root' })
export class GetTaskByIdUseCase {
  private readonly repository = inject(TaskRepositoryPort);

  execute(id: string): Promise<Task> {
    return this.repository.getById(id);
  }
}
