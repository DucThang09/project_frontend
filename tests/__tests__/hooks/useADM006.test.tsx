import { act, renderHook } from '@testing-library/react';
import { useADM006 } from '@/hooks/useADM006';
import { VALIDATION_MESSAGES } from '@/lib/constants/messages';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn();

describe('useADM006', () => {
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
      get: mockSearchParamsGet,
    });
    mockSearchParamsGet.mockReturnValue(null);
  });

  it('uses message query when valid message code is provided', () => {
    mockSearchParamsGet.mockImplementation((key: string) =>
      key === 'message' ? 'MSG003' : null
    );

    const { result } = renderHook(() => useADM006());

    expect(result.current.message).toBe(VALIDATION_MESSAGES.MSG003);
  });

  it('uses update message when mode is edit and message query is absent', () => {
    mockSearchParamsGet.mockImplementation((key: string) =>
      key === 'mode' ? 'edit' : null
    );

    const { result } = renderHook(() => useADM006());

    expect(result.current.message).toBe(VALIDATION_MESSAGES.MSG002);
  });

  it('uses add message when no query is provided', () => {
    const { result } = renderHook(() => useADM006());

    expect(result.current.message).toBe(VALIDATION_MESSAGES.MSG001);
  });

  it('navigates to employee list when OK is clicked', () => {
    const { result } = renderHook(() => useADM006());

    act(() => {
      result.current.onOk();
    });

    expect(mockPush).toHaveBeenCalledWith('/employees/adm002');
  });
});
