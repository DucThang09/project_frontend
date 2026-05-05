/**
 * Copyright(C) 2026 Luvina Software Company
 * useADM002.ts, April 13, 2026 tdthang
 */
import type {
  EmployeeDetailApiResponse,
  EmployeeDeleteApiResponse,
  EmployeeListApiResponse,
  EmployeeSearchParams,
  EmployeeValidationApiResponse,
  EmployeeValidationRequest,
} from '@/types/employee';
import { apiClient } from './client';
// API liên quan đến nhân viên, bao gồm lấy danh sách, lấy chi tiết, validate, thêm mới, cập nhật và xóa nhân viên.
const EMPLOYEE_ENDPOINT = '/employee';
/**
 * Hàm gọi API lấy danh sách nhân viên với các tham số tìm kiếm tùy chọn như loginId, employeeName, departmentId, page và pageSize.
 * @param params 
 * @returns 
 */
export async function getEmployees(
  params?: EmployeeSearchParams
): Promise<EmployeeListApiResponse> {
  const { data } = await apiClient.get<EmployeeListApiResponse>(
    EMPLOYEE_ENDPOINT,
    { params }
  );

  return data;
}
/**
 *  Hàm gọi API lấy chi tiết nhân viên theo employeeId để hiển thị
 * @param employeeId 
 * @returns 
 */
export async function getEmployeeDetail(
  employeeId: string
): Promise<EmployeeDetailApiResponse> {
  const { data } = await apiClient.get<EmployeeDetailApiResponse>(
    `${EMPLOYEE_ENDPOINT}/${employeeId}`
  );

  return data;
}
/**
 * Hàm gọi API validate dữ liệu nhân viên trước khi thêm mới hoặc cập nhật.
 * @param payload 
 * @returns 
 */
export async function validateEmployeeInput(
  payload: EmployeeValidationRequest
): Promise<EmployeeValidationApiResponse> {
  const { data } = await apiClient.post<EmployeeValidationApiResponse>(
    `${EMPLOYEE_ENDPOINT}/validate`,
    payload
  );

  return data;
}
/**
 * Hàm gọi API thêm mới nhân viên với dữ liệu đã validate.
 * @param payload 
 * @returns 
 */
export async function addEmployee(
  payload: EmployeeValidationRequest
): Promise<EmployeeValidationApiResponse> {
  const { data } = await apiClient.post<EmployeeValidationApiResponse>(
    EMPLOYEE_ENDPOINT,
    payload
  );

  return data;
}
/**
 * Hàm gọi API cập nhật nhân viên với employeeId và dữ liệu đã validate.
 * @param employeeId 
 * @param payload 
 * @returns 
 */
export async function updateEmployee(
  employeeId: string,
  payload: EmployeeValidationRequest
): Promise<EmployeeValidationApiResponse> {
  const { data } = await apiClient.put<EmployeeValidationApiResponse>(
    EMPLOYEE_ENDPOINT,
    {
      ...payload,
      employeeId,
    }
  );

  return data;
}
/**
 * Hàm gọi API xóa nhân viên theo employeeId.
 * @param employeeId 
 * @returns 
 */
export async function deleteEmployee(
  employeeId: string
): Promise<EmployeeDeleteApiResponse> {
  const { data } = await apiClient.delete<EmployeeDeleteApiResponse>(
    EMPLOYEE_ENDPOINT,
    { params: { employeeId } }
  );

  return data;
}
