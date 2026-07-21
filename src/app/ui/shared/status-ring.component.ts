import { Component, computed, input } from '@angular/core';
import { TaskStatus } from '@domain/task/task.value-objects';
import { statusProgress } from '@domain/task/task.value-objects';

const RADIUS = 7;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-status-ring',
  template: `
    <svg width="18" height="18" viewBox="0 0 18 18" [attr.aria-label]="label()">
      <circle
        cx="9" cy="9" [attr.r]="radius"
        fill="none" stroke="var(--border)" stroke-width="2"
      />
      <circle
        cx="9" cy="9" [attr.r]="radius"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="2"
        stroke-linecap="round"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="dashOffset()"
        transform="rotate(-90 9 9)"
      />
      @if (status() === 'DONE') {
        <path
          d="M6 9.2l2 2L12.2 7"
          fill="none" [attr.stroke]="color()"
          stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
        />
      }
      @if (status() === 'CANCELLED') {
        <path
          d="M6.5 6.5l5 5M11.5 6.5l-5 5"
          fill="none" stroke="var(--text-2)"
          stroke-width="1.4" stroke-linecap="round"
        />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
  `,
})
export class StatusRingComponent {
  readonly status = input.required<TaskStatus>();

  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  readonly dashOffset = computed(
    () => CIRCUMFERENCE * (1 - statusProgress(this.status())),
  );

  readonly color = computed(() => {
    switch (this.status()) {
      case 'DONE':
        return 'var(--accent)';
      case 'IN_PROGRESS':
        return 'var(--signal)';
      default:
        return 'var(--text-2)';
    }
  });

  readonly label = computed(() => {
    switch (this.status()) {
      case 'TODO':
        return 'A fazer';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'DONE':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
    }
  });
}
