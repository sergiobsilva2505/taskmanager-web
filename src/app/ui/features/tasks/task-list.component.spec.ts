import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Task } from '@domain/task/task.entity';
import { ListTasksUseCase } from '@application/task/use-cases/list-tasks.use-case';
import { ChangeTaskStatusUseCase } from '@application/task/use-cases/change-task-status.use-case';
import { CreateTaskUseCase } from '@application/task/use-cases/create-task.use-case';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { TaskListComponent } from './task-list.component';

function flushMacrotask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function makeTask(id: string, status: Task['status'] = 'TODO'): Task {
  return new Task({
    id,
    title: `Tarefa ${id}`,
    status,
    priority: 'MEDIUM',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  });
}

describe('TaskListComponent', () => {
  let listTasksExecute: ReturnType<typeof vi.fn>;
  let changeStatusExecute: ReturnType<typeof vi.fn>;
  let loggerError: ReturnType<typeof vi.fn>;

  function setup(totalPages: number, content: Task[] = [makeTask('1')]) {
    listTasksExecute = vi.fn().mockResolvedValue({
      content,
      page: 0,
      size: 10,
      totalElements: totalPages * 10,
      totalPages,
    });
    changeStatusExecute = vi.fn();
    loggerError = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ListTasksUseCase, useValue: { execute: listTasksExecute } },
        { provide: ChangeTaskStatusUseCase, useValue: { execute: changeStatusExecute } },
        { provide: CreateTaskUseCase, useValue: { execute: vi.fn() } },
        { provide: LoggerPort, useValue: { info: vi.fn(), error: loggerError } },
      ],
    });
  }

  async function createComponent() {
    const fixture = TestBed.createComponent(TaskListComponent);
    fixture.detectChanges();
    await flushMacrotask();
    fixture.detectChanges();
    return fixture;
  }

  async function clickNav(fixture: ReturnType<typeof TestBed.createComponent>, index: 0 | 1) {
    const buttons = fixture.nativeElement.querySelectorAll('nav button');
    buttons[index].click();
    await flushMacrotask();
    fixture.detectChanges();
  }

  it('não exibe navegação quando há apenas 1 página (limite: totalPages === 1)', async () => {
    setup(1);
    const fixture = await createComponent();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('exibe navegação a partir de 2 páginas (limite: totalPages === 2)', async () => {
    setup(2);
    const fixture = await createComponent();
    expect(fixture.nativeElement.querySelector('nav')).not.toBeNull();
  });

  it('na primeira página, desabilita "Anterior" e habilita "Próxima"', async () => {
    setup(3);
    const fixture = await createComponent();
    const [prevBtn, nextBtn] = fixture.nativeElement.querySelectorAll('nav button');
    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);
  });

  it('ao alcançar a última página, desabilita "Próxima" e habilita "Anterior" (limite superior)', async () => {
    setup(3);
    const fixture = await createComponent();

    await clickNav(fixture, 1); // page 1
    await clickNav(fixture, 1); // page 2 (última de 3)

    const [prevBtn, nextBtn] = fixture.nativeElement.querySelectorAll('nav button');
    expect(nextBtn.disabled).toBe(true);
    expect(prevBtn.disabled).toBe(false);
    expect(listTasksExecute).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });

  it('exibe mensagem de erro quando o carregamento falha', async () => {
    setup(1);
    listTasksExecute.mockReset().mockRejectedValue(new Error('offline'));
    const fixture = await createComponent();
    expect(fixture.componentInstance.error()).toBe(
      'Não foi possível carregar as tarefas. A API está rodando?',
    );
    expect(loggerError).toHaveBeenCalledWith(
      'Falha ao carregar lista de tarefas',
      expect.any(Error),
      { page: 0 },
    );
  });

  it('exibe o estado vazio quando não há tarefas', async () => {
    setup(1, []);
    const fixture = await createComponent();
    expect(fixture.nativeElement.querySelector('li.empty').textContent).toContain(
      'Nenhuma tarefa encontrada.',
    );
  });

  it('avança o status da tarefa ao clicar no anel e atualiza a lista', async () => {
    setup(1, [makeTask('1', 'TODO')]);
    const advanced = makeTask('1', 'IN_PROGRESS');
    changeStatusExecute.mockResolvedValue(advanced);
    const fixture = await createComponent();

    fixture.nativeElement.querySelector('.ring-btn').click();
    await flushMacrotask();
    fixture.detectChanges();

    expect(changeStatusExecute).toHaveBeenCalledWith('1', 'IN_PROGRESS');
    expect(fixture.componentInstance.tasks()[0].status).toBe('IN_PROGRESS');
  });

  it('não avança o status quando a tarefa não pode avançar', async () => {
    setup(1, [makeTask('1', 'DONE')]);
    const fixture = await createComponent();
    const event = new Event('click');
    vi.spyOn(event, 'preventDefault');

    await fixture.componentInstance.advanceStatus(fixture.componentInstance.tasks()[0], event);

    expect(changeStatusExecute).not.toHaveBeenCalled();
  });

  it('recarrega a primeira página quando uma tarefa é criada', async () => {
    setup(3);
    const fixture = await createComponent();
    await clickNav(fixture, 1); // vai para a página 1

    fixture.componentInstance.onCreated();
    await flushMacrotask();

    expect(fixture.componentInstance.page()).toBe(0);
    expect(listTasksExecute).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0 }));
  });
});
