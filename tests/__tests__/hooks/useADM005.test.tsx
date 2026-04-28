import { act, renderHook, waitFor } from '@testing-library/react';
import { useADM005 } from '@/hooks/useADM005';
import { addEmployee, updateEmployee } from '@/lib/api/employee.api';
import {
  clearEmployeeAdd,
  loadEmployeeAdd,
  loadEmployeeConfirmData,
  setEmployeeAddRestore,
} from '@/lib/storage/EmployeeInputForm';

jest.mock('@/lib/api/employee.api', () => ({
  addEmployee: jest.fn(),
  updateEmployee: jest.fn(),
}));

jest.mock('@/lib/storage/EmployeeInputForm', () => ({
  clearEmployeeAdd: jest.fn(),
  loadEmployeeAdd: jest.fn(),
  loadEmployeeConfirmData: jest.fn(),
  setEmployeeAddRestore: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

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
  employeeBirthDate: '2000/01/01',
  employeeEmail: 'test@example.com',
  employeeTelephone: '0123456789',
  employeeLoginPassword: 'secret123',
  employeeLoginPasswordConfirm: 'secret123',
  certificationId: '1',
  certificationName: 'N1',
  certificationStartDate: '2020/01/01',
  certificationEndDate: '2022/01/01',
  score: '850',
};

describe('useADM005', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { useRouter } = jest.requireMock('next/navigation') as {
      useRouter: jest.Mock;
    };

    useRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    (loadEmployeeConfirmData as jest.Mock).mockReturnValue(confirmData);
    (loadEmployeeAdd as jest.Mock).mockReturnValue(addData);
    (addEmployee as jest.Mock).mockResolvedValue({ code: 200 });
    (updateEmployee as jest.Mock).mockResolvedValue({ code: 200 });
  });

  it('loads confirm data and saved employee data on mount', async () => {
    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data?.employeeLoginId).toBe('user01');
    });

    expect(setEmployeeAddRestore).not.toHaveBeenCalled();
    expect(clearEmployeeAdd).not.toHaveBeenCalled();
  });

  it('redirects back to ADM004 when confirm data is missing', async () => {
    (loadEmployeeConfirmData as jest.Mock).mockReturnValue(null);

    renderHook(() => useADM005());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/employees/adm004');
    });
  });

  it('handleBack only sets restore flag and navigates back to ADM004', async () => {
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

  it('calls add employee api and navigates to complete page in add mode', async () => {
    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleOk();
    });

    expect(addEmployee).toHaveBeenCalledWith({
      employeeId: undefined,
      employeeLoginId: 'user01',
      departmentId: '2',
      employeeName: 'Test User',
      employeeNameKana: 'TEST USER',
      employeeBirthDate: '2000/01/01',
      employeeEmail: 'test@example.com',
      employeeTelephone: '0123456789',
      employeeLoginPassword: 'secret123',
      employeeLoginPasswordConfirm: 'secret123',
      certificationId: '1',
      certificationStartDate: '2020/01/01',
      certificationEndDate: '2022/01/01',
      score: '850',
    });
    expect(clearEmployeeAdd).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/employees/adm006?mode=add');
  });

  it('calls update employee api in edit mode', async () => {
    (loadEmployeeAdd as jest.Mock).mockReturnValue({
      ...addData,
      mode: 'edit',
      employeeId: '30',
    });

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleOk();
    });

    expect(updateEmployee).toHaveBeenCalledWith('30', {
      employeeId: '30',
      employeeLoginId: 'user01',
      departmentId: '2',
      employeeName: 'Test User',
      employeeNameKana: 'TEST USER',
      employeeBirthDate: '2000/01/01',
      employeeEmail: 'test@example.com',
      employeeTelephone: '0123456789',
      employeeLoginPassword: 'secret123',
      employeeLoginPasswordConfirm: 'secret123',
      certificationId: '1',
      certificationStartDate: '2020/01/01',
      certificationEndDate: '2022/01/01',
      score: '850',
    });
    expect(mockPush).toHaveBeenCalledWith('/employees/adm006?mode=edit');
  });

  it('navigates to system error when api fails', async () => {
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
