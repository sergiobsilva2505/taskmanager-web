import { inject, Injectable } from '@angular/core';
import { TaskRepositoryPort } from '../ports/task-repository.port';

@Injectable({ providedIn: 'root' })
export class DeleteTaskUseCase {
  private readonly repository = inject(TaskRepositoryPort);

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
