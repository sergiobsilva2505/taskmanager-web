import { inject, Injectable } from '@angular/core';
import { CreateTaskInput, CreateTaskParams, TaskRepositoryPort } from '../ports/task-repository.port';
import { Task } from '@domain/task/task.entity';

@Injectable({ providedIn: 'root' })
export class CreateTaskUseCase {
  private readonly repository = inject(TaskRepositoryPort);

  async execute(params: CreateTaskParams): Promise<Task> {
    const input = new CreateTaskInput(params);
    return this.repository.create(input);
  }
}
