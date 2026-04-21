import type { Department, DepartmentResponse } from '@/types/department';
import { apiClient } from './client';

// Endpoint lấy danh sách phòng ban.
const DEPARTMENT_ENDPOINT = '/user/departments';

// Gọi API lấy danh sách phòng ban để hiển thị ở combobox.
export async function getDepartments(): Promise<Department[]> {
  const { data } = await apiClient.get<DepartmentResponse>(DEPARTMENT_ENDPOINT);

  return data.departments ?? [];
}
