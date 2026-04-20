'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  getEmployees,
  EmployeeDTO,
  EmployeeSearchParams,
  SortOrder,
} from '@/lib/api/employee.api';
import { getDepartments, DepartmentDTO } from '@/lib/api/department.api';

/**
 * Hook quản lý dữ liệu và trạng thái cho màn hình danh sách nhân viên.
 */
export function useEmployeeList() {
  const router = useRouter();
  type SortField = 'employee_name' | 'certification_name' | 'end_date';
  type SortState = Record<SortField, boolean>;

  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchGroup, setSearchGroup] = useState('');
  const [committedName, setCommittedName] = useState('');
  const [committedGroup, setCommittedGroup] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [ordEmployeeName, setOrdEmployeeName] = useState<SortOrder>('ASC');
  const [ordCertificationName, setOrdCertificationName] = useState<SortOrder>('ASC');
  const [ordEndDate, setOrdEndDate] = useState<SortOrder>('ASC');
  const [currentSortField, setCurrentSortField] = useState<SortField>('employee_name');
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const limit = 24;
  const totalPages = Math.ceil(totalRecords / limit);

  /**
   * Đảo chiều sắp xếp giữa tăng dần và giảm dần.
   *
   * @param value thứ tự sắp xếp hiện tại
   * @returns thứ tự sắp xếp sau khi đảo
   */
  const toggleSortOrder = (value: SortOrder): SortOrder => (
    value === 'ASC' ? 'DESC' : 'ASC'
  );

  /**
   * Sắp xếp danh sách chuỗi theo thứ tự được truyền vào.
   *
   * @param values danh sách giá trị cần sắp xếp
   * @param order thứ tự sắp xếp
   * @returns danh sách đã sắp xếp
   */
  const sortTextValues = useCallback(
    (values: Array<string | null>, order: SortOrder = 'ASC') => (
      [...values].sort((left, right) => (
        order === 'ASC'
          ? String(left ?? '').localeCompare(String(right ?? ''))
          : String(right ?? '').localeCompare(String(left ?? ''))
      ))
    ),
    []
  );

  /**
   * Sắp xếp danh sách ngày theo thứ tự được truyền vào.
   *
   * @param values danh sách ngày cần sắp xếp
   * @param order thứ tự sắp xếp
   * @returns danh sách ngày đã sắp xếp
   */
  const sortDateValues = useCallback(
    (values: Array<string | null>, order: SortOrder = 'ASC') => (
      [...values].sort((left, right) => {
        const leftTime = left ? new Date(left).getTime() : Number.NEGATIVE_INFINITY;
        const rightTime = right ? new Date(right).getTime() : Number.NEGATIVE_INFINITY;

        return order === 'ASC' ? leftTime - rightTime : rightTime - leftTime;
      })
    ),
    []
  );

  /**
   * Lấy danh sách nhân viên theo điều kiện tìm kiếm và phân trang.
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);

    try {
      const params: EmployeeSearchParams = {
        offset: currentPage * limit,
        limit,
      };

      if (committedName) {
        params.employee_name = committedName;
      }

      if (committedGroup) {
        params.department_id = Number(committedGroup);
      }

      const data = await getEmployees(params);

      if (data.code === 200) {
        setEmployees(data.employees || []);
        setTotalRecords(data.totalRecords || 0);
        setEmptyMessage(
          data.message?.code === 'MSG005'
            ? '検索条件に該当するユーザが見つかりません。'
            : ''
        );
      } else {
        setEmployees([]);
        setTotalRecords(0);
        setEmptyMessage('');
      }
    } catch {
      setEmployees([]);
      setTotalRecords(0);
      setEmptyMessage('');
    } finally {
      setLoading(false);
    }
  }, [currentPage, committedName, committedGroup]);

  /**
   * Lấy danh sách phòng ban để hiển thị ở combobox.
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
   * Tải lại danh sách nhân viên khi điều kiện tìm kiếm hoặc phân trang thay đổi.
   */
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /**
   * Tải danh sách phòng ban một lần khi màn hình được mount.
   */
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  /**
   * Thực hiện tìm kiếm với các giá trị đã nhập.
   */
  const handleSearch = () => {
    setCommittedName(searchName);
    setCommittedGroup(searchGroup);
    setCurrentPage(0);
  };

  /**
   * Thay đổi thứ tự sắp xếp theo cột được chọn.
   *
   * @param field tên trường cần sắp xếp
   */
  const handleSort = (field: string) => {
    setCurrentSortField(field as SortField);

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
   * Định dạng ngày theo dạng yyyy/MM/dd.
   *
   * @param dateStr chuỗi ngày đầu vào
   * @returns chuỗi ngày đã định dạng hoặc rỗng
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
   * Trả về icon sắp xếp tương ứng với từng cột.
   *
   * @param field tên trường cần lấy icon
   * @returns ký hiệu sắp xếp của cột
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
   * Tạo dữ liệu hiển thị riêng cho từng cột sort.
   * Cột nào không được bấm sort sẽ giữ nguyên giá trị hiện tại.
   */
  const displayEmployees = useMemo(() => {
    const compareField = (field: SortField, a: EmployeeDTO, b: EmployeeDTO): number => {
      if (field === 'employee_name') {
        const valueA = a.employeeName || '';
        const valueB = b.employeeName || '';
        return ordEmployeeName === 'ASC'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (field === 'certification_name') {
        const valueA = a.certificationName || '';
        const valueB = b.certificationName || '';
        return ordCertificationName === 'ASC'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      const valueA = a.endDate ? new Date(a.endDate).getTime() : Number.NEGATIVE_INFINITY;
      const valueB = b.endDate ? new Date(b.endDate).getTime() : Number.NEGATIVE_INFINITY;
      return ordEndDate === 'ASC' ? valueA - valueB : valueB - valueA;
    };

    const sortOrder: SortField[] = [
      currentSortField,
      ...(['employee_name', 'certification_name', 'end_date'] as SortField[])
        .filter((field) => field !== currentSortField),
    ];

    return [...employees].sort((a, b) => {
      for (const field of sortOrder) {
        const result = compareField(field, a, b);
        if (result !== 0) {
          return result;
        }
      }

      return a.employeeId - b.employeeId;
    });
  }, [
    employees,
    currentSortField,
    ordEmployeeName,
    ordCertificationName,
    ordEndDate,
  ]);

  /**
   * Tính toán mảng số trang hiển thị cho phân trang.
   *
   * @returns mảng chứa số trang hoặc dấu ...
   */
  const paginationPages = useMemo(() => {
    if (totalPages <= 1) {
      return [];
    }

    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      if (currentPage > 2) {
        pages.push('...');
      }

      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      pages.push(totalPages - 1);
    }

    return pages;
  }, [totalPages, currentPage]);

  /**
   * Chuyển đến trang trước.
   */
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Chuyển đến trang tiếp theo.
   */
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Điều hướng đến trang thêm mới nhân viên.
   */
  const handleAddNew = () => {
    router.push('/employees/edit');
  };

  /**
   * Trả về toàn bộ dữ liệu và hàm cần thiết cho component danh sách nhân viên.
   */
  return {
    employees: displayEmployees,
    totalRecords,
    emptyMessage,
    loading,
    searchName,
    setSearchName,
    searchGroup,
    setSearchGroup,
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
  };
}
