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
  const [activeSortField, setActiveSortField] = useState<SortField | null>(null);
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const limit = 20;
  const totalPages = Math.ceil(totalRecords / limit);

  const toggleSortOrder = (value: SortOrder): SortOrder => (
    value === 'ASC' ? 'DESC' : 'ASC'
  );

  const fetchEmployees = useCallback(async () => {
    setLoading(true);

    try {
      // Luôn gửi phân trang, còn điều kiện search/sort chỉ gửi khi có giá trị.
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

      if (activeSortField === 'employee_name') {
        params.ord_employee_name = ordEmployeeName;
      } else if (activeSortField === 'certification_name') {
        params.ord_certification_name = ordCertificationName;
      } else if (activeSortField === 'end_date') {
        params.ord_end_date = ordEndDate;
      }

      const data = await getEmployees(params);

      // Backend trả code khác 200 thì xem như không có dữ liệu để hiển thị.
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
  }, [
    currentPage,
    activeSortField,
    ordEmployeeName,
    ordCertificationName,
    ordEndDate,
    committedName,
    committedGroup,
  ]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch {
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  /**
   * Thực hiện tìm kiếm với các giá trị đã nhập.
   */
  const handleSearch = () => {
    // Chỉ commit giá trị khi người dùng bấm nút search.
    setCommittedName(searchName);
    setCommittedGroup(searchGroup);
    setCurrentPage(0);
  };

  /**
   * Thay đổi thứ tự sắp xếp theo cột được chọn.
   *
   * @param field Tên trường cần sắp xếp.
   */
  const handleSort = (field: string) => {
    // Bấm lại cùng một cột thì đổi ASC/DESC, bấm cột khác thì chuyển cột đang sort.
    if (field === 'employee_name') {
      if (activeSortField === 'employee_name') {
        setOrdEmployeeName((prev) => toggleSortOrder(prev));
      } else {
        setActiveSortField('employee_name');
      }
    } else if (field === 'certification_name') {
      if (activeSortField === 'certification_name') {
        setOrdCertificationName((prev) => toggleSortOrder(prev));
      } else {
        setActiveSortField('certification_name');
      }
    } else if (field === 'end_date') {
      if (activeSortField === 'end_date') {
        setOrdEndDate((prev) => toggleSortOrder(prev));
      } else {
        setActiveSortField('end_date');
      }
    }

    setCurrentPage(0);
  };

  /**
   * Định dạng ngày theo dạng yyyy/MM/dd.
   *
   * @param dateStr Chuỗi ngày đầu vào.
   * @returns Chuỗi ngày đã định dạng hoặc chuỗi rỗng nếu không có dữ liệu.
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

  const stableSortIndicator = (field: string) => {
    const defaultIndicator = '▲▽';
    const descendingIndicator = '▼△';

    if (activeSortField === null) {
      if (
        field === 'employee_name' ||
        field === 'certification_name' ||
        field === 'end_date'
      ) {
        return defaultIndicator;
      }

      return '';
    }

    if (field === 'employee_name') {
      if (activeSortField !== 'employee_name') {
        return defaultIndicator;
      }

      return ordEmployeeName === 'ASC' ? defaultIndicator : descendingIndicator;
    }

    if (field === 'certification_name') {
      if (activeSortField !== 'certification_name') {
        return defaultIndicator;
      }

      return ordCertificationName === 'ASC' ? defaultIndicator : descendingIndicator;
    }

    if (field === 'end_date') {
      if (activeSortField !== 'end_date') {
        return defaultIndicator;
      }

      return ordEndDate === 'ASC' ? defaultIndicator : descendingIndicator;
    }

    return '';
  };

  /**
   * Tính toán mảng số trang hiển thị cho phân trang.
   *
   * @returns Mảng chứa số trang hoặc dấu '...' cho ellipsis.
   */
  const paginationPages = useMemo(() => {
    if (totalPages <= 1) {
      return [];
    }

    // Rút gọn dãy phân trang khi số trang quá nhiều.
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
    employees,
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
    getSortIndicator: stableSortIndicator,
    formatDate,
    handlePreviousPage,
    handleNextPage,
    handleAddNew,
  };
}
