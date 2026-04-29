import { act, renderHook, waitFor } from '@testing-library/react';
import { useADM003 } from '@/hooks/useADM003';
import { deleteEmployee, getEmployeeDetail } from '@/lib/api/employee.api';
import {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
} from '@/lib/constants/employee';

jest.mock('@/lib/api/employee.api');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn();

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
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const { useRouter, useSearchParams } = jest.requireMock('next/navigation') as {
      useRouter: jest.Mock;
      useSearchParams: jest.Mock;
    };

    useRouter.mockReturnValue({
      push: mockPush,
    });
    useSearchParams.mockReturnValue({
      get: mockSearchParamsGet,
    });

    mockSearchParamsGet.mockReturnValue('30');
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
      employee: employeeDetail,
    });
  });

  it('loads employee detail by router id', async () => {
    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.employeeDetail).toEqual(employeeDetail);
    });

    expect(getEmployeeDetail).toHaveBeenCalledWith('30');
    expect(mockPush).not.toHaveBeenCalledWith('/employees/system-error');
  });

  it('redirects to system error when router id is missing', async () => {
    mockSearchParamsGet.mockReturnValue(null);

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });

    expect(getEmployeeDetail).not.toHaveBeenCalled();
  });

  it('redirects to system error when router id is invalid', async () => {
    mockSearchParamsGet.mockReturnValue('abc');

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });

    expect(getEmployeeDetail).not.toHaveBeenCalled();
  });

  it('redirects to system error when detail API returns an error code', async () => {
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_INTERNAL_SERVER_ERROR,
      message: { code: 'ER023', params: [] },
    });

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });

  });

  it('redirects to system error when detail API omits employee', async () => {
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
    });

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/employees/system-error');
    });

  });

  it('navigates to edit page with employee id', async () => {
    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.employeeDetail).toEqual(employeeDetail);
    });

    act(() => {
      result.current.onEdit();
    });

    expect(mockPush).toHaveBeenCalledWith('/employees/adm004?employeeId=30');
  });

  it('deletes employee after confirm and navigates to complete page with API message', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    (deleteEmployee as jest.Mock).mockResolvedValue({
      code: HTTP_STATUS_OK,
      message: { code: 'MSG003', params: [] },
    });
    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.employeeDetail).toEqual(employeeDetail);
    });

    await act(async () => {
      await result.current.onDelete();
    });

    expect(deleteEmployee).toHaveBeenCalledWith('30');
    expect(mockPush).toHaveBeenCalledWith('/employees/adm006?message=MSG003');
  });

  it('does not delete employee when confirm is canceled', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.employeeDetail).toEqual(employeeDetail);
    });

    await act(async () => {
      await result.current.onDelete();
    });

    expect(deleteEmployee).not.toHaveBeenCalled();
  });

});
