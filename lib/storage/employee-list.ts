import type { SortOrder } from '@/types/employee';

const EMPLOYEE_LIST_STATE_KEY = 'employee-list-state';

export type EmployeeListSortField = 'employee_name' | 'certification_name' | 'end_date';

export interface EmployeeListState {
  employeeName: string;
  departmentId: string;
  formEmployeeName: string;
  formDepartmentId: string;
  currentPage: number;
  ordEmployeeName: SortOrder;
  ordCertificationName: SortOrder;
  ordEndDate: SortOrder;
  currentSortField: EmployeeListSortField;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function saveEmployeeListState(state: EmployeeListState): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(EMPLOYEE_LIST_STATE_KEY, JSON.stringify(state));
}

export function loadEmployeeListState(): EmployeeListState | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(EMPLOYEE_LIST_STATE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as EmployeeListState;
  } catch {
    return null;
  }
}

export function clearEmployeeListState(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(EMPLOYEE_LIST_STATE_KEY);
}
