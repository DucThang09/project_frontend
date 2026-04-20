import { render } from '@testing-library/react';
import EmployeeListPage from '@/app/(protected)/employees/adm002/page';
import EmployeeEditPage from '@/app/(protected)/employees/adm004/page';
import EmployeeDetailPage from '@/app/(protected)/employees/adm003/page';
import EmployeeConfirmPage from '@/app/(protected)/employees/adm005/page';
import EmployeeCompletePage from '@/app/(protected)/employees/adm006/page';
import HomePage from '@/app/page';
import RootLayout from '@/app/layout';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/', // Mock pathname for layout test
}));

jest.mock('@/lib/api/department.api', () => ({
  getDepartments: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/lib/api/certification.api', () => ({
  getCertifications: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/lib/storage/employee-add', () => ({
  clearEmployeeAddFlow: jest.fn(),
  clearEmployeeAddRestoreFlag: jest.fn(),
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
  formatDisplayDate: jest.fn(),
  loadEmployeeAddDraft: jest.fn().mockReturnValue(null),
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
  saveEmployeeAddDraft: jest.fn(),
  saveEmployeeConfirmData: jest.fn(),
  setEmployeeAddRestoreFlag: jest.fn(),
  shouldRestoreEmployeeAddDraft: jest.fn().mockReturnValue(false),
  toEmployeeAddDraft: jest.fn(),
  toEmployeeFormValues: jest.fn(),
}));

jest.mock('@/lib/storage/employee-list', () => ({
  loadEmployeeListState: jest.fn().mockReturnValue(null),
  saveEmployeeListState: jest.fn(),
  clearEmployeeListState: jest.fn(),
}));


// Mock the auth hooks to prevent redirection during tests
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => {},
  useGuest: () => {},
}));

describe('Page Snapshots', () => {
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
    expect(container.textContent).toContain('ntmhuong');
  });

  it('renders EmployeeConfirmPage', () => {
    const { container } = render(<EmployeeConfirmPage />);
    expect(container.textContent).toContain('情報確認');
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
    // Suppress React warning about <html> in <div> during testing
    const originalError = console.error;
    console.error = jest.fn();

    const { container } = render(<RootLayout><div>Test Child</div></RootLayout>);
    expect(container.textContent).toContain('Luvina Software');

    console.error = originalError;
  });
});

