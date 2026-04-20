import type {
  EmployeeAddDraft,
  EmployeeConfirmData,
  EmployeeFormValues,
} from '@/types/employee';

const EMPLOYEE_ADD_DRAFT_KEY = 'employee-add-draft';
const EMPLOYEE_ADD_CONFIRM_KEY = 'employee-add-confirm';
const EMPLOYEE_ADD_RESTORE_KEY = 'employee-add-restore';

function isBrowser() {
  return typeof window !== 'undefined';
}

// Chuyển Date object từ form về chuỗi yyyy-MM-dd để lưu storage.
function formatDate(value: Date | null): string | null {
  if (!value) {
    return null;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Chuyển chuỗi ngày đã lưu về lại Date object để bind lại vào form.
function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// Tạo trạng thái ban đầu cho màn add với toàn bộ field rỗng.
export function createEmptyEmployeeFormValues(): EmployeeFormValues {
  return {
    employeeLoginId: '',
    departmentId: '',
    employeeName: '',
    employeeNameKana: '',
    employeeBirthDate: null,
    employeeEmail: '',
    employeeTelephone: '',
    employeeLoginPassword: '',
    employeeLoginPasswordConfirm: '',
    certificationId: '',
    certificationStartDate: null,
    certificationEndDate: null,
    score: '',
  };
}

// Chuẩn hóa dữ liệu form sang draft để lưu tạm khi đi sang màn confirm.
export function toEmployeeAddDraft(values: EmployeeFormValues): EmployeeAddDraft {
  return {
    employeeLoginId: values.employeeLoginId.trim(),
    departmentId: values.departmentId,
    employeeName: values.employeeName.trim(),
    employeeNameKana: values.employeeNameKana.trim(),
    employeeBirthDate: formatDate(values.employeeBirthDate),
    employeeEmail: values.employeeEmail.trim(),
    employeeTelephone: values.employeeTelephone.trim(),
    employeeLoginPassword: values.employeeLoginPassword,
    employeeLoginPasswordConfirm: values.employeeLoginPasswordConfirm,
    certificationId: values.certificationId,
    certificationStartDate: formatDate(values.certificationStartDate),
    certificationEndDate: formatDate(values.certificationEndDate),
    score: values.score.trim(),
  };
}

// Chuyển draft đã lưu thành dữ liệu form để restore khi quay lại màn add.
export function toEmployeeFormValues(draft: EmployeeAddDraft): EmployeeFormValues {
  return {
    employeeLoginId: draft.employeeLoginId,
    departmentId: draft.departmentId,
    employeeName: draft.employeeName,
    employeeNameKana: draft.employeeNameKana,
    employeeBirthDate: parseDate(draft.employeeBirthDate),
    employeeEmail: draft.employeeEmail,
    employeeTelephone: draft.employeeTelephone,
    employeeLoginPassword: draft.employeeLoginPassword,
    employeeLoginPasswordConfirm: draft.employeeLoginPasswordConfirm,
    certificationId: draft.certificationId,
    certificationStartDate: parseDate(draft.certificationStartDate),
    certificationEndDate: parseDate(draft.certificationEndDate),
    score: draft.score,
  };
}

// Đổi chuỗi ngày lưu trong draft sang dạng hiển thị yyyy/MM/dd ở màn confirm.
export function formatDisplayDate(value: string | null): string {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return '';
  }

  return `${year}/${month}/${day}`;
}

// Lưu dữ liệu nhập của màn add vào sessionStorage.
export function saveEmployeeAddDraft(draft: EmployeeAddDraft): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(EMPLOYEE_ADD_DRAFT_KEY, JSON.stringify(draft));
}

// Đọc lại draft màn add đã lưu trước đó.
export function loadEmployeeAddDraft(): EmployeeAddDraft | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(EMPLOYEE_ADD_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as EmployeeAddDraft;
  } catch {
    return null;
  }
}

// Lưu dữ liệu dùng để hiển thị ở màn confirm.
export function saveEmployeeConfirmData(data: EmployeeConfirmData): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(EMPLOYEE_ADD_CONFIRM_KEY, JSON.stringify(data));
}

// Đọc dữ liệu confirm đã lưu khi vào màn ADM005.
export function loadEmployeeConfirmData(): EmployeeConfirmData | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(EMPLOYEE_ADD_CONFIRM_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as EmployeeConfirmData;
  } catch {
    return null;
  }
}

// Đánh dấu việc quay ngược từ confirm về add để ADM004 biết cần restore draft.
export function setEmployeeAddRestoreFlag(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(EMPLOYEE_ADD_RESTORE_KEY, 'true');
}

// Kiểm tra xem lần mở ADM004 hiện tại có cần restore draft hay không.
export function shouldRestoreEmployeeAddDraft(): boolean {
  if (!isBrowser()) {
    return false;
  }

  return window.sessionStorage.getItem(EMPLOYEE_ADD_RESTORE_KEY) === 'true';
}

// Xóa cờ restore sau khi ADM004 đã đọc và bind xong draft.
export function clearEmployeeAddRestoreFlag(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(EMPLOYEE_ADD_RESTORE_KEY);
}

// Xóa toàn bộ dữ liệu tạm của luồng add/confirm.
export function clearEmployeeAddFlow(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(EMPLOYEE_ADD_DRAFT_KEY);
  window.sessionStorage.removeItem(EMPLOYEE_ADD_CONFIRM_KEY);
  window.sessionStorage.removeItem(EMPLOYEE_ADD_RESTORE_KEY);
}
