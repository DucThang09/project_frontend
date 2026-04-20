import type {
  EmployeeListApiResponse,
  EmployeeSearchParams,
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
