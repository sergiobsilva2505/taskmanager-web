import { inject, Injectable } from '@angular/core';
import { CreateTaskInput, TaskRepositoryPort } from '../ports/task-repository.port';
import { Task } from '@domain/task/task.entity';

@Injectable({ providedIn: 'root' })
export class CreateTaskUseCase {
  private readonly repository = inject(TaskRepositoryPort);

  execute(input: CreateTaskInput): Promise<Task> {
    return this.repository.create(input);
  }
}
