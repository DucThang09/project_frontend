import type {
  EmployeeListApiResponse,
  EmployeeSearchParams,
  EmployeeValidationApiResponse,
  EmployeeValidationRequest,
} from '@/types/employee';
import { apiClient } from './client';

// Endpoint lấy danh sách nhân viên.
const EMPLOYEE_ENDPOINT = '/employee';

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

// Gọi API validate employee input trước khi chuyển sang màn confirm.
export async function validateEmployeeInput(
  payload: EmployeeValidationRequest
): Promise<EmployeeValidationApiResponse> {
  const { data } = await apiClient.post<EmployeeValidationApiResponse>(
    `${EMPLOYEE_ENDPOINT}/validate`,
    payload
  );

  return data;
}

export async function addEmployee(
  payload: EmployeeValidationRequest
): Promise<EmployeeValidationApiResponse> {
  const { data } = await apiClient.post<EmployeeValidationApiResponse>(
    EMPLOYEE_ENDPOINT,
    payload
  );

  return data;
}

export async function updateEmployee(
  employeeId: string,
  payload: EmployeeValidationRequest
): Promise<EmployeeValidationApiResponse> {
  const { data } = await apiClient.put<EmployeeValidationApiResponse>(
    `${EMPLOYEE_ENDPOINT}/${employeeId}`,
    payload
  );

  return data;
}
