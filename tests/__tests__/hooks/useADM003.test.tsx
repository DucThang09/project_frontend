import { act, renderHook, waitFor } from '@testing-library/react';
import { useADM003 } from '@/hooks/useADM003';
import { getEmployeeDetail } from '@/lib/api/employee.api';
import {
  clearEmployeeDetailId,
  loadEmployeeDetailId,
  saveEmployeeDetailId,
} from '@/lib/storage/employeeDetail';

jest.mock('@/lib/api/employee.api');
jest.mock('@/lib/storage/employeeDetail', () => ({
  clearEmployeeDetailId: jest.fn(),
  loadEmployeeDetailId: jest.fn(),
  saveEmployeeDetailId: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

const employeeDetail = {
  employeeId: 30,
  employeeLoginId: 'user01',
  departmentId: 2,
  departmentName: 'Development',
  employeeName: 'Test User',
  employeeNameKana: 'Test User',
  employeeBirthDate: '2000-01-01',
  employeeEmail: 'test@example.com',
  employeeTelephone: '0123456789',
  certificationId: 1,
  certificationName: 'N1',
  certificationStartDate: '2020-01-01',
  certificationEndDate: '2022-01-01',
  score: 850,
};

describe('useADM003', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { useRouter } = jest.requireMock('next/navigation') as {
      useRouter: jest.Mock;
    };

    useRouter.mockReturnValue({
      push: mockPush,
    });

    (loadEmployeeDetailId as jest.Mock).mockReturnValue('30');
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: 200,
      employee: employeeDetail,
    });
  });

  it('loads employee detail by hidden id', async () => {
    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.employeeDetail).toEqual(employeeDetail);
    });

    expect(getEmployeeDetail).toHaveBeenCalledWith('30');
    expect(mockPush).not.toHaveBeenCalledWith('/employees/system-error');
  });

  it('redirects to system error when hidden id is missing', async () => {
    (loadEmployeeDetailId as jest.Mock).mockReturnValue(null);

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });

    expect(clearEmployeeDetailId).toHaveBeenCalled();
    expect(getEmployeeDetail).not.toHaveBeenCalled();
  });

  it('redirects to system error when hidden id is invalid', async () => {
    (loadEmployeeDetailId as jest.Mock).mockReturnValue('abc');

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });

    expect(clearEmployeeDetailId).toHaveBeenCalled();
    expect(getEmployeeDetail).not.toHaveBeenCalled();
  });

  it('redirects to system error when detail API returns an error code', async () => {
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: 500,
      message: { code: 'ER023', params: [] },
    });

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });

    expect(clearEmployeeDetailId).toHaveBeenCalled();
  });

  it('redirects to system error when detail API omits employee', async () => {
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: 200,
    });

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });

    expect(clearEmployeeDetailId).toHaveBeenCalled();
  });

  it('stores hidden employee id before navigating to edit page', async () => {
    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.employeeDetail).toEqual(employeeDetail);
    });

    act(() => {
      result.current.onEdit();
    });

    expect(saveEmployeeDetailId).toHaveBeenCalledWith(30);
    expect(mockPush).toHaveBeenCalledWith('/employees/adm004');
  });

});
