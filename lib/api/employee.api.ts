import { apiClient } from './client';

// Endpoint lấy danh sách nhân viên.
const EMPLOYEE_ENDPOINT = '/user/employees';

// Kiểu sắp xếp hỗ trợ ở màn hình danh sách.
export type SortOrder = 'ASC' | 'DESC';

// Dữ liệu một bản ghi nhân viên trả về từ API.
export interface EmployeeDTO {
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
  readonly employees: EmployeeDTO[];
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

// Gọi API lấy danh sách nhân viên theo điều kiện hiện tại.
export async function getEmployees(
  params?: EmployeeSearchParams
): Promise<EmployeeListApiResponse> {
  const { data } = await apiClient.get<EmployeeListApiResponse>(
    EMPLOYEE_ENDPOINT,
    { params }
  );

  return data;
}
