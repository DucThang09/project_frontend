import type { SortOrder } from '@/types/employee';

// Khóa lưu trạng thái danh sách nhân viên trong sessionStorage
const EMPLOYEE_LIST_STATE_KEY = 'employee-list-state';

// Các trường sắp xếp trong danh sách nhân viên
export type EmployeeListSortField = 'employee_name' | 'certification_name' | 'end_date';


export interface EmployeeListState {
  employeeName: string;       
  departmentId: string;      
  formEmployeeName: string;   
  formDepartmentId: string;   
  currentPage: number;        
  ordEmployeeName: SortOrder;       
  ordCertificationName: SortOrder;  
  ordEndDate: SortOrder;            
  currentSortField: EmployeeListSortField; 
}
// Kiểm tra có đang chạy trên môi trường trình duyệt không
function isBrowser() {
  return typeof window !== 'undefined';
}

// Lưu trạng thái danh sách nhân viên vào sessionStorage
export function saveEmployeeListState(state: EmployeeListState): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(EMPLOYEE_LIST_STATE_KEY, JSON.stringify(state));
}

// Tải trạng thái danh sách nhân viên từ sessionStorage
// Trả về null nếu không có dữ liệu hoặc dữ liệu không hợp lệ
export function loadEmployeeListState(): EmployeeListState | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(EMPLOYEE_LIST_STATE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as EmployeeListState;
  } catch {
    // Trả về null nếu dữ liệu JSON bị lỗi
    return null;
  }
}

// Xóa trạng thái danh sách nhân viên khỏi sessionStorage
export function clearEmployeeListState(): void {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(EMPLOYEE_LIST_STATE_KEY);
}