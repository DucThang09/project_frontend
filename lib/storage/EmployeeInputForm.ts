import type {
  EmployeeAdd,
  EmployeeConfirmData,
  EmployeeFormValues,
} from '@/types/employee';
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';

const EMPLOYEE_ADD_KEY = 'employee-add';
const CONFIRM_DATA_KEY = 'employee-confirm-data';
const RESTORE_KEY = 'employee-add-restore';

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
export function createEmployeeEmpty(): EmployeeFormValues {
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

// Chuẩn hóa dữ liệu form để lưu tạm khi đi sang màn confirm.
export function toEmployeeAdd(
  values: EmployeeFormValues, 
  departments: DepartmentDTO[],
  certifications: CertificationDTO[],
): EmployeeAdd {
  const dept = departments.find((d) => String(d.departmentId) === values.departmentId);
  const cert = certifications.find((c) => String(c.certificationId) === values.certificationId);

  return {
    employeeLoginId:              values.employeeLoginId.trim(),
    departmentId:                 values.departmentId,
    departmentName:               dept?.departmentName ?? '',
    employeeName:                 values.employeeName.trim(),
    employeeNameKana:             values.employeeNameKana.trim(),
    employeeBirthDate:            formatDate(values.employeeBirthDate),
    employeeEmail:                values.employeeEmail.trim(),
    employeeTelephone:            values.employeeTelephone.trim(),
    employeeLoginPassword:        values.employeeLoginPassword,
    employeeLoginPasswordConfirm: values.employeeLoginPasswordConfirm,
    certificationId:              values.certificationId,
    certificationName:            cert?.certificationName ?? '',
    certificationStartDate:       formatDate(values.certificationStartDate),
    certificationEndDate:         formatDate(values.certificationEndDate),
    score:                        values.score.trim(),
  };
}

// Chuyển data đã lưu thành dữ liệu form để restore khi quay lại màn add.
export function toEmployeeFormValues(data: EmployeeAdd): EmployeeFormValues {
  return {
    employeeLoginId: data.employeeLoginId,
    departmentId: data.departmentId,
    employeeName: data.employeeName,
    employeeNameKana: data.employeeNameKana,
    employeeBirthDate: parseDate(data.employeeBirthDate),
    employeeEmail: data.employeeEmail,
    employeeTelephone: data.employeeTelephone,
    employeeLoginPassword: data.employeeLoginPassword,
    employeeLoginPasswordConfirm: data.employeeLoginPasswordConfirm,
    certificationId: data.certificationId,
    certificationStartDate: parseDate(data.certificationStartDate),
    certificationEndDate: parseDate(data.certificationEndDate),
    score: data.score,
  };
}

// Đổi chuỗi ngày đã lưu sang dạng hiển thị yyyy/MM/dd ở màn confirm.
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
export function saveEmployeeAdd(data: EmployeeAdd): void {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(EMPLOYEE_ADD_KEY, JSON.stringify(data));
}

// Đọc lại data màn add đã lưu trước đó.
export function loadEmployeeAdd(): EmployeeAdd | null {
  if (!isBrowser()) {
    return null;
  }
  const sessionValue = window.sessionStorage.getItem(EMPLOYEE_ADD_KEY);
  if (!sessionValue) {
    return null;
  }

  try {
    return JSON.parse(sessionValue) as EmployeeAdd;
  } catch {
    return null;
  }
}

// Lưu dữ liệu form vào storage trước khi chuyển sang trang xác nhận.
export function saveEmployeeConfirmData(data: EmployeeConfirmData): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(CONFIRM_DATA_KEY, JSON.stringify(data));
}

// Tải dữ liệu từ storage.
export function loadEmployeeConfirmData(): EmployeeConfirmData | null {
  if (!isBrowser()) {
    return null;
  }
  const sessionValue = window.sessionStorage.getItem(CONFIRM_DATA_KEY);
  if (!sessionValue) {
    return null;
  }

  try {
    return JSON.parse(sessionValue) as EmployeeConfirmData;
  } catch {
    return null;
  }
}

// form cần khôi phục dữ liệu khi quay lại.
export function setEmployeeAddRestore(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(RESTORE_KEY, 'true');
}

export function shouldRestoreEmployeeAdd(): boolean {
  if (!isBrowser()) {
    return false;
  }

  return window.sessionStorage.getItem(RESTORE_KEY) === 'true';
}

export function clearEmployeeAddRestore(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(RESTORE_KEY);
}

// Xóa toàn bộ dữ liệu tạm của luồng add/confirm.
export function clearEmployeeAdd(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(EMPLOYEE_ADD_KEY);
  window.sessionStorage.removeItem(CONFIRM_DATA_KEY);
  window.sessionStorage.removeItem(RESTORE_KEY);
}
