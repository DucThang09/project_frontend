import { act, renderHook, waitFor } from '@testing-library/react';
import { useEmployeeList } from '@/hooks/useADM002';
import { getEmployees } from '@/lib/api/employee.api';
import { getDepartments } from '@/lib/api/department.api';
import {
  EMPLOYEE_LIST_PAGE_SIZE,
  HTTP_STATUS_OK,
} from '@/lib/constants/employee';
import {
  clearEmployeeListState,
  loadEmployeeListState,
  saveEmployeeListState,
} from '@/lib/storage/employeeList';

jest.mock('@/lib/api/employee.api');
jest.mock('@/lib/api/department.api');
jest.mock('@/lib/storage/employeeList');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

async function changeRegisteredField(
  field: ReturnType<ReturnType<typeof useEmployeeList>['register']>,
  name: string,
  value: string
) {
  await field.onChange({
    target: { name, value },
    type: 'change',
  });
}

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

    (loadEmployeeListState as jest.Mock).mockReturnValue(null);
  });

  it('initializes search conditions and loads employees on mount', async () => {
    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() =>
      expect(getEmployees).toHaveBeenCalledWith({
        offset: 0,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        ord_employee_name: 'ASC',
        ord_certification_name: 'ASC',
        ord_end_date: 'ASC',
      })
    );

    expect(result.current.currentPage).toBe(1);
    await waitFor(() =>
      expect(result.current.departments).toEqual([
        { departmentId: 2, departmentName: 'Development' },
      ])
    );
    expect(saveEmployeeListState).not.toHaveBeenCalled();
    expect(clearEmployeeListState).not.toHaveBeenCalled();
  });

  it('restores saved search, page, and sort state once on mount', async () => {
    (loadEmployeeListState as jest.Mock).mockReturnValue({
      employeeName: 'Alice',
      departmentId: '2',
      formEmployeeName: 'Alice',
      formDepartmentId: '2',
      currentPage: 3,
      ordEmployeeName: 'DESC',
      ordCertificationName: 'ASC',
      ordEndDate: 'DESC',
      currentSortField: 'end_date',
    });

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() =>
      expect(getEmployees).toHaveBeenCalledWith({
        offset: EMPLOYEE_LIST_PAGE_SIZE * 2,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        employee_name: 'Alice',
        department_id: 2,
        ord_employee_name: 'DESC',
        ord_certification_name: 'ASC',
        ord_end_date: 'DESC',
      })
    );

    expect(result.current.currentPage).toBe(3);
    expect(clearEmployeeListState).toHaveBeenCalledTimes(1);
  });

  it('saves current list state before navigating to add page', async () => {
    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalled());

    act(() => {
      result.current.handleAddNew();
    });

    expect(saveEmployeeListState).toHaveBeenLastCalledWith({
      employeeName: '',
      departmentId: '',
      formEmployeeName: '',
      formDepartmentId: '',
      currentPage: 1,
      ordEmployeeName: 'ASC',
      ordCertificationName: 'ASC',
      ordEndDate: 'ASC',
      currentSortField: 'employee_name',
    });
    expect(mockPush).toHaveBeenCalledWith('/employees/adm004');
  });

  it('navigates to detail page with employee id', async () => {
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
      currentPage: 1,
      ordEmployeeName: 'ASC',
      ordCertificationName: 'ASC',
      ordEndDate: 'ASC',
      currentSortField: 'employee_name',
    });
    expect(mockPush).toHaveBeenCalledWith('/employees/adm003?employeeId=30');
  });

  it('sends updated sort params to API when sorting by employee name', async () => {
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

    expect(result.current.currentPage).toBe(1);
  });

  it('sends updated sort params to API when sorting by certification name', async () => {
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

  it('shows department error message when department API fails', async () => {
    (getDepartments as jest.Mock).mockRejectedValue(new Error('department error'));

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() =>
      expect(result.current.departmentErrorMessage).toBe('部門を取得できません')
    );
    expect(result.current.departments).toEqual([]);
  });

  it('shows employee error message when employee API returns error code', async () => {
    (getEmployees as jest.Mock).mockResolvedValue({
      code: 500,
      totalRecords: 0,
      employees: [],
    });

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() =>
      expect(result.current.emptyMessage).toBe('従業員を取得できません')
    );
    expect(result.current.employees).toEqual([]);
  });

  it('binds employee list in the same order as API response', async () => {
    const responseEmployees = [
      {
        employeeId: 2,
        employeeName: 'Second',
        employeeBirthDate: null,
        departmentName: 'Development',
        employeeEmail: 'second@example.com',
        employeeTelephone: null,
        certificationName: null,
        endDate: null,
        score: null,
      },
      {
        employeeId: 1,
        employeeName: 'First',
        employeeBirthDate: null,
        departmentName: 'Sales',
        employeeEmail: 'first@example.com',
        employeeTelephone: null,
        certificationName: null,
        endDate: null,
        score: null,
      },
    ];

    (getEmployees as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
      totalRecords: 2,
      employees: responseEmployees,
    });

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(result.current.employees).toEqual(responseEmployees));
    expect(result.current.emptyMessage).toBe('');
  });

  it('shows MSG005 and hides pagination when employee response list is empty', async () => {
    (getEmployees as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
      totalRecords: 0,
      employees: [],
    });

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() =>
      expect(result.current.emptyMessage).toBe('検索条件に該当するユーザが見つかりません。')
    );
    expect(result.current.employees).toEqual([]);
    expect(result.current.paginationPages).toEqual([]);
  });

  it('hides pagination when total record count is less than or equal to page size', async () => {
    (getEmployees as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
      totalRecords: EMPLOYEE_LIST_PAGE_SIZE,
      employees: [
        {
          employeeId: 1,
          employeeName: 'First',
          employeeBirthDate: null,
          departmentName: 'Sales',
          employeeEmail: 'first@example.com',
          employeeTelephone: null,
          certificationName: null,
          endDate: null,
          score: null,
        },
      ],
    });

    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(result.current.totalRecords).toBe(EMPLOYEE_LIST_PAGE_SIZE));
    expect(result.current.paginationPages).toEqual([]);
  });

  it('searches with fullname and department, then resets page to first page', async () => {
    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));

    await act(async () => {
      await changeRegisteredField(
        result.current.register('employeeName'),
        'employeeName',
        ' Alice '
      );
      await changeRegisteredField(
        result.current.register('departmentId'),
        'departmentId',
        '2'
      );
      await result.current.handleSearch({
        preventDefault: jest.fn(),
        persist: jest.fn(),
      } as never);
    });

    await waitFor(() =>
      expect(getEmployees).toHaveBeenLastCalledWith({
        offset: 0,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        employee_name: 'Alice',
        department_id: 2,
        ord_employee_name: 'ASC',
        ord_certification_name: 'ASC',
        ord_end_date: 'ASC',
      })
    );
    expect(result.current.currentPage).toBe(1);
  });

  it('searches without empty fullname and department params', async () => {
    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));

    await act(async () => {
      await changeRegisteredField(
        result.current.register('employeeName'),
        'employeeName',
        '   '
      );
      await changeRegisteredField(
        result.current.register('departmentId'),
        'departmentId',
        ''
      );
      await result.current.handleSearch({
        preventDefault: jest.fn(),
        persist: jest.fn(),
      } as never);
    });

    await waitFor(() =>
      expect(getEmployees).toHaveBeenLastCalledWith({
        offset: 0,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        ord_employee_name: 'ASC',
        ord_certification_name: 'ASC',
        ord_end_date: 'ASC',
      })
    );
  });

  it('keeps current sort conditions when searching', async () => {
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

    await act(async () => {
      await result.current.handleSearch({
        preventDefault: jest.fn(),
        persist: jest.fn(),
      } as never);
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
  });

  it('resets page 2 to page 1 when searching', async () => {
    const { result } = renderHook(() => useEmployeeList());

    await waitFor(() => expect(getEmployees).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.setCurrentPage(2);
    });

    await waitFor(() =>
      expect(getEmployees).toHaveBeenLastCalledWith({
        offset: EMPLOYEE_LIST_PAGE_SIZE,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        ord_employee_name: 'ASC',
        ord_certification_name: 'ASC',
        ord_end_date: 'ASC',
      })
    );

    await act(async () => {
      await result.current.handleSearch({
        preventDefault: jest.fn(),
        persist: jest.fn(),
      } as never);
    });

    await waitFor(() =>
      expect(getEmployees).toHaveBeenLastCalledWith({
        offset: 0,
        limit: EMPLOYEE_LIST_PAGE_SIZE,
        ord_employee_name: 'ASC',
        ord_certification_name: 'ASC',
        ord_end_date: 'ASC',
      })
    );
    expect(result.current.currentPage).toBe(1);
  });
});
