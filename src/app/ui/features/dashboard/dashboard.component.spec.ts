import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Dashboard } from '@domain/task/dashboard.entity';
import { GetDashboardUseCase } from '@application/task/use-cases/get-dashboard.use-case';
import { DashboardComponent } from './dashboard.component';

function flushMacrotask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const mockDashboard: Dashboard = {
  totalTasks: 10,
  countByStatus: {
    TODO: 4,
    IN_PROGRESS: 2,
    DONE: 3,
    CANCELLED: 1,
  },
  countByPriority: {
    HIGH: 3,
    MEDIUM: 5,
    LOW: 2,
  },
  overdueCount: 2,
  dueSoonCount: 1,
};

describe('DashboardComponent', () => {
  let getDashboardExecute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getDashboardExecute = vi.fn().mockResolvedValue(mockDashboard);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: GetDashboardUseCase, useValue: { execute: getDashboardExecute } },
      ],
    });
  });

  async function createComponent() {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await flushMacrotask();
    fixture.detectChanges();
    return fixture;
  }

  it('carrega os dados do painel ao iniciar', async () => {
    const fixture = await createComponent();

    expect(getDashboardExecute).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.data()).toEqual(mockDashboard);
    expect(fixture.componentInstance.error()).toBeNull();
  });

  it('exibe os totais no resumo', async () => {
    const fixture = await createComponent();

    const values: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.card-value');
    expect(values[0].textContent).toContain('10');
    expect(values[1].textContent).toContain('2');
    expect(values[2].textContent).toContain('1');
  });

  it('exibe mensagem de erro quando o carregamento falha', async () => {
    getDashboardExecute.mockReset().mockRejectedValue(new Error('offline'));

    const fixture = await createComponent();

    expect(fixture.componentInstance.error()).toBe(
      'Não foi possível carregar o painel. A API está rodando?',
    );
    expect(fixture.nativeElement.querySelector('.error').textContent).toContain(
      'Não foi possível carregar o painel.',
    );
    expect(fixture.componentInstance.data()).toBeNull();
  });

  it('ordena as entradas de status na ordem TODO, IN_PROGRESS, DONE, CANCELLED', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const entries = fixture.componentInstance.statusEntries(mockDashboard);

    expect(entries.map((e) => e.key)).toEqual(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']);
    expect(entries.map((e) => e.value)).toEqual([4, 2, 3, 1]);
  });

  it('ordena as entradas de prioridade na ordem HIGH, MEDIUM, LOW', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const entries = fixture.componentInstance.priorityEntries(mockDashboard);

    expect(entries.map((e) => e.key)).toEqual(['HIGH', 'MEDIUM', 'LOW']);
    expect(entries.map((e) => e.value)).toEqual([3, 5, 2]);
  });

  it('omite chaves de status ou prioridade ausentes no dashboard', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const partial: Dashboard = {
      totalTasks: 3,
      countByStatus: { TODO: 3 },
      countByPriority: { LOW: 3 },
      overdueCount: 0,
      dueSoonCount: 0,
    };

    expect(fixture.componentInstance.statusEntries(partial)).toEqual([{ key: 'TODO', value: 3 }]);
    expect(fixture.componentInstance.priorityEntries(partial)).toEqual([
      { key: 'LOW', value: 3 },
    ]);
  });

  it('calcula a porcentagem em relação ao total, arredondando o valor', () => {
    const fixture = TestBed.createComponent(DashboardComponent);

    expect(fixture.componentInstance.percent(1, 3)).toBe(33);
    expect(fixture.componentInstance.percent(2, 3)).toBe(67);
    expect(fixture.componentInstance.percent(5, 0)).toBe(0);
  });

  it('traduz as chaves de status e prioridade para rótulos em português', () => {
    const fixture = TestBed.createComponent(DashboardComponent);

    expect(fixture.componentInstance.labelFor('TODO')).toBe('A fazer');
    expect(fixture.componentInstance.labelFor('IN_PROGRESS')).toBe('Em andamento');
    expect(fixture.componentInstance.labelFor('DONE')).toBe('Concluídas');
    expect(fixture.componentInstance.labelFor('CANCELLED')).toBe('Canceladas');
    expect(fixture.componentInstance.labelFor('HIGH')).toBe('Alta');
    expect(fixture.componentInstance.labelFor('MEDIUM')).toBe('Média');
    expect(fixture.componentInstance.labelFor('LOW')).toBe('Baixa');
  });

  it('usa a própria chave como rótulo quando não há tradução', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance.labelFor('UNKNOWN')).toBe('UNKNOWN');
  });
});
