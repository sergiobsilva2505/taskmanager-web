export type StatusCount = Record<string, number>;
export type PriorityCount = Record<string, number>;

export interface Dashboard {
  totalTasks: number;
  countByStatus: StatusCount;
  countByPriority: PriorityCount;
  overdueCount: number;
  dueSoonCount: number;
}