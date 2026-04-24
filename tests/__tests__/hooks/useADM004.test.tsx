import { act, renderHook, waitFor } from '@testing-library/react';
import { createEmployeeEmpty, useADM004 } from '@/hooks/useADM004';
import { getCertifications } from '@/lib/api/certification.api';
import { getDepartments } from '@/lib/api/department.api';
import { getEmployeeDetail, validateEmployeeInput } from '@/lib/api/employee.api';
import {
  clearEmployeeAddRestore,
  loadEmployeeAdd,
  RestoreEmployeeAdd,
  saveEmployeeAdd,
  saveEmployeeConfirmData,
  toEmployeeFormValues,
} from '@/lib/storage/EmployeeInputForm';
import { loadEmployeeDetailId } from '@/lib/storage/employee-detail';

jest.mock('@/lib/api/department.api');
jest.mock('@/lib/api/certification.api');
jest.mock('@/lib/api/employee.api');
jest.mock('@/lib/storage/employee-detail', () => ({
  loadEmployeeDetailId: jest.fn().mockReturnValue(null),
}));
jest.mock('@/lib/storage/EmployeeInputForm', () => {
  const actual = jest.requireActual('@/lib/storage/EmployeeInputForm');
  return {
    ...actual,
    clearEmployeeAddRestore: jest.fn(),
    loadEmployeeAdd: jest.fn(),
    RestoreEmployeeAdd: jest.fn(),
    saveEmployeeAdd: jest.fn(),
    saveEmployeeConfirmData: jest.fn(),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();

describe('useADM004', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { useRouter, useSearchParams } = jest.requireMock('next/navigation') as {
      useRouter: jest.Mock;
      useSearchParams: jest.Mock;
    };

    useRouter.mockReturnValue({
      push: mockPush,
    });

    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    (getDepartments as jest.Mock).mockResolvedValue([]);
    (getCertifications as jest.Mock).mockResolvedValue([]);
    (validateEmployeeInput as jest.Mock).mockResolvedValue({ code: 200 });
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: 200,
      employee: {
        employeeId: 1,
        employeeLoginId: 'user01',
        departmentId: 2,
        departmentName: 'Development',
        employeeName: 'Test User',
        employeeNameKana: 'ﾃｽﾄ',
        employeeBirthDate: '2000-01-01',
        employeeEmail: 'test@example.com',
        employeeTelephone: '0123456789',
        certificationId: 1,
        certificationName: 'N1',
        certificationStartDate: '2020-01-01',
        certificationEndDate: '2022-01-01',
        score: 850,
      },
    });
    (RestoreEmployeeAdd as jest.Mock).mockReturnValue(false);
    (loadEmployeeAdd as jest.Mock).mockReturnValue(null);
    (loadEmployeeDetailId as jest.Mock).mockReturnValue(null);
  });

  it('restores saved add form data when returning from confirm', async () => {
    const savedData = {
      employeeLoginId: 'user01',
      departmentId: '2',
      employeeName: 'Test User',
      employeeNameKana: 'ﾃｽﾄ',
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

    (RestoreEmployeeAdd as jest.Mock).mockReturnValue(true);
    (loadEmployeeAdd as jest.Mock).mockReturnValue(savedData);

    const { result } = renderHook(() => useADM004());

    await waitFor(() => {
      expect(result.current.getValues()).toEqual(toEmployeeFormValues(savedData));
    });

    expect(clearEmployeeAddRestore).toHaveBeenCalledTimes(1);
  });

  it('initializes empty form when there is no restore flag', async () => {
    const { result } = renderHook(() => useADM004());

    await waitFor(() => {
      expect(result.current.getValues()).toEqual(createEmployeeEmpty());
    });

    expect(saveEmployeeAdd).not.toHaveBeenCalled();
    expect(saveEmployeeConfirmData).not.toHaveBeenCalled();
  });

  it('loads detail data when opened in edit mode without restore flag', async () => {
    const { useSearchParams } = jest.requireMock('next/navigation') as {
      useSearchParams: jest.Mock;
    };

    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('1'),
    });

    const { result } = renderHook(() => useADM004());

    await waitFor(() => {
      expect(getDepartments).toHaveBeenCalled();
      expect(getCertifications).toHaveBeenCalled();
      expect(getEmployeeDetail).toHaveBeenCalledWith('1');
      expect(result.current.getValues().employeeLoginId).toBe('user01');
    });

    expect(result.current.getValues().departmentId).toBe('2');
  });

  it('validates with backend, then saves confirm data and navigates on submit', async () => {
    (getDepartments as jest.Mock).mockResolvedValue([
      { departmentId: 2, departmentName: 'Development' },
    ]);
    (getCertifications as jest.Mock).mockResolvedValue([
      { certificationId: 1, certificationName: 'N1' },
    ]);

    const { result } = renderHook(() => useADM004());

    await waitFor(() => {
      expect(result.current.departments).toEqual([
        { departmentId: 2, departmentName: 'Development' },
      ]);
      expect(result.current.certifications).toEqual([
        { certificationId: 1, certificationName: 'N1' },
      ]);
    });

    act(() => {
      result.current.setValue('employeeLoginId', 'user01');
      result.current.setValue('departmentId', '2');
      result.current.setValue('employeeName', 'Test User');
      result.current.setValue('employeeNameKana', 'ﾃｽﾄ');
      result.current.setValue('employeeBirthDate', new Date('2000-01-01'));
      result.current.setValue('employeeEmail', 'test@example.com');
      result.current.setValue('employeeTelephone', '0123456789');
      result.current.setValue('employeeLoginPassword', 'secret123');
      result.current.setValue('employeeLoginPasswordConfirm', 'secret123');
      result.current.setValue('certificationId', '1');
      result.current.setValue('certificationStartDate', new Date('2020-01-01'));
      result.current.setValue('certificationEndDate', new Date('2022-01-01'));
      result.current.setValue('score', '850');
    });

    await act(async () => {
      await result.current.onConfirm({
        preventDefault: jest.fn(),
        persist: jest.fn(),
      } as unknown as React.BaseSyntheticEvent);
    });

    await waitFor(() => {
      expect(validateEmployeeInput).toHaveBeenCalledWith({
        employeeId: undefined,
        employeeLoginId: 'user01',
        departmentId: '2',
        employeeName: 'Test User',
        employeeNameKana: 'ﾃｽﾄ',
        employeeBirthDate: '2000-01-01',
        employeeEmail: 'test@example.com',
        employeeTelephone: '0123456789',
        employeeLoginPassword: 'secret123',
        employeeLoginPasswordConfirm: 'secret123',
        certificationId: '1',
        certificationStartDate: '2020-01-01',
        certificationEndDate: '2022-01-01',
        score: '850',
      });
    });

    expect(saveEmployeeAdd).toHaveBeenCalledTimes(1);
    expect(saveEmployeeConfirmData).toHaveBeenCalledWith({
      employeeLoginId: 'user01',
      departmentName: 'Development',
      employeeName: 'Test User',
      employeeNameKana: 'ﾃｽﾄ',
      employeeBirthDate: '2000/01/01',
      employeeEmail: 'test@example.com',
      employeeTelephone: '0123456789',
      certificationName: 'N1',
      certificationStartDate: '2020/01/01',
      certificationEndDate: '2022/01/01',
      score: '850',
    });
    expect(mockPush).toHaveBeenCalledWith('/employees/adm005');
  });

  it('does not save or navigate when backend validation fails', async () => {
    (getDepartments as jest.Mock).mockResolvedValue([
      { departmentId: 2, departmentName: 'Development' },
    ]);
    (validateEmployeeInput as jest.Mock).mockResolvedValue({
      code: 500,
      message: {
        code: 'ER003',
        params: ['アカウント名'],
      },
    });

    const { result } = renderHook(() => useADM004());

    await waitFor(() => {
      expect(result.current.departments).toEqual([
        { departmentId: 2, departmentName: 'Development' },
      ]);
    });

    act(() => {
      result.current.setValue('employeeLoginId', 'user01');
      result.current.setValue('departmentId', '2');
      result.current.setValue('employeeName', 'Test User');
      result.current.setValue('employeeNameKana', 'ﾃｽﾄ');
      result.current.setValue('employeeBirthDate', new Date('2000-01-01'));
      result.current.setValue('employeeEmail', 'test@example.com');
      result.current.setValue('employeeTelephone', '0123456789');
      result.current.setValue('employeeLoginPassword', 'secret123');
      result.current.setValue('employeeLoginPasswordConfirm', 'secret123');
    });

    await act(async () => {
      await result.current.onConfirm({
        preventDefault: jest.fn(),
        persist: jest.fn(),
      } as unknown as React.BaseSyntheticEvent);
    });

    await waitFor(() => {
      expect(validateEmployeeInput).toHaveBeenCalled();
    });

    expect(saveEmployeeAdd).not.toHaveBeenCalled();
    expect(saveEmployeeConfirmData).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalledWith('/employees/adm005');
    expect(result.current.errorMessage).not.toBe('');
  });
});
