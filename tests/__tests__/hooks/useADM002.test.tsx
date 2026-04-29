import { act, renderHook, waitFor } from '@testing-library/react';
import { useEmployeeList } from '@/hooks/useADM002';
import { getEmployees } from '@/lib/api/employee.api';
import { getDepartments } from '@/lib/api/department.api';
import {
  EMPLOYEE_LIST_PAGE_SIZE,
  HTTP_STATUS_OK,
} from '@/lib/constants/employee';
import {
  loadEmployeeListState,
  saveEmployeeListState,
} from '@/lib/storage/employeeList';
import { clearEmployeeAdd } from '@/lib/storage/EmployeeInputForm';

jest.mock('@/lib/api/employee.api');
jest.mock('@/lib/api/department.api');
jest.mock('@/lib/storage/employeeList');
jest.mock('@/lib/storage/EmployeeInputForm', () => ({
  clearEmployeeAdd: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

const restoredListState = {
  employeeName: 'Alice',
  departmentId: '2',
  formEmployeeName: 'Alice',
  formDepartmentId: '2',
  currentPage: 1,
  ordEmployeeName: 'DESC' as const,
  ordCertificationName: 'ASC' as const,
  ordEndDate: 'ASC' as const,
  currentSortField: 'employee_name' as const,
};

describe('useEmployeeList', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { useRouter } = jest.requireMock('next/navigation') as {
      useRouter: jest.Mock;
    };

    useRouter.mockReturnValue({
      push: mockPush,
    });

    (getDepartments as jest.Mock).mockResolvedValue([
      { departmentId: 2, departmentName: 'Development' },
    ]);

    (getEmployees as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
      totalRecords: 40,
      employees: [],
    });
  });

  it('restores search and page state from storage on mount', async () => {
    (loadEmployeeListState as jest.Mock).mockReturnValue(restoredListState);

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() =>
      expect(getEmployees).toHaveBeenCalledWith({
        offset: EMPLOYEE_LIST_PAGE_SIZE,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        employee_name: 'Alice',
        department_id: 2,
        ord_employee_name: 'DESC',
        ord_certification_name: 'ASC',
        ord_end_date: 'ASC',
      })
    );

    expect(result.current.currentPage).toBe(1);
    expect(saveEmployeeListState).not.toHaveBeenCalled();
  });

  it('saves restored list state before navigating to add page', async () => {
    (loadEmployeeListState as jest.Mock).mockReturnValue(restoredListState);

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalled());

    act(() => {
      result.current.handleAddNew();
    });

    expect(saveEmployeeListState).toHaveBeenLastCalledWith(restoredListState);
    expect(clearEmployeeAdd).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/employees/adm004');
  });

  it('navigates to detail page with employee id', async () => {
    (loadEmployeeListState as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalled());

    act(() => {
      result.current.handleViewDetail(30);
    });

    expect(saveEmployeeListState).toHaveBeenCalledWith({
      employeeName: '',
      departmentId: '',
      formEmployeeName: '',
      formDepartmentId: '',
      currentPage: 0,
      ordEmployeeName: 'ASC',
      ordCertificationName: 'ASC',
      ordEndDate: 'ASC',
      currentSortField: 'employee_name',
    });
    expect(mockPush).toHaveBeenCalledWith('/employees/adm003?employeeId=30');
  });

  it('sends updated sort params to API when sorting by employee name', async () => {
    (loadEmployeeListState as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.handleSort('employee_name');
    });

    await waitFor(() =>
      expect(getEmployees).toHaveBeenLastCalledWith({
        offset: 0,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        ord_employee_name: 'DESC',
        ord_certification_name: 'ASC',
        ord_end_date: 'ASC',
      })
    );

    expect(result.current.currentPage).toBe(0);
  });

  it('sends updated sort params to API when sorting by certification name', async () => {
    (loadEmployeeListState as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.handleSort('certification_name');
    });

    await waitFor(() =>
      expect(getEmployees).toHaveBeenLastCalledWith({
        offset: 0,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        ord_employee_name: 'ASC',
        ord_certification_name: 'DESC',
        ord_end_date: 'ASC',
      })
    );
  });

  it('sends updated sort params to API when sorting by end date', async () => {
    (loadEmployeeListState as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.handleSort('end_date');
    });

    await waitFor(() =>
      expect(getEmployees).toHaveBeenLastCalledWith({
        offset: 0,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        ord_employee_name: 'ASC',
        ord_certification_name: 'ASC',
        ord_end_date: 'DESC',
      })
    );
  });
});
