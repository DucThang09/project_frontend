// Kiểu sắp xếp hỗ trợ ở màn hình danh sách.
export type SortOrder = 'ASC' | 'DESC';

// Dữ liệu một bản ghi nhân viên trả về từ API.
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

// Mã message và tham số đi kèm từ backend.
export interface ApiMessage {
  readonly code: string;
  readonly params: string[];
}

// Cấu trúc response của API danh sách nhân viên.
export interface EmployeeListApiResponse {
  readonly code: number;
  readonly totalRecords: number;
  readonly employees: Employee[];
  readonly message?: ApiMessage;
}

// Điều kiện tìm kiếm danh sách nhân viên.
export interface EmployeeSearchParams {
  employee_name?: string;
  department_id?: number;
  ord_employee_name?: SortOrder;
  ord_certification_name?: SortOrder;
  ord_end_date?: SortOrder;
  offset?: number;
  limit?: number;
}

// Dữ liệu form cho màn thêm/sửa nhân viên.
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

// Dữ liệu tạm lưu của màn add trước khi sang confirm.
export interface EmployeeAdd {
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

// Dữ liệu hiển thị ở màn confirm add employee.
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
