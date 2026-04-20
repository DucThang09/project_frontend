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
