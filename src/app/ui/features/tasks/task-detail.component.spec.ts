import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { Task } from '@domain/task/task.entity';
import { GetTaskByIdUseCase } from '@application/task/use-cases/get-task-by-id.use-case';
import { DeleteTaskUseCase } from '@application/task/use-cases/delete-task.use-case';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { TaskDetailComponent } from './task-detail.component';

function flushMacrotask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const mockTask = new Task({
  id: 'task-1',
  title: 'Revisar PR',
  description: 'Conferir os testes novos',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
});

describe('TaskDetailComponent', () => {
  let getTaskExecute: ReturnType<typeof vi.fn>;
  let deleteTaskExecute: ReturnType<typeof vi.fn>;
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getTaskExecute = vi.fn().mockResolvedValue(mockTask);
    deleteTaskExecute = vi.fn().mockResolvedValue(undefined);
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: GetTaskByIdUseCase, useValue: { execute: getTaskExecute } },
        { provide: DeleteTaskUseCase, useValue: { execute: deleteTaskExecute } },
        { provide: LoggerPort, useValue: { info: vi.fn(), error: vi.fn() } },
      ],
    });
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  async function createComponent(id = 'task-1') {
    const fixture = TestBed.createComponent(TaskDetailComponent);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await flushMacrotask();
    fixture.detectChanges();
    return fixture;
  }

  it('busca a tarefa pelo ID e exibe seus dados', async () => {
    const fixture = await createComponent('task-1');

    expect(getTaskExecute).toHaveBeenCalledWith('task-1');
    expect(fixture.componentInstance.task()).toEqual(mockTask);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Revisar PR');
    expect(fixture.nativeElement.querySelector('.description').textContent).toContain(
      'Conferir os testes novos',
    );
  });

  it('exibe o prazo com marcação de atrasada quando a tarefa está vencida', async () => {
    getTaskExecute.mockResolvedValue(
      new Task({
        id: 'task-2',
        title: 'Tarefa vencida',
        status: 'TODO',
        priority: 'LOW',
        dueDate: '2020-01-01T00:00:00Z',
        createdAt: '2019-12-01T00:00:00Z',
        updatedAt: '2019-12-01T00:00:00Z',
      }),
    );

    const fixture = await createComponent('task-2');
    const dd: HTMLElement = fixture.nativeElement.querySelector('dd.overdue');

    expect(dd).not.toBeNull();
    expect(dd.textContent).toContain('· atrasada');
    expect(fixture.nativeElement.querySelector('.description')).toBeNull();
  });

  it('exibe o prazo sem marcação quando a tarefa não está atrasada', async () => {
    getTaskExecute.mockResolvedValue(
      new Task({
        id: 'task-3',
        title: 'Tarefa futura',
        status: 'TODO',
        priority: 'LOW',
        dueDate: '2099-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }),
    );

    const fixture = await createComponent('task-3');

    expect(fixture.nativeElement.querySelector('dd.overdue')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('· atrasada');
  });

  it('exibe mensagem de erro quando a tarefa não é encontrada', async () => {
    getTaskExecute.mockReset().mockRejectedValue(new Error('not found'));

    const fixture = await createComponent('task-inexistente');

    expect(fixture.componentInstance.error()).toBe('Tarefa não encontrada.');
    expect(fixture.nativeElement.querySelector('.error').textContent).toContain(
      'Tarefa não encontrada.',
    );
  });

  it('pede confirmação e exclui a tarefa ao clicar em Excluir', async () => {
    const fixture = await createComponent('task-1');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.delete-btn').click();
    await flushMacrotask();

    expect(confirmSpy).toHaveBeenCalledWith('Excluir esta tarefa?');
    expect(deleteTaskExecute).toHaveBeenCalledWith('task-1');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('não exclui a tarefa quando a confirmação é cancelada', async () => {
    confirmSpy.mockReturnValue(false);
    const fixture = await createComponent('task-1');

    fixture.nativeElement.querySelector('.delete-btn').click();
    await flushMacrotask();

    expect(deleteTaskExecute).not.toHaveBeenCalled();
  });

  it('mantém o botão de exclusão desabilitado em caso de falha ao excluir', async () => {
    deleteTaskExecute.mockRejectedValue(new Error('falha'));
    const fixture = await createComponent('task-1');

    fixture.nativeElement.querySelector('.delete-btn').click();
    await flushMacrotask();
    fixture.detectChanges();

    expect(fixture.componentInstance.deleting()).toBe(false);
  });
});
