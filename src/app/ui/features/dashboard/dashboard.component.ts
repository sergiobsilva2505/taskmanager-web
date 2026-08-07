import { Component, inject, signal } from '@angular/core';
import { Dashboard } from '@domain/task/dashboard.entity';
import { GetDashboardUseCase } from '@application/task/use-cases/get-dashboard.use-case';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="container">
      <h1>Painel</h1>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      @if (data(); as d) {
        <div class="summary">
          <div class="card total">
            <span class="card-label">Total de tarefas</span>
            <span class="card-value">{{ d.totalTasks }}</span>
          </div>

          <div class="card overdue">
            <span class="card-label">Atrasadas</span>
            <span class="card-value signal">{{ d.overdueCount }}</span>
          </div>

          <div class="card due-soon">
            <span class="card-label">Vencem em breve</span>
            <span class="card-value">{{ d.dueSoonCount }}</span>
          </div>
        </div>

        <section>
          <h2>Por status</h2>
          <div class="group">
            @for (entry of statusEntries(d); track entry.key) {
              <div class="row">
                <span class="row-label">{{ labelFor(entry.key) }}</span>
                <div class="bar-wrap">
                  <div
                    class="bar"
                    [style.width.%]="percent(entry.value, d.totalTasks)"
                    [class.bar-accent]="entry.key === 'DONE'"
                    [class.bar-signal]="entry.key === 'IN_PROGRESS'"
                  ></div>
                </div>
                <span class="row-count">{{ entry.value }}</span>
              </div>
            }
          </div>
        </section>

        <section>
          <h2>Por prioridade</h2>
          <div class="group">
            @for (entry of priorityEntries(d); track entry.key) {
              <div class="row">
                <span class="row-label">{{ labelFor(entry.key) }}</span>
                <div class="bar-wrap">
                  <div
                    class="bar bar-accent"
                    [style.width.%]="percent(entry.value, d.totalTasks)"
                  ></div>
                </div>
                <span class="row-count">{{ entry.value }}</span>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    .container {
      max-width: 640px;
      padding: 32px 24px;
    }

    h1 {
      margin: 0 0 24px;
      font-size: 22px;
      font-weight: 500;
    }

    h2 {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-2);
      margin: 0 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }

    .card {
      background: var(--card);
      border: 0.5px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-label {
      font-size: 12px;
      color: var(--text-2);
    }

    .card-value {
      font-family: var(--font-mono);
      font-size: 28px;
      font-weight: 500;
      color: var(--text);
    }

    .card-value.signal {
      color: var(--signal);
    }

    section {
      margin-bottom: 28px;
    }

    .group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .row-label {
      font-size: 13px;
      color: var(--text);
      width: 110px;
      flex-shrink: 0;
    }

    .bar-wrap {
      flex: 1;
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      border-radius: 3px;
      background: var(--text-2);
      transition: width 0.3s ease;
    }

    .bar-accent {
      background: var(--accent);
    }

    .bar-signal {
      background: var(--signal);
    }

    .row-count {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--text-2);
      width: 24px;
      text-align: right;
    }

    .error {
      color: var(--signal);
      font-size: 13px;
    }
  `,
})
export class DashboardComponent {
  private readonly getDashboard = inject(GetDashboardUseCase);

  readonly data = signal<Dashboard | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    this.getDashboard
      .execute()
      .then((d) => this.data.set(d))
      .catch(() => this.error.set('Não foi possível carregar o painel. A API está rodando?'));
  }

  statusEntries(d: Dashboard): { key: string; value: number }[] {
    const order = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
    return order
      .filter((k) => k in d.countByStatus)
      .map((k) => ({ key: k, value: d.countByStatus[k] }));
  }

  priorityEntries(d: Dashboard): { key: string; value: number }[] {
    const order = ['HIGH', 'MEDIUM', 'LOW'];
    return order
      .filter((k) => k in d.countByPriority)
      .map((k) => ({ key: k, value: d.countByPriority[k] }));
  }

  percent(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  labelFor(key: string): string {
    const labels: Record<string, string> = {
      TODO: 'A fazer',
      IN_PROGRESS: 'Em andamento',
      DONE: 'Concluídas',
      CANCELLED: 'Canceladas',
      HIGH: 'Alta',
      MEDIUM: 'Média',
      LOW: 'Baixa',
    };
    return labels[key] ?? key;
  }
}
