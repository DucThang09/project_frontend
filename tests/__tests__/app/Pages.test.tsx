import { render, waitFor } from '@testing-library/react';
import EmployeeDetailPage from '@/app/(protected)/employees/adm003/page';
import EmployeeListPage from '@/app/(protected)/employees/adm002/page';
import EmployeeEditPage from '@/app/(protected)/employees/adm004/page';
import EmployeeConfirmPage from '@/app/(protected)/employees/adm005/page';
import EmployeeCompletePage from '@/app/(protected)/employees/adm006/page';
import RootLayout from '@/app/layout';
import HomePage from '@/app/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

jest.mock('@/lib/api/department.api', () => ({
  getDepartments: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/lib/api/certification.api', () => ({
  getCertifications: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/lib/api/employee.api', () => ({
  getEmployees: jest.fn().mockResolvedValue({
    code: 200,
    totalRecords: 0,
    employees: [],
  }),
  getEmployeeDetail: jest.fn().mockResolvedValue({
    code: 200,
    employee: {
      employeeId: 30,
      employeeLoginId: 'user01',
      departmentId: 2,
      departmentName: 'Development',
      employeeName: 'Test User',
      employeeNameKana: 'テスト',
      employeeBirthDate: '2000-01-01',
      employeeEmail: 'test@example.com',
      employeeTelephone: '0123456789',
      certificationId: 1,
      certificationName: 'N1',
      certificationStartDate: '2020-01-01',
      certificationEndDate: '2022-01-01',
      score: 850,
    },
  }),
  validateEmployeeInput: jest.fn().mockResolvedValue({ code: 200 }),
}));

jest.mock('@/lib/storage/EmployeeInputForm', () => ({
  clearEmployeeAdd: jest.fn(),
  clearEmployeeAddRestore: jest.fn(),
  RestoreEmployeeAdd: jest.fn().mockReturnValue(false),
  createEmptyEmployeeFormValues: () => ({
    employeeLoginId: '',
    departmentId: '',
    employeeName: '',
    employeeNameKana: '',
    employeeBirthDate: null,
    employeeEmail: '',
    employeeTelephone: '',
    employeeLoginPassword: '',
    employeeLoginPasswordConfirm: '',
    certificationId: '',
    certificationStartDate: null,
    certificationEndDate: null,
    score: '',
  }),
  loadEmployeeAdd: jest.fn().mockReturnValue({
    mode: 'add',
    employeeId: '',
    employeeLoginId: 'user01',
    departmentId: '2',
    departmentName: 'Development',
    employeeName: 'Test User',
    employeeNameKana: 'ﾃｽﾄ',
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
  }),
  loadEmployeeConfirmData: jest.fn().mockReturnValue({
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
  }),
  saveEmployeeAdd: jest.fn(),
  saveEmployeeConfirmData: jest.fn(),
  toEmployeeAdd: jest.fn(),
  toEmployeeConfirmData: jest.fn(),
  toEmployeeFormValues: jest.fn(),
  toEmployeeFormValuesFromDetail: jest.fn().mockReturnValue({
    employeeLoginId: 'user01',
    departmentId: '2',
    employeeName: 'Test User',
    employeeNameKana: 'テスト',
    employeeBirthDate: new Date('2000-01-01'),
    employeeEmail: 'test@example.com',
    employeeTelephone: '0123456789',
    employeeLoginPassword: '',
    employeeLoginPasswordConfirm: '',
    certificationId: '1',
    certificationStartDate: new Date('2020-01-01'),
    certificationEndDate: new Date('2022-01-01'),
    score: '850',
  }),
}));

jest.mock('@/lib/storage/employeeList', () => ({
  loadEmployeeListState: jest.fn().mockReturnValue(null),
  saveEmployeeListState: jest.fn(),
  clearEmployeeListState: jest.fn(),
}));

jest.mock('@/lib/storage/employeeDetail', () => ({
  loadEmployeeDetailId: jest.fn().mockReturnValue('30'),
  saveEmployeeDetailId: jest.fn(),
  clearEmployeeDetailId: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => {},
  useGuest: () => {},
}));

describe('Page Snapshots', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders EmployeeListPage', () => {
    const { container } = render(<EmployeeListPage />);
    expect(container.textContent).toContain('検索');
  });

  it('renders EmployeeEditPage', () => {
    const { container } = render(<EmployeeEditPage />);
    expect(container.textContent).toContain('会員情報追加');
  });

  it('renders EmployeeDetailPage', () => {
    const { container } = render(<EmployeeDetailPage />);
    expect(container).toBeTruthy();
  });

  it('renders EmployeeConfirmPage', async () => {
    const { container } = render(<EmployeeConfirmPage />);
    await waitFor(() => {
      expect(container.textContent).toContain('情報確認');
    });
  });

  it('renders EmployeeCompletePage', () => {
    const { container } = render(<EmployeeCompletePage />);
    expect(container.textContent).toContain('OK');
  });

  it('renders HomePage and checks redirection shell', () => {
    const { container } = render(<HomePage />);
    expect(container).toMatchSnapshot();
  });

  it('renders RootLayout', () => {
    const { container } = render(<RootLayout><div>Test Child</div></RootLayout>);
    expect(container.textContent).toContain('Luvina Software');
  });
});
