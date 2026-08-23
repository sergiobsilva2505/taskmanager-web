import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Task } from '@domain/task/task.entity';
import { ListTasksUseCase } from '@application/task/use-cases/list-tasks.use-case';
import { ChangeTaskStatusUseCase } from '@application/task/use-cases/change-task-status.use-case';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { StatusRingComponent } from '@ui/shared/status-ring.component';
import { TaskFormComponent } from './task-form.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-task-list',
  imports: [TaskFormComponent, StatusRingComponent, RouterLink],
  template: `
    <div class="container">
      <h1>Tarefas</h1>

      <app-task-form (created)="onCreated()" />

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <ul>
        @for (task of tasks(); track task.id) {
          <li>
            <button
              class="ring-btn"
              (click)="advanceStatus(task, $event)"
              [disabled]="!task.canAdvance()"
              [attr.aria-label]="'Avançar status de ' + task.title"
            >
              <app-status-ring [status]="task.status" />
            </button>
            <a class="title" [routerLink]="['/tasks', task.id]">{{ task.title }}</a>
            <span class="priority">{{ task.priority }}</span>
          </li>
        } @empty {
          <li class="empty">Nenhuma tarefa encontrada.</li>
        }
      </ul>

      @if (totalPages() > 1) {
        <nav>
          <button (click)="goTo(page() - 1)" [disabled]="page() === 0">← Anterior</button>
          <span>Página {{ page() + 1 }} de {{ totalPages() }}</span>
          <button (click)="goTo(page() + 1)" [disabled]="page() >= totalPages() - 1">
            Próxima →
          </button>
        </nav>
      }
    </div>
  `,
  styles: `
    .container {
      max-width: 640px;
      padding: 32px 24px;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 0.5px solid var(--border);
    }

    li.empty {
      color: var(--text-2);
    }

    .ring-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
    }

    .ring-btn:disabled {
      cursor: default;
      opacity: 1;
    }

    .title {
      font-weight: 500;
      flex: 1;
      color: var(--text);
      text-decoration: none;
    }

    .title:hover {
      color: var(--accent);
    }

    .priority {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-2);
    }

    .error {
      color: var(--signal);
    }

    nav {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    nav span {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-2);
    }
  `,
})
export class TaskListComponent {
  private readonly listTasks = inject(ListTasksUseCase);
  private readonly changeStatus = inject(ChangeTaskStatusUseCase);
  private readonly logger = inject(LoggerPort);

  readonly tasks = signal<Task[]>([]);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  goTo(page: number): void {
    this.page.set(page);
    this.load();
  }

  onCreated(): void {
    this.page.set(0);
    this.load();
  }

  async advanceStatus(task: Task, event: Event): Promise<void> {
    event.preventDefault();
    if (!task.canAdvance()) return;
    const updated = await this.changeStatus.execute(task.id, task.nextStatus());
    this.tasks.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
  }

  private load(): void {
    this.error.set(null);
    this.listTasks
      .execute({
        page: this.page(),
        size: PAGE_SIZE,
        sortField: 'CREATED_AT',
        sortDirection: 'DESC',
      })
      .then((result) => {
        this.tasks.set(result.content);
        this.totalPages.set(result.totalPages);
      })
      .catch((err) => {
        this.logger.error('Falha ao carregar lista de tarefas', err, { page: this.page() });
        this.error.set('Não foi possível carregar as tarefas. A API está rodando?');
      });
  }
}
