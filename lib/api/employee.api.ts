import { apiClient } from './client';

const EMPLOYEE_ENDPOINT = '/user/employees';

export type SortOrder = 'ASC' | 'DESC';

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

export interface ApiMessage {
  readonly code: string;
  readonly params: string[];
}

export interface EmployeeListApiResponse {
  readonly code: number;
  readonly totalRecords: number;
  readonly employees: EmployeeDTO[];
  readonly message?: ApiMessage;
}

export interface EmployeeSearchParams {
  employee_name?: string;
  department_id?: number;
  ord_employee_name?: SortOrder;
  ord_certification_name?: SortOrder;
  ord_end_date?: SortOrder;
  offset?: number;
  limit?: number;
}

export async function getEmployees(
  params?: EmployeeSearchParams
): Promise<EmployeeListApiResponse> {
  const { data } = await apiClient.get<EmployeeListApiResponse>(
    EMPLOYEE_ENDPOINT,
    { params }
  );

  return data;
}
