import { Component, inject, input, signal, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task } from '@domain/task/task.entity';
import { isOverdue } from '@domain/task/task.entity';
import { GetTaskByIdUseCase } from '@application/task/use-cases/get-task-by-id.use-case';
import { StatusRingComponent } from '@ui/shared/status-ring.component';

@Component({
  selector: 'app-task-detail',
  imports: [DatePipe, RouterLink, StatusRingComponent],
  template: `
    <div class="container">
      <a routerLink="/">← Voltar</a>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (task(); as t) {
        <header>
          <app-status-ring [status]="t.status" />
          <h1>{{ t.title }}</h1>
        </header>

        @if (t.description) {
          <p class="description">{{ t.description }}</p>
        }

        <dl>
          <dt>Prioridade</dt>
          <dd>{{ t.priority }}</dd>

          @if (t.dueDate) {
            <dt>Prazo</dt>
            <dd [class.overdue]="overdue(t)">
              {{ t.dueDate | date: 'dd/MM/yyyy HH:mm' }}
              @if (overdue(t)) {
                <span> · atrasada</span>
              }
            </dd>
          }

          <dt>Criada em</dt>
          <dd>{{ t.createdAt | date: 'dd/MM/yyyy HH:mm' }}</dd>

          <dt>Atualizada em</dt>
          <dd>{{ t.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</dd>
        </dl>
      } @else {
        <p class="loading">Carregando…</p>
      }
    </div>
  `,
  styles: `
    .container {
      max-width: 640px;
      padding: 32px 24px;
    }

    a {
      color: var(--text-2);
      text-decoration: none;
      font-size: 13px;
    }

    a:hover {
      color: var(--accent);
    }

    header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
    }

    .description {
      color: var(--text-2);
      margin-top: 8px;
    }

    dl {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 8px 24px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 0.5px solid var(--border);
    }

    dt {
      color: var(--text-2);
      font-size: 13px;
    }

    dd {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 12px;
    }

    dd.overdue {
      color: var(--signal);
    }

    .error {
      color: var(--signal);
      margin-top: 16px;
    }

    .loading {
      color: var(--text-2);
      margin-top: 16px;
    }
  `,
})
export class TaskDetailComponent {
  private readonly getTask = inject(GetTaskByIdUseCase);

  readonly id = input.required<string>();

  readonly task = signal<Task | null>(null);
  readonly error = signal<string | null>(null);

  protected readonly overdue = isOverdue;

  constructor() {
    effect(() => {
      const taskId = this.id();
      this.task.set(null);
      this.error.set(null);
      this.getTask
        .execute(taskId)
        .then((task) => this.task.set(task))
        .catch(() => this.error.set('Tarefa não encontrada.'));
    });
  }
}
