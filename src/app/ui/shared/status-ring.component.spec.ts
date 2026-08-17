import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TaskStatus } from '@domain/task/task.value-objects';
import { StatusRingComponent } from './status-ring.component';

const RING_RADIUS = 7;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

describe('StatusRingComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function createComponent(status: TaskStatus) {
    const fixture = TestBed.createComponent(StatusRingComponent);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return fixture;
  }

  it('não preenche o traço quando a tarefa está TODO', () => {
    const fixture = createComponent('TODO');
    expect(fixture.componentInstance.dashOffset()).toBeCloseTo(CIRCUMFERENCE);
    expect(fixture.componentInstance.color()).toBe('var(--text-2)');
  });

  it('preenche metade do traço quando a tarefa está IN_PROGRESS', () => {
    const fixture = createComponent('IN_PROGRESS');
    expect(fixture.componentInstance.dashOffset()).toBeCloseTo(CIRCUMFERENCE * 0.5);
    expect(fixture.componentInstance.color()).toBe('var(--signal)');
  });

  it('preenche todo o traço e mostra o check quando a tarefa está DONE', () => {
    const fixture = createComponent('DONE');
    expect(fixture.componentInstance.dashOffset()).toBeCloseTo(0);
    expect(fixture.componentInstance.color()).toBe('var(--accent)');
    expect(fixture.nativeElement.querySelectorAll('path')).toHaveLength(1);
  });

  it('não preenche o traço e mostra o X quando a tarefa está CANCELLED', () => {
    const fixture = createComponent('CANCELLED');
    expect(fixture.componentInstance.dashOffset()).toBeCloseTo(CIRCUMFERENCE);
    expect(fixture.componentInstance.color()).toBe('var(--text-2)');
    expect(fixture.nativeElement.querySelectorAll('path')).toHaveLength(1);
  });

  it('não renderiza nenhum path para status sem ícone', () => {
    const fixture = createComponent('TODO');
    expect(fixture.nativeElement.querySelectorAll('path')).toHaveLength(0);
  });

  it.each<[TaskStatus, string]>([
    ['TODO', 'A fazer'],
    ['IN_PROGRESS', 'Em andamento'],
    ['DONE', 'Concluída'],
    ['CANCELLED', 'Cancelada'],
  ])('define o aria-label correto para %s', (status, expected) => {
    const fixture = createComponent(status);
    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('aria-label')).toBe(expected);
  });
});
