import { apiClient } from './client';

const DEPARTMENT_ENDPOINT = '/user/departments';

export interface DepartmentDTO {
  readonly departmentId: number;
  readonly departmentName: string;
}

export interface DepartmentResponse {
  readonly code: number;
  readonly departments: DepartmentDTO[];
}

export async function getDepartments(): Promise<DepartmentDTO[]> {
  const { data } = await apiClient.get<DepartmentResponse>(DEPARTMENT_ENDPOINT);

  return data.departments ?? [];
}
