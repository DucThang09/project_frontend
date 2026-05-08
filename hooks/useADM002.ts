'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * useADM002.ts, April 13, 2026 tdthang
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getEmployees } from '@/lib/api/employee.api';
import {
  EMPLOYEE_LIST_PAGE_SIZE,
  HTTP_STATUS_OK,
} from '@/lib/constants/employee';
import { getDepartments } from '@/lib/api/department.api';
import {
  clearEmployeeListState,
  loadEmployeeListState,
  saveEmployeeListState,
  type EmployeeListSortField,
} from '@/lib/storage/employeeList';
import type { DepartmentDTO } from '@/types/department';
import type {
  Employee,
  EmployeeSearchParams,
  SortOrder,
} from '@/types/employee';

/**
 * Quản lý dữ liệu và trạng thái cho màn hình danh sách nhân viên ADM002.
 *
 * @returns Dữ liệu cần thiết cho component danh sách nhân viên.
 */
export function useEmployeeList() {
  const router = useRouter();
  const [restoredListState] = useState(() => loadEmployeeListState());
  type SearchFormValues = {
    employeeName: string;
    departmentId: string;
  };
  // State quản lý danh sách nhân viên, tổng số bản ghi, thông báo rỗng, lỗi phòng ban, điều kiện tìm kiếm đã cam kết, trang hiện tại, thứ tự sắp xếp và danh sách phòng ban.
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState('');
  const [committedName, setCommittedName] = useState(restoredListState?.employeeName ?? '');
  const [committedGroup, setCommittedGroup] = useState(restoredListState?.departmentId ?? '');
  const [currentPage, setCurrentPage] = useState(restoredListState?.currentPage ?? 1);
  const [ordEmployeeName, setOrdEmployeeName] = useState<SortOrder>(restoredListState?.ordEmployeeName ?? 'ASC');
  const [ordCertificationName, setOrdCertificationName] = useState<SortOrder>(restoredListState?.ordCertificationName ?? 'ASC');
  const [ordEndDate, setOrdEndDate] = useState<SortOrder>(restoredListState?.ordEndDate ?? 'ASC');
  const limit = EMPLOYEE_LIST_PAGE_SIZE;
  const [currentSortField, setCurrentSortField] = useState<EmployeeListSortField>(restoredListState?.currentSortField ?? 'employee_name');
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);

  //Khởi tạo điều kiện search ban đầu
  const { register, handleSubmit } = useForm<SearchFormValues>({
    defaultValues: {
      employeeName: restoredListState?.formEmployeeName ?? restoredListState?.employeeName ?? '',
      departmentId: restoredListState?.formDepartmentId ?? restoredListState?.departmentId ?? '',
    },
  });
  //Tính toán tổng số trang dựa trên tổng số bản ghi và số bản ghi trên mỗi trang.
  const totalPages = Math.ceil(totalRecords / limit);
  // Hàm để xây dựng tham số tìm kiếm cho API dựa trên điều kiện hiện tại, chỉ thêm điều kiện nếu người dùng đã nhập hoặc chọn để tránh gửi tham số rỗng không cần thiết.
  const buildEmployeeSearchParams = useCallback((conditions: {
    page: number;
    employeeName: string;
    departmentId: string;
    ordEmployeeName: SortOrder;
    ordCertificationName: SortOrder;
    ordEndDate: SortOrder;
  }): EmployeeSearchParams => {
    const params: EmployeeSearchParams = {// Tính toán offset dựa trên trang hiện tại và số bản ghi trên mỗi trang để phân trang.
      offset: (conditions.page - 1) * limit,
      limit,
      ord_employee_name: conditions.ordEmployeeName,
      ord_certification_name: conditions.ordCertificationName,
      ord_end_date: conditions.ordEndDate,
    };
    // Chỉ thêm điều kiện tìm kiếm vào tham số nếu người dùng đã nhập giá trị để tránh gửi tham số rỗng không cần thiết đến API.
    if (conditions.employeeName) {
      params.employee_name = conditions.employeeName;
    }
    // Chỉ thêm điều kiện phòng ban nếu người dùng đã chọn để tránh gửi tham số rỗng không cần thiết đến API.
    if (conditions.departmentId) {
      params.department_id = Number(conditions.departmentId);
    }

    return params;
  }, [limit]);

  /**
   * Lấy danh sách phòng ban để hiển thị trong combobox tìm kiếm.
   *
   * @returns hoàn thành sau khi cập nhật state danh sách phòng ban.
   */
  const fetchDepartments = useCallback(async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
      setDepartmentErrorMessage('');
    } catch {
      setDepartments([]);
      setDepartmentErrorMessage('部門を取得できません');
    }
  }, []);

  /**
   * Lấy danh sách nhân viên theo điều kiện tìm kiếm, sắp xếp và phân trang.
   *
   * @returns  hoàn thành sau khi cập nhật state danh sách nhân viên.
   */
  const fetchEmployees = useCallback(async () => {
    setEmployees([]);
    setTotalRecords(0);
    setEmptyMessage('');

    // Tạo tham số tìm kiếm dựa trên điều kiện hiện tại và gọi API lấy danh sách nhân viên.
    try {
      // Tạo tham số mặc định cho API danh sách gồm phân trang và sắp xếp.
      const params = buildEmployeeSearchParams({
        page: currentPage,
        employeeName: committedName,
        departmentId: committedGroup,
        ordEmployeeName,
        ordCertificationName,
        ordEndDate,
      });

      // Gọi API lấy danh sách nhân viên theo điều kiện hiện tại.
      const data = await getEmployees(params);

      // API trả code thành công thì cập nhật danh sách, tổng số bản ghi và thông báo rỗng nếu có.
      if (data.code === HTTP_STATUS_OK) {
        const nextEmployees = data.employees || [];
        setEmployees(nextEmployees);
        setTotalRecords(data.totalRecords || 0);
        setEmptyMessage(
          nextEmployees.length === 0 || data.message?.code === 'MSG005'
            ? '検索条件に該当するユーザが見つかりません。'
            : ''
        );
      } else {

        // API trả code lỗi thì xóa dữ liệu danh sách để tránh hiển thị dữ liệu cũ.
        setEmployees([]);
        setTotalRecords(0);
        setEmptyMessage('従業員を取得できません');
      }
    } catch {
      // Lỗi gọi API cũng xóa dữ liệu danh sách và thông báo để màn hình không dùng state cũ.
      setEmployees([]);
      setTotalRecords(0);
      setEmptyMessage('従業員を取得できません');
    }
  }, [
    // fetch lại dữ liệu khi trang, điều kiện tìm kiếm hoặc thứ tự sắp xếp thay đổi.
    currentPage,
    committedName,
    committedGroup,
    buildEmployeeSearchParams,
    ordEmployeeName,
    ordCertificationName,
    ordEndDate,
  ]);

  /**
   * Tải lại danh sách nhân viên khi điều kiện tìm kiếm, sắp xếp hoặc phân trang thay đổi.
   */
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /**
   * Tải danh sách phòng ban khi component mount để có dữ liệu hiển thị trong combobox tìm kiếm.
   */
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  /**
   * Xóa trạng thái đã khôi phục để lần mở ADM002 tiếp theo không dùng lại session cũ.
   */
  useEffect(() => {
    if (restoredListState) {
      clearEmployeeListState();
    }
  }, [restoredListState]);

  /**
   * Thực hiện tìm kiếm với giá trị đang nhập trên form.
   */
  const handleSearch = handleSubmit((values) => {
    setCommittedName(values.employeeName.trim());
    setCommittedGroup(values.departmentId);
    setCurrentPage(1);
  });

  /**
     * Đảo chiều thứ tự sắp xếp giữa tăng dần và giảm dần.
     *
     * @param value Thứ tự sắp xếp hiện tại.
     * @returns Thứ tự sắp xếp sau khi đảo chiều.
     */
  const toggleSortOrder = (value: SortOrder): SortOrder => (
    value === 'ASC' ? 'DESC' : 'ASC'
  );



  /**
   * Thay đổi thứ tự sắp xếp theo cột được chọn.
   *
   * @param field Tên trường cần sắp xếp.
   */
  const handleSort = (field: string) => {
    setCurrentSortField(field as EmployeeListSortField);

    if (field === 'employee_name') {
      setOrdEmployeeName((prev) => toggleSortOrder(prev));
    } else if (field === 'certification_name') {
      setOrdCertificationName((prev) => toggleSortOrder(prev));
    } else if (field === 'end_date') {
      setOrdEndDate((prev) => toggleSortOrder(prev));
    }

    setCurrentPage(1);
  };
  /**
     * Lấy ký hiệu sắp xếp tương ứng với cột được truyền vào.
     *
     * @param field Tên trường cần lấy ký hiệu sắp xếp.
     * @returns Ký hiệu sắp xếp của cột.
     */
  const getSortIndicator = (field: string) => {
    const defaultIndicator = '▲▽';
    const descendingIndicator = '▼△';
    // Trả về ký hiệu sắp xếp tương ứng với cột được truyền vào dựa trên thứ tự sắp xếp hiện tại của cột đó.
    if (field === 'employee_name') {
      return ordEmployeeName === 'ASC' ? defaultIndicator : descendingIndicator;
    }

    if (field === 'certification_name') {
      return ordCertificationName === 'ASC' ? defaultIndicator : descendingIndicator;
    }

    if (field === 'end_date') {
      return ordEndDate === 'ASC' ? defaultIndicator : descendingIndicator;
    }

    return '';
  };

  /**
   * Tính toán danh sách trang hiển thị trong phân trang.
   *
   * @returns Mảng chứa số trang hoặc dấu ba chấm.
   */
  const paginationPages = useMemo(() => {
    if (totalPages <= 1) {
      // Nếu chỉ có 1 trang hoặc không có trang nào, không hiển thị phân trang.
      return [];
    }
    // Nếu tổng số trang nhỏ hơn hoặc bằng 5 thì hiển thị tất cả các trang.
    const pages: (number | string)[] = [];
    // Nếu tổng số trang lớn hơn 5 thì hiển thị trang đầu, trang cuối, 2 trang xung quanh trang hiện tại và dấu ba chấm nếu cần thiết.
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      // Hiển thị dấu ba chấm nếu trang hiện tại cách trang đầu hơn 2 trang.
      if (currentPage > 3) {
        pages.push('...');
      }
      // Hiển thị 2 trang xung quanh trang hiện tại, đảm bảo không vượt quá trang đầu và trang cuối.
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      // Hiển thị dấu ba chấm nếu trang hiện tại cách trang cuối hơn 2 trang.
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      // Hiển thị trang cuối cùng.
      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  /**
   * Chuyển đến trang trước nếu không phải trang đầu tiên.
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Chuyển đến trang tiếp theo nếu không phải trang cuối cùng.
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Lưu trạng thái danh sách và điều hướng đến màn hình thêm mới nhân viên.
   */
  const handleAddNew = () => {
    saveCurrentListState();
    router.push('/employees/adm004');
  };

  /**
   * lấy ID nhân viên và điều hướng đến màn hình chi tiết nhân viên.
   *
   * @param employeeId ID nhân viên cần xem chi tiết.
   */
  const handleViewDetail = (employeeId: number) => {
    saveCurrentListState();
    router.push(`/employees/adm003?employeeId=${employeeId}`);
  };

  /**
     * Lưu trạng thái hiện tại của danh sách trước khi điều hướng sang màn hình khác.
     */
  const saveCurrentListState = () => {
    saveEmployeeListState({
      employeeName: committedName,
      departmentId: committedGroup,
      formEmployeeName: committedName,
      formDepartmentId: committedGroup,
      currentPage,
      ordEmployeeName,
      ordCertificationName,
      ordEndDate,
      currentSortField,
    });
  };
  /**
   * Trả về toàn bộ dữ liệu và handler của màn hình danh sách nhân viên.
   */
  return {
    employees,
    totalRecords,
    emptyMessage,
    departmentErrorMessage,
    register,
    currentPage,
    setCurrentPage,
    departments,
    totalPages,
    paginationPages,
    handleSearch,
    handleSort,
    getSortIndicator,
    handlePreviousPage,
    handleNextPage,
    handleAddNew,
    handleViewDetail,
  };
}
