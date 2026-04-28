'use client';
//Comment đầu file
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getEmployees } from '@/lib/api/employee.api';
import { EMPLOYEE_LIST_PAGE_SIZE } from '@/lib/constants/employee';
import { getDepartments } from '@/lib/api/department.api';
import { clearEmployeeAdd } from '@/lib/storage/EmployeeInputForm';
import {
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
  const restoredListState = useMemo(() => loadEmployeeListState(), []);
  type SearchFormValues = {
    employeeName: string;
    departmentId: string;
  };
  //Comment
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [committedName, setCommittedName] = useState(restoredListState?.employeeName ?? '');
  const [committedGroup, setCommittedGroup] = useState(restoredListState?.departmentId ?? '');
  const [currentSortField, setCurrentSortField] = useState<EmployeeListSortField>(restoredListState?.currentSortField ?? 'employee_name');
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);

  //Khởi tạo điều kiện search ban đầu
  const { register, handleSubmit, reset } = useForm<SearchFormValues>({
    defaultValues: {
      employeeName: restoredListState?.employeeName ?? '',
      departmentId: restoredListState?.departmentId ?? '',
    },
  });
  //Comment
  const [currentPage, setCurrentPage] = useState(restoredListState?.currentPage ?? 0);
  const [ordEmployeeName, setOrdEmployeeName] = useState<SortOrder>(restoredListState?.ordEmployeeName ?? 'ASC');
  const [ordCertificationName, setOrdCertificationName] = useState<SortOrder>(restoredListState?.ordCertificationName ?? 'ASC');
  const [ordEndDate, setOrdEndDate] = useState<SortOrder>(restoredListState?.ordEndDate ?? 'ASC');
  const limit = EMPLOYEE_LIST_PAGE_SIZE;
  const totalPages = Math.ceil(totalRecords / limit);

  /**
   * Lấy danh sách phòng ban để hiển thị trong combobox tìm kiếm.
   *
   * @returns hoàn thành sau khi cập nhật state danh sách phòng ban.
   */
  const fetchDepartments = useCallback(async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      setDepartments([]);
    }
  }, []);

  /**
   * Lấy danh sách nhân viên theo điều kiện tìm kiếm, sắp xếp và phân trang.
   *
   * @returns  hoàn thành sau khi cập nhật state danh sách nhân viên.
   */
  const fetchEmployees = useCallback(async () => {
    try {
      // Tạo tham số mặc định cho API danh sách gồm phân trang và sắp xếp.
      const params: EmployeeSearchParams = {
        offset: currentPage * limit,
        limit,
        ord_employee_name: ordEmployeeName,
        ord_certification_name: ordCertificationName,
        ord_end_date: ordEndDate,
      };

      // Chỉ gửi tên nhân viên lên API khi người dùng đã nhập và submit điều kiện này.
      if (committedName) {
        params.employee_name = committedName;
      }

      // Chỉ gửi phòng ban lên API khi người dùng đã chọn và submit điều kiện này.
      if (committedGroup) {
        params.department_id = Number(committedGroup);
      }

      // Gọi API lấy danh sách nhân viên theo điều kiện hiện tại.
      const data = await getEmployees(params);

      // API trả code 200 thì cập nhật danh sách, tổng số bản ghi và thông báo rỗng nếu có.
      if (data.code === 200) {
        setEmployees(data.employees || []);
        setTotalRecords(data.totalRecords || 0);
        setEmptyMessage(
          data.message?.code === 'MSG005'
            ? '検索条件に該当するユーザが見つかりません。'
            : ''
        );
      } else {
        // API trả code khác 200 thì xóa dữ liệu danh sách để tránh hiển thị dữ liệu cũ.
        setEmployees([]);
        setTotalRecords(0);
        setEmptyMessage('');
      }
    } catch {
      // Lỗi gọi API cũng xóa dữ liệu danh sách và thông báo để màn hình không dùng state cũ.
      setEmployees([]);
      setTotalRecords(0);
      setEmptyMessage('');
    }
  }, [
    // fetch lại dữ liệu khi trang, điều kiện tìm kiếm hoặc thứ tự sắp xếp thay đổi.
    currentPage,
    committedName,
    committedGroup,
    limit,
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
   * Tải danh sách phòng ban khi màn hình được mount.
   */
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  /**
   * Thực hiện tìm kiếm với giá trị đang nhập trên form.
   */
  const handleSearch = handleSubmit((values) => {
    setCommittedName(values.employeeName.trim());
    setCommittedGroup(values.departmentId);
    setCurrentPage(0);
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

    setCurrentPage(0);
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
      return [];
    }
    // Nếu tổng số trang nhỏ hơn hoặc bằng 5 thì hiển thị tất cả các trang.
    const pages: (number | string)[] = [];
    // Nếu tổng số trang lớn hơn 5 thì hiển thị trang đầu, trang cuối, 2 trang xung quanh trang hiện tại và dấu ba chấm nếu cần thiết.
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      // Hiển thị dấu ba chấm nếu trang hiện tại cách trang đầu hơn 2 trang.
      if (currentPage > 2) {
        pages.push('...');
      }
      // Hiển thị 2 trang xung quanh trang hiện tại, đảm bảo không vượt quá trang đầu và trang cuối.
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      // Hiển thị dấu ba chấm nếu trang hiện tại cách trang cuối hơn 2 trang.
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      // Hiển thị trang cuối cùng.
      pages.push(totalPages - 1);
    }
    
    return pages;
  }, [totalPages, currentPage]);

  /**
   * Chuyển đến trang trước nếu không phải trang đầu tiên.
   */
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Chuyển đến trang tiếp theo nếu không phải trang cuối cùng.
   */
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Định dạng ngày theo dạng yyyy/MM/dd.
   *
   * @param dateStr Chuỗi ngày đầu vào.
   * @returns Chuỗi ngày đã định dạng hoặc chuỗi rỗng.
   */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) {
      return '';
    }

    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}/${m}/${d}`;
  };

  /**
   * Lưu trạng thái danh sách và điều hướng đến màn hình thêm mới nhân viên.
   */
  const handleAddNew = () => {
    saveCurrentListState();
    clearEmployeeAdd();
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
   * lấy điều kiện tìm kiếm từ storage khi quay lại ADM002.
   */
  useEffect(() => {
    // nếu không có dữ liệu danh sách đã lưu trong session thì return.
    if (!restoredListState) {
      return;
    }
    //đưa lại giá trị tìm kiếm đã lưu vào form
    reset({
      employeeName: restoredListState.employeeName,
      departmentId: restoredListState.departmentId,
    });
  }, [departments, reset, restoredListState]);

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
    register,
    currentPage,
    setCurrentPage,
    departments,
    totalPages,
    paginationPages,
    handleSearch,
    handleSort,
    getSortIndicator,
    formatDate,
    handlePreviousPage,
    handleNextPage,
    handleAddNew,
    handleViewDetail,
  };
}
