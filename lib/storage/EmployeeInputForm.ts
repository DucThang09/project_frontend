import type {
  EmployeeAdd,
  EmployeeDetail,
  EmployeeConfirmData,
  EmployeeFormValues,
  EmployeeMode,
} from '@/types/employee';
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';

const EMPLOYEE_DATA_KEY = 'employee-data';//Lưu dữ liệu form của màn add/edit employee
const CONFIRM_DATA_KEY = 'employee-confirm-data';//Lưu dữ liệu đã format để hiển thị ở màn confirm
const RESTORE_KEY = 'employee-restore';//khi quay lại từ màn confirm thì màn form cần restore dữ liệu trước đó, thay vì khởi tạo mới

function isBrowser() {
  return typeof window !== 'undefined';
}

// Chuyển Date object từ form về chuỗi ISO yyyy-MM-dd để lưu storage/API.
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

// Chuẩn hóa dữ liệu form để lưu khi đi sang màn confirm.
export function toEmployeeAdd(
  values: EmployeeFormValues,
  departments: DepartmentDTO[],
  certifications: CertificationDTO[],
  mode: EmployeeMode,
  employeeId: string | null,
): EmployeeAdd {
  const dept = departments.find((d) => String(d.departmentId) === values.departmentId);
  const cert = certifications.find((c) => String(c.certificationId) === values.certificationId);

  return {
    mode,
    employeeId: employeeId ?? '',
    employeeLoginId: values.employeeLoginId.trim(),
    departmentId: values.departmentId,
    departmentName: dept?.departmentName ?? '',
    employeeName: values.employeeName.trim(),
    employeeNameKana: values.employeeNameKana.trim(),
    employeeBirthDate: formatDate(values.employeeBirthDate),
    employeeEmail: values.employeeEmail.trim(),
    employeeTelephone: values.employeeTelephone.trim(),
    employeeLoginPassword: values.employeeLoginPassword,
    employeeLoginPasswordConfirm: values.employeeLoginPasswordConfirm,
    certificationId: values.certificationId,
    certificationName: cert?.certificationName ?? '',
    certificationStartDate: formatDate(values.certificationStartDate),
    certificationEndDate: formatDate(values.certificationEndDate),
    score: values.score.trim(),
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

// Chuyen data chi tiet nhan vien tu API thanh du lieu form de bind o man sua.
export function toEmployeeFormValuesFromDetail(
  data: EmployeeDetail
): EmployeeFormValues {
  return {
    employeeLoginId: data.employeeLoginId,
    departmentId: String(data.departmentId),
    employeeName: data.employeeName,
    employeeNameKana: data.employeeNameKana,
    employeeBirthDate: parseDate(data.employeeBirthDate),
    employeeEmail: data.employeeEmail,
    employeeTelephone: data.employeeTelephone ?? '',
    employeeLoginPassword: '',
    employeeLoginPasswordConfirm: '',
    certificationId: data.certificationId ? String(data.certificationId) : '',
    certificationStartDate: parseDate(data.certificationStartDate),
    certificationEndDate: parseDate(data.certificationEndDate),
    score: data.score != null ? String(data.score) : '',
  };
}
//dữ liệu hiển thị ở confirm
export function toEmployeeConfirmData(data: EmployeeAdd): EmployeeConfirmData {
  return {
    employeeLoginId: data.employeeLoginId,
    departmentName: data.departmentName,
    employeeName: data.employeeName,
    employeeNameKana: data.employeeNameKana,
    employeeBirthDate: formatDisplayDate(data.employeeBirthDate),
    employeeEmail: data.employeeEmail,
    employeeTelephone: data.employeeTelephone,
    certificationName: data.certificationName,
    certificationStartDate: formatDisplayDate(data.certificationStartDate),
    certificationEndDate: formatDisplayDate(data.certificationEndDate),
    score: data.score,
  };
}

export function formatDisplayDate(value: string | null): string {
  if (!value) {
    return '';
  }

  return value.replaceAll('-', '/');
}

// Lưu dữ liệu nhập của màn add vào sessionStorage.
export function dataEmployeeAdd(data: EmployeeAdd): void {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(EMPLOYEE_DATA_KEY, JSON.stringify(data));
}

export const saveEmployeeAdd = dataEmployeeAdd;

// Đọc lại data màn add đã lưu trước đó.
export function loadEmployeeAdd(): EmployeeAdd | null {
  if (!isBrowser()) {
    return null;
  }
  const sessionValue = window.sessionStorage.getItem(EMPLOYEE_DATA_KEY);
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
export function employeeConfirmData(data: EmployeeConfirmData): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(CONFIRM_DATA_KEY, JSON.stringify(data));
}

export const saveEmployeeConfirmData = employeeConfirmData;

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

// Form cần khôi phục dữ liệu khi quay lại.
export function setEmployeeAddRestore(): void {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(RESTORE_KEY, 'true');
}

export function RestoreEmployeeAdd(): boolean {
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
  window.sessionStorage.removeItem(EMPLOYEE_DATA_KEY);
  window.sessionStorage.removeItem(CONFIRM_DATA_KEY);
  window.sessionStorage.removeItem(RESTORE_KEY);
}
