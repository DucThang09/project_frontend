const EMPLOYEE_DETAIL_ID_KEY = 'employee-detail-id';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function saveEmployeeDetailId(employeeId: string | number): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(EMPLOYEE_DETAIL_ID_KEY, String(employeeId));
}

export function loadEmployeeDetailId(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage.getItem(EMPLOYEE_DETAIL_ID_KEY);
}

export function clearEmployeeDetailId(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(EMPLOYEE_DETAIL_ID_KEY);
}
