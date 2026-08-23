import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '@domain/task/task.entity';
import { TaskPriority } from '@domain/task/task.value-objects';
import { CreateTaskUseCase } from '@application/task/use-cases/create-task.use-case';
import { LoggerPort } from '@application/shared/ports/logger.port';

@Component({
  selector: 'app-task-form',
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="submit()">
      <input name="title" [(ngModel)]="title" placeholder="Título da tarefa" required />

      <input name="description" [(ngModel)]="description" placeholder="Descrição (opcional)" />

      <select name="priority" [(ngModel)]="priority">
        <option value="LOW">Baixa</option>
        <option value="MEDIUM">Média</option>
        <option value="HIGH">Alta</option>
      </select>

      <input name="dueDate" type="datetime-local" [(ngModel)]="dueDate" />

      <button type="submit" [disabled]="saving() || !title.trim()">
        {{ saving() ? 'Salvando…' : 'Criar tarefa' }}
      </button>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </form>
  `,
  styles: `
    form {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .error {
      color: var(--signal);
      width: 100%;
      margin: 0;
    }
  `,
})
export class TaskFormComponent {
  private readonly createTask = inject(CreateTaskUseCase);
  private readonly logger = inject(LoggerPort);

  title = '';
  description = '';
  priority: TaskPriority = 'MEDIUM';
  dueDate = '';

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly created = output<Task>();

  async submit(): Promise<void> {
    if (!this.title.trim()) return;

    this.saving.set(true);
    this.error.set(null);

    try {
      const task = await this.createTask.execute({
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        priority: this.priority,
        dueDate: this.dueDate ? new Date(this.dueDate).toISOString() : undefined,
      });
      this.created.emit(task);
      this.title = '';
      this.description = '';
      this.priority = 'MEDIUM';
      this.dueDate = '';
    } catch (err) {
      this.logger.error('Falha ao criar tarefa', err, { title: this.title });
      this.error.set('Não foi possível criar a tarefa.');
    } finally {
      this.saving.set(false);
    }
  }
}
