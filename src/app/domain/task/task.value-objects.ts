export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export function statusProgress(status: TaskStatus): number {
  switch (status) {
    case 'TODO':
      return 0;
    case 'IN_PROGRESS':
      return 0.5;
    case 'DONE':
      return 1;
    case 'CANCELLED':
      return 0;
  }
}

export function canAdvance(status: TaskStatus): boolean {
  return status === 'TODO' || status === 'IN_PROGRESS';
}

export function nextStatus(status: TaskStatus): TaskStatus {
  switch (status) {
    case 'TODO':
      return 'IN_PROGRESS';
    case 'IN_PROGRESS':
      return 'DONE';
    case 'DONE':
    case 'CANCELLED':
      throw new Error(`Não há próximo status para uma tarefa ${status}.`);
  }
}
