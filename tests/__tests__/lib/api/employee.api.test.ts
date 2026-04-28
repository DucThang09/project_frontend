import { deleteEmployee } from '@/lib/api/employee.api';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    delete: jest.fn(),
  },
}));

describe('employee.api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls delete employee API with employeeId query parameter', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({
      data: {
        code: 200,
        employeeId: '30',
        message: { code: 'MSG003', params: [] },
      },
    });

    const result = await deleteEmployee('30');

    expect(apiClient.delete).toHaveBeenCalledWith('/employee', {
      params: { employeeId: '30' },
    });
    expect(result.message?.code).toBe('MSG003');
  });
});
