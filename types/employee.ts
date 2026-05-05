/**
 * Copyright(C) 2026 Luvina Software Company
 * employee.ts, April 13, 2026 tdthang
 */

export type SortOrder = 'ASC' | 'DESC';

/**
 * Cấu trúc dữ liệu của một nhân viên trong danh sách trả về từ API.
 */
export interface Employee {
  readonly employeeId: number;
  readonly employeeName: string;
  readonly employeeBirthDate: string | null;
  readonly departmentName: string | null;
  readonly employeeEmail: string;
  readonly employeeTelephone: string | null;
  readonly certificationName: string | null;
  readonly endDate: string | null;
  readonly score: number | null;
}

/**
 * Cấu trúc dữ liệu của một phòng ban trả về từ API.
 */
export interface ApiMessage {
  readonly code: string;
  readonly params: string[];
}

/**
 * Cấu trúc response của API danh sách nhân viên.
 */
export interface EmployeeListApiResponse {
  readonly code: number;
  readonly totalRecords: number;
  readonly employees: Employee[];
  readonly message?: ApiMessage;
}

/**
 * Cấu trúc dữ liệu của chi tiết một nhân viên trả về từ API.
 */
export interface EmployeeDetail {
  readonly employeeId: number;
  readonly employeeLoginId: string;
  readonly departmentId: number;
  readonly departmentName: string;
  readonly employeeName: string;
  readonly employeeNameKana: string;
  readonly employeeBirthDate: string | null;
  readonly employeeEmail: string;
  readonly employeeTelephone: string | null;
  readonly certificationId: number | null;
  readonly certificationName: string | null;
  readonly certificationStartDate: string | null;
  readonly certificationEndDate: string | null;
  readonly score: number | null;
}

/**
 * Cấu trúc response của API chi tiết nhân viên.
 */
export interface EmployeeDetailApiResponse {
  readonly code: number;
  readonly employee?: EmployeeDetail;
  readonly message?: ApiMessage;
}

/**
 * Điều kiện tìm kiếm danh sách nhân viên.
 */
export interface EmployeeSearchParams {
  employee_name?: string;
  department_id?: number;
  ord_employee_name?: SortOrder;
  ord_certification_name?: SortOrder;
  ord_end_date?: SortOrder;
  offset?: number;
  limit?: number;
}

/**
 * Dữ liệu form cho màn thêm/sửa nhân viên.
 */
export interface EmployeeFormValues {
  employeeLoginId: string;
  departmentId: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: Date | null;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword: string;
  employeeLoginPasswordConfirm: string;
  certificationId: string;
  certificationStartDate: Date | null;
  certificationEndDate: Date | null;
  score: string;
}

/**
 * Payload gửi backend để validate dữ liệu nhân viên.
 */
export interface EmployeeValidationRequest {
  employeeId?: string;
  employeeLoginId: string;
  departmentId: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string | null;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword: string;
  employeeLoginPasswordConfirm: string;
  certificationId: string;
  certificationStartDate: string | null;
  certificationEndDate: string | null;
  score: string;
}

/**
 * Cấu trúc response của API validate dữ liệu nhân viên.
 */
export interface EmployeeValidationApiResponse {
  readonly code: number;
  readonly message?: ApiMessage;
}

/**
 * Cấu trúc response của API xóa nhân viên.
 */
export interface EmployeeDeleteApiResponse {
  readonly code: number;
  readonly employeeId?: string;
  readonly message?: ApiMessage;
}

/**
 * Kiểu dữ liệu cho mode của form nhân viên.
 */
export type EmployeeMode = 'add' | 'edit';
/**
 * Cấu trúc dữ liệu của một nhân viên dùng cho màn hình confirm khi thêm mới nhân viên
 */
export interface EmployeeAdd {
  mode: EmployeeMode;
  employeeId: string;
  employeeLoginId: string;
  departmentId: string;
  departmentName: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string | null;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword: string;
  employeeLoginPasswordConfirm: string;
  certificationId: string;
  certificationName: string;
  certificationStartDate: string | null;
  certificationEndDate: string | null;
  score: string;
}

/**
 * Cấu trúc dữ liệu của một nhân viên dùng cho màn hình confirm khi cập nhật nhân viên
 */
export interface EmployeeConfirmData {
  employeeLoginId: string;
  departmentName: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string;
  employeeEmail: string;
  employeeTelephone: string;
  certificationName: string;
  certificationStartDate: string;
  certificationEndDate: string;
  score: string;
}
