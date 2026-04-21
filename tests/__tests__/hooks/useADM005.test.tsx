import { act, renderHook, waitFor } from '@testing-library/react';
import { useADM005 } from '@/hooks/useADM005';
import {
  clearEmployeeAdd,
  loadEmployeeConfirmData,
  setEmployeeAddRestore,
} from '@/lib/storage/EmployeeInputForm';

jest.mock('@/lib/storage/EmployeeInputForm', () => ({
  clearEmployeeAdd: jest.fn(),
  loadEmployeeConfirmData: jest.fn(),
  setEmployeeAddRestore: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

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
  });

  it('loads confirm data and does not write form session on mount', async () => {
    (loadEmployeeConfirmData as jest.Mock).mockReturnValue({
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
    });

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(result.current.data?.employeeLoginId).toBe('user01');
    });

    expect(setEmployeeAddRestore).not.toHaveBeenCalled();
    expect(clearEmployeeAdd).not.toHaveBeenCalled();
  });

  it('handleBack only sets restore flag and navigates back to ADM004', async () => {
    (loadEmployeeConfirmData as jest.Mock).mockReturnValue({
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
    });

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
});
