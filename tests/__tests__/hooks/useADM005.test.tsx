import { act, renderHook, waitFor } from '@testing-library/react';
import { useADM005 } from '@/hooks/useADM005';
import {
  addEmployee,
  getEmployeeDetail,
  updateEmployee,
} from '@/lib/api/employee.api';
import { HTTP_STATUS_OK } from '@/lib/constants/employee';
import {
  clearEmployeeAdd,
  loadEmployeeAdd,
  setEmployeeAddRestore,
  toEmployeeConfirmData,
} from '@/lib/storage/EmployeeInputForm';

jest.mock('@/lib/api/employee.api', () => ({
  addEmployee: jest.fn(),
  getEmployeeDetail: jest.fn(),
  updateEmployee: jest.fn(),
}));

jest.mock('@/lib/storage/EmployeeInputForm', () => ({
  clearEmployeeAdd: jest.fn(),
  loadEmployeeAdd: jest.fn(),
  setEmployeeAddRestore: jest.fn(),
  toEmployeeConfirmData: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSearchParamsGet = jest.fn();

const confirmData = {
  employeeLoginId: 'user01',
  departmentName: 'Development',
  employeeName: 'Test User',
  employeeNameKana: 'TEST USER',
  employeeBirthDate: '2000/01/01',
  employeeEmail: 'test@example.com',
  employeeTelephone: '0123456789',
  certificationName: 'N1',
  certificationStartDate: '2020/01/01',
  certificationEndDate: '2022/01/01',
  score: '850',
};

const addData = {
  mode: 'add' as const,
  employeeId: '',
  employeeLoginId: 'user01',
  departmentId: '2',
  departmentName: 'Development',
  employeeName: 'Test User',
  employeeNameKana: 'TEST USER',
  employeeBirthDate: '2000-01-01',
  employeeEmail: 'test@example.com',
  employeeTelephone: '0123456789',
  employeeLoginPassword: 'secret123',
  employeeLoginPasswordConfirm: 'secret123',
  certificationId: '1',
  certificationName: 'N1',
  certificationStartDate: '2020-01-01',
  certificationEndDate: '2022-01-01',
  score: '850',
};

const editData = {
  ...addData,
  mode: 'edit' as const,
  employeeId: '30',
};

const expectedPayload = {
  employeeId: undefined,
  employeeLoginId: 'user01',
  departmentId: '2',
  employeeName: 'Test User',
  employeeNameKana: 'TEST USER',
  employeeBirthDate: '2000-01-01',
  employeeEmail: 'test@example.com',
  employeeTelephone: '0123456789',
  employeeLoginPassword: 'secret123',
  employeeLoginPasswordConfirm: 'secret123',
  certificationId: '1',
  certificationStartDate: '2020-01-01',
  certificationEndDate: '2022-01-01',
  score: '850',
};

describe('useADM005', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { useRouter, useSearchParams } = jest.requireMock(
      'next/navigation'
    ) as {
      useRouter: jest.Mock;
      useSearchParams: jest.Mock;
    };

    useRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
    useSearchParams.mockReturnValue({
      get: mockSearchParamsGet,
    });

    mockSearchParamsGet.mockReturnValue(null);
    (loadEmployeeAdd as jest.Mock).mockReturnValue(addData);
    (toEmployeeConfirmData as jest.Mock).mockReturnValue(confirmData);
    (addEmployee as jest.Mock).mockResolvedValue({ code: HTTP_STATUS_OK });
    (updateEmployee as jest.Mock).mockResolvedValue({ code: HTTP_STATUS_OK });
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
      employee: { employeeId: 30 },
    });
  });

  it('loads confirm data and saved employee data on add route', async () => {
    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data?.employeeLoginId).toBe('user01');
    });

    expect(getEmployeeDetail).not.toHaveBeenCalled();
    expect(setEmployeeAddRestore).not.toHaveBeenCalled();
    expect(clearEmployeeAdd).not.toHaveBeenCalled();
  });

  it('does not bind confirm data on add route when employee data is missing', async () => {
    (loadEmployeeAdd as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(loadEmployeeAdd).toHaveBeenCalled();
    });

    expect(result.current.data).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('checks employee detail but does not bind confirm data on edit route when employee data is missing', async () => {
    mockSearchParamsGet.mockReturnValue('30');
    (loadEmployeeAdd as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(getEmployeeDetail).toHaveBeenCalledWith('30');
    });

    expect(result.current.data).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('checks employee detail with router employeeId in edit mode', async () => {
    mockSearchParamsGet.mockReturnValue('abc');

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(getEmployeeDetail).toHaveBeenCalledWith('abc');
      expect(result.current.data?.employeeLoginId).toBe('user01');
    });
  });

  it('loads edit route after checking employee detail exists', async () => {
    mockSearchParamsGet.mockReturnValue('30');
    (loadEmployeeAdd as jest.Mock).mockReturnValue(editData);

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(getEmployeeDetail).toHaveBeenCalledWith('30');
      expect(result.current.data?.employeeLoginId).toBe('user01');
    });
  });

  it('redirects to system error when edit detail api returns no employee', async () => {
    mockSearchParamsGet.mockReturnValue('30');
    (loadEmployeeAdd as jest.Mock).mockReturnValue(editData);
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
      employee: null,
    });

    renderHook(() => useADM005());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });
  });

  it('redirects to system error when edit detail api fails', async () => {
    mockSearchParamsGet.mockReturnValue('30');
    (loadEmployeeAdd as jest.Mock).mockReturnValue(editData);
    (getEmployeeDetail as jest.Mock).mockRejectedValue(new Error('failed'));

    renderHook(() => useADM005());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });
  });

  it('binds confirm data after employee detail succeeds even when session mode does not match', async () => {
    mockSearchParamsGet.mockReturnValue('30');

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(getEmployeeDetail).toHaveBeenCalledWith('30');
      expect(result.current.data?.employeeLoginId).toBe('user01');
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('binds confirm data in add mode from saved session data', async () => {
    (loadEmployeeAdd as jest.Mock).mockReturnValue(editData);

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data?.employeeLoginId).toBe('user01');
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handleBack sets restore flag and navigates back to ADM004 add route', async () => {
    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    act(() => {
      result.current.handleBack();
    });

    expect(setEmployeeAddRestore).toHaveBeenCalledTimes(1);
    expect(clearEmployeeAdd).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/employees/adm004');
  });

  it('handleBack sets restore flag and navigates back to ADM004 edit route', async () => {
    mockSearchParamsGet.mockReturnValue('30');
    (loadEmployeeAdd as jest.Mock).mockReturnValue(editData);

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    act(() => {
      result.current.handleBack();
    });

    expect(setEmployeeAddRestore).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/employees/adm004?employeeId=30');
  });

  it('calls add employee api and navigates to complete page in add mode', async () => {
    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleOk();
    });

    expect(addEmployee).toHaveBeenCalledWith(expectedPayload);
    expect(updateEmployee).not.toHaveBeenCalled();
    expect(clearEmployeeAdd).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/employees/adm006?mode=add');
  });

  it('calls update employee api in edit mode from router id', async () => {
    mockSearchParamsGet.mockReturnValue('30');
    (loadEmployeeAdd as jest.Mock).mockReturnValue(editData);

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleOk();
    });

    expect(updateEmployee).toHaveBeenCalledWith('30', {
      ...expectedPayload,
      employeeId: '30',
    });
    expect(addEmployee).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/employees/adm006?mode=edit');
  });

  it('navigates to system error when submit api fails', async () => {
    (addEmployee as jest.Mock).mockRejectedValue(new Error('system error'));

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleOk();
    });

    expect(clearEmployeeAdd).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
  });
});
