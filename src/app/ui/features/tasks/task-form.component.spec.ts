import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Task } from '@domain/task/task.entity';
import { CreateTaskUseCase } from '@application/task/use-cases/create-task.use-case';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { TaskFormComponent } from './task-form.component';

function flushMacrotask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function setValue(input: HTMLInputElement | HTMLSelectElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('change'));
}

const createdTask = new Task({
  id: 'new-1',
  title: 'Nova tarefa',
  status: 'TODO',
  priority: 'HIGH',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

describe('TaskFormComponent', () => {
  let createExecute: ReturnType<typeof vi.fn>;
  let loggerError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createExecute = vi.fn().mockResolvedValue(createdTask);
    loggerError = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: CreateTaskUseCase, useValue: { execute: createExecute } },
        { provide: LoggerPort, useValue: { info: vi.fn(), error: loggerError } },
      ],
    });
  });

  async function createComponent() {
    const fixture = TestBed.createComponent(TaskFormComponent);
    fixture.detectChanges();
    await flushMacrotask();
    fixture.detectChanges();
    return fixture;
  }

  it('cria a tarefa a partir do formulário preenchido, emite o evento e limpa os campos', async () => {
    const fixture = await createComponent();
    const el: HTMLElement = fixture.nativeElement;
    const emitted: Task[] = [];
    fixture.componentInstance.created.subscribe((t) => emitted.push(t));

    setValue(el.querySelector('input[name=title]')!, '  Nova tarefa  ');
    setValue(el.querySelector('input[name=description]')!, 'Detalhes');
    setValue(el.querySelector('select[name=priority]')!, 'HIGH');
    setValue(el.querySelector('input[name=dueDate]')!, '2026-10-01T10:00');
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await flushMacrotask();
    fixture.detectChanges();

    expect(createExecute).toHaveBeenCalledWith({
      title: 'Nova tarefa',
      description: 'Detalhes',
      priority: 'HIGH',
      dueDate: new Date('2026-10-01T10:00').toISOString(),
    });
    expect(emitted).toEqual([createdTask]);

    const component = fixture.componentInstance;
    expect(component.title).toBe('');
    expect(component.description).toBe('');
    expect(component.priority).toBe('MEDIUM');
    expect(component.dueDate).toBe('');
    expect(component.saving()).toBe(false);
  });

  it('envia descrição e prazo indefinidos quando os campos opcionais estão vazios', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.title = 'Só o título';

    await fixture.componentInstance.submit();

    expect(createExecute).toHaveBeenCalledWith({
      title: 'Só o título',
      description: undefined,
      priority: 'MEDIUM',
      dueDate: undefined,
    });
  });

  it('não chama o caso de uso quando o título está em branco', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.title = '   ';

    await fixture.componentInstance.submit();

    expect(createExecute).not.toHaveBeenCalled();
  });

  it('exibe mensagem de erro e registra no logger quando a criação falha', async () => {
    const boom = new Error('offline');
    createExecute.mockRejectedValue(boom);
    const fixture = await createComponent();
    fixture.componentInstance.title = 'Falha';

    await fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe('Não foi possível criar a tarefa.');
    expect(fixture.componentInstance.saving()).toBe(false);
    expect(loggerError).toHaveBeenCalledWith('Falha ao criar tarefa', boom, { title: 'Falha' });
    expect(fixture.nativeElement.querySelector('.error').textContent).toContain(
      'Não foi possível criar a tarefa.',
    );
  });
});
