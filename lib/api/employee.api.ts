import type {
  EmployeeDetailApiResponse,
  EmployeeListApiResponse,
  EmployeeSearchParams,
  EmployeeValidationApiResponse,
  EmployeeValidationRequest,
} from '@/types/employee';
import { apiClient } from './client';

const EMPLOYEE_ENDPOINT = '/employee';

export async function getEmployees(
  params?: EmployeeSearchParams
): Promise<EmployeeListApiResponse> {
  const { data } = await apiClient.get<EmployeeListApiResponse>(
    EMPLOYEE_ENDPOINT,
    { params }
  );

  return data;
}

export async function getEmployeeDetail(
  employeeId: string
): Promise<EmployeeDetailApiResponse> {
  const { data } = await apiClient.get<EmployeeDetailApiResponse>(
    `${EMPLOYEE_ENDPOINT}/${employeeId}`
  );

  return data;
}

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
