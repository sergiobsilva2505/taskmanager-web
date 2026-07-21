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
