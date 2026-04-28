// Kieu sap xep ho tro o man hinh danh sach.
export type SortOrder = 'ASC' | 'DESC';

// Du lieu mot ban ghi nhan vien tra ve tu API danh sach.
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

// Ma message va tham so di kem tu backend.
export interface ApiMessage {
  readonly code: string;
  readonly params: string[];
}

// Cau truc response cua API danh sach nhan vien.
export interface EmployeeListApiResponse {
  readonly code: number;
  readonly totalRecords: number;
  readonly employees: Employee[];
  readonly message?: ApiMessage;
}

// Du lieu chi tiet cua mot nhan vien tra ve tu API.
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

// Cau truc response cua API chi tiet nhan vien.
export interface EmployeeDetailApiResponse {
  readonly code: number;
  readonly employee?: EmployeeDetail;
  readonly message?: ApiMessage;
}

// Dieu kien tim kiem danh sach nhan vien.
export interface EmployeeSearchParams {
  employee_name?: string;
  department_id?: number;
  ord_employee_name?: SortOrder;
  ord_certification_name?: SortOrder;
  ord_end_date?: SortOrder;
  offset?: number;
  limit?: number;
}

// Du lieu form cho man them/sua nhan vien.
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

// Payload gui backend de validate employee input.
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

// Cau truc response cua API validate employee input.
export interface EmployeeValidationApiResponse {
  readonly code: number;
  readonly message?: ApiMessage;
}

export interface EmployeeDeleteApiResponse {
  readonly code: number;
  readonly employeeId?: string;
  readonly message?: ApiMessage;
}

// Du lieu tam luu cua man add truoc khi sang confirm.
export type EmployeeMode = 'add' | 'edit';

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

// Du lieu hien thi o man confirm add employee.
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
