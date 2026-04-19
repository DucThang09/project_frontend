import { apiClient } from './client';

// Endpoint lấy danh sách phòng ban.
const DEPARTMENT_ENDPOINT = '/user/departments';

// Dữ liệu một phòng ban trả về từ API.
export interface DepartmentDTO {
  readonly departmentId: number;
  readonly departmentName: string;
}

// Cấu trúc response của API danh sách phòng ban.
export interface DepartmentResponse {
  readonly code: number;
  readonly departments: DepartmentDTO[];
}

// Gọi API lấy danh sách phòng ban để hiển thị ở combobox.
export async function getDepartments(): Promise<DepartmentDTO[]> {
  const { data } = await apiClient.get<DepartmentResponse>(DEPARTMENT_ENDPOINT);

  return data.departments ?? [];
}
