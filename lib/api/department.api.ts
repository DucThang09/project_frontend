import type { DepartmentDTO, DepartmentResponse } from '@/types/department';
import { HTTP_STATUS_OK } from '@/lib/constants/employee';
import { apiClient } from './client';

// Endpoint lấy danh sách phòng ban.
const DEPARTMENT_ENDPOINT = '/department';

// Gọi API lấy danh sách phòng ban để hiển thị ở combobox.
export async function getDepartments(): Promise<DepartmentDTO[]> {
  const { data } = await apiClient.get<DepartmentResponse>(DEPARTMENT_ENDPOINT);

  if (data.code !== HTTP_STATUS_OK) {
    throw new Error('Failed to get departments');
  }

  return data.departments ?? [];
}
