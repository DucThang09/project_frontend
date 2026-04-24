'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getEmployees } from '@/lib/api/employee.api';
import { EMPLOYEE_LIST_PAGE_SIZE } from '@/lib/constants/employee';
import { getDepartments } from '@/lib/api/department.api';
import { clearEmployeeAdd} from '@/lib/storage/EmployeeInputForm';
import {
  clearEmployeeDetailId,
  saveEmployeeDetailId,
} from '@/lib/storage/employee-detail';
import {
  loadEmployeeListState,
  saveEmployeeListState,
  type EmployeeListSortField,
} from '@/lib/storage/employee-list';
import type { DepartmentDTO } from '@/types/department';
import type {
  Employee,
  EmployeeSearchParams,
  SortOrder,
} from '@/types/employee';

/**
 * Hook quản lý dữ liệu và trạng thái cho màn hình danh sách nhân viên.
 */
export function useEmployeeList() {
  const router = useRouter();
  const restoredListState = useMemo(() => loadEmployeeListState(), []);
  type SearchFormValues = {
    employeeName: string;
    departmentId: string;
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [committedName, setCommittedName] = useState(restoredListState?.employeeName ?? '');
  const [committedGroup, setCommittedGroup] = useState(restoredListState?.departmentId ?? '');
  const [currentPage, setCurrentPage] = useState(restoredListState?.currentPage ?? 0);
  const [ordEmployeeName, setOrdEmployeeName] = useState<SortOrder>(restoredListState?.ordEmployeeName ?? 'ASC');
  const [ordCertificationName, setOrdCertificationName] = useState<SortOrder>(restoredListState?.ordCertificationName ?? 'ASC');
  const [ordEndDate, setOrdEndDate] = useState<SortOrder>(restoredListState?.ordEndDate ?? 'ASC');
  const [currentSortField, setCurrentSortField] = useState<EmployeeListSortField>(restoredListState?.currentSortField ?? 'employee_name');
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [isListStateReady, setIsListStateReady] = useState(false);
  const limit = EMPLOYEE_LIST_PAGE_SIZE;
  const totalPages = Math.ceil(totalRecords / limit);
  const { register, handleSubmit, reset, watch, getValues } = useForm<SearchFormValues>({
    defaultValues: {
      employeeName: restoredListState?.formEmployeeName ?? restoredListState?.employeeName ?? '',
      departmentId: restoredListState?.formDepartmentId ?? restoredListState?.departmentId ?? '',
    },
  });
  const formEmployeeName = watch('employeeName');
  const formDepartmentId = watch('departmentId');

  useEffect(() => {
    if (!restoredListState) {
      setIsListStateReady(true);
      return;
    }

    reset({
      employeeName: restoredListState.formEmployeeName ?? restoredListState.employeeName,
      departmentId: restoredListState.formDepartmentId ?? restoredListState.departmentId,
    });
    setIsListStateReady(true);
  }, [reset, restoredListState]);

  useEffect(() => {
    if (!restoredListState || departments.length === 0) {
      return;
    }

    reset({
      employeeName: restoredListState.formEmployeeName ?? restoredListState.employeeName,
      departmentId: restoredListState.formDepartmentId ?? restoredListState.departmentId,
    });
  }, [departments, reset, restoredListState]);

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
   * Lấy danh sách nhân viên theo điều kiện tìm kiếm và phân trang.
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);

    try {
      const params: EmployeeSearchParams = {
        offset: currentPage * limit,
        limit,
        ord_employee_name: ordEmployeeName,
        ord_certification_name: ordCertificationName,
        ord_end_date: ordEndDate,
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
  }, [
    currentPage,
    committedName,
    committedGroup,
    limit,
    ordEmployeeName,
    ordCertificationName,
    ordEndDate,
  ]);

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
  const handleSearch = handleSubmit((values) => {
    setCommittedName(values.employeeName.trim());
    setCommittedGroup(values.departmentId);
    setCurrentPage(0);
  });

  /**
   * Thay đổi thứ tự sắp xếp theo cột được chọn.
   *
   * @param field tên trường cần sắp xếp
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
    saveEmployeeListState({
      employeeName: committedName,
      departmentId: committedGroup,
      formEmployeeName: getValues('employeeName'),
      formDepartmentId: getValues('departmentId'),
      currentPage,
      ordEmployeeName,
      ordCertificationName,
      ordEndDate,
      currentSortField,
    });
    clearEmployeeAdd();
    clearEmployeeDetailId();
    router.push('/employees/adm004');
  };

  /**
   * Chuyen sang man hinh chi tiet nhan vien ma khong de ID tren URL.
   *
   * @param employeeId ID nhan vien can xem chi tiet
   */
  const handleViewDetail = (employeeId: number) => {
    saveEmployeeDetailId(employeeId);
    router.push('/employees/adm003');
  };

  useEffect(() => {
    if (!isListStateReady) {
      return;
    }

    saveEmployeeListState({
      employeeName: committedName,
      departmentId: committedGroup,
      formEmployeeName,
      formDepartmentId,
      currentPage,
      ordEmployeeName,
      ordCertificationName,
      ordEndDate,
      currentSortField,
    });
  }, [
    committedName,
    committedGroup,
    currentPage,
    ordEmployeeName,
    ordCertificationName,
    ordEndDate,
    currentSortField,
    formEmployeeName,
    formDepartmentId,
    isListStateReady,
  ]);

  /**
   * Trả về toàn bộ dữ liệu và hàm cần thiết cho component danh sách nhân viên.
   */
  return {
    employees,
    totalRecords,
    emptyMessage,
    loading,
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
