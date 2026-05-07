import { fireEvent, render, screen } from '@testing-library/react';
import EmployeeInputForm from '@/components/adm004';
import { useADM004 } from '@/hooks/useADM004';
import { EMPLOYEE_MODE_ADD, EMPLOYEE_MODE_EDIT } from '@/lib/constants/employee';

jest.mock('@/hooks/useADM004');
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ render }: { render: (props: { field: { value: null; onChange: jest.Mock } }) => React.ReactNode }) => (
      <>{render({ field: { value: null, onChange: jest.fn() } })}</>
    ),
  };
});
jest.mock('react-datepicker/dist/react-datepicker.css', () => ({}));
jest.mock('react-datepicker', () => {
  return function MockDatePicker(props: {
    selected?: Date | null;
    onChange?: (date: Date | null) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
    placeholderText?: string;
    disabled?: boolean;
  }) {
    return (
      <input
        placeholder={props.placeholderText}
        disabled={props.disabled}
        value={props.selected ? 'selected' : ''}
        onChange={() => props.onChange?.(new Date('2000-01-01'))}
        onKeyDown={props.onKeyDown}
      />
    );
  };
});

describe('EmployeeInputForm', () => {
  const mockHandleConfirm = jest.fn();
  const mockOnBack = jest.fn();
  const mockHandleCertificationChange = jest.fn().mockResolvedValue(undefined);
  const fieldValues: Record<string, string> = {
    departmentId: '',
    certificationId: '',
  };
  const mockCertificationOnChange = jest.fn((event: { target: { value: string } }) => {
    fieldValues.certificationId = event.target.value;
  });
  const mockRegister = jest.fn((name: string) => ({
    name,
    onChange: name === 'certificationId' ? mockCertificationOnChange : jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
  }));
  const mockControl = {};

  beforeEach(() => {
    jest.clearAllMocks();
    fieldValues.departmentId = '';
    fieldValues.certificationId = '';
    mockHandleCertificationChange.mockReset();
    mockHandleCertificationChange.mockResolvedValue(undefined);

    (useADM004 as jest.Mock).mockReturnValue({
      departments: [
        { departmentId: 1, departmentName: 'Development' },
      ],
      certifications: [
        { certificationId: 1, certificationName: 'N1' },
      ],
      register: mockRegister,
      control: mockControl,
      watch: jest.fn((name: string) => fieldValues[name] ?? ''),
      formState: {
        errors: {},
      },
      mode: EMPLOYEE_MODE_ADD,
      originalCertification: null,
      handleCertificationChange: mockHandleCertificationChange,
      handleConfirm: mockHandleConfirm,
      onBack: mockOnBack,
    });
  });

  it('calls handleConfirm only when clicking the confirm button', () => {
    render(<EmployeeInputForm />);

    fireEvent.click(screen.getByRole('button', { name: '確認' }));

    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not call handleConfirm when pressing Enter in a form input', () => {
    render(<EmployeeInputForm />);

    fireEvent.keyDown(screen.getAllByRole('textbox')[0], { key: 'Enter', code: 'Enter' });

    expect(mockHandleConfirm).not.toHaveBeenCalled();
  });

  it('calls onBack without calling handleConfirm when clicking the back button', () => {
    render(<EmployeeInputForm />);

    fireEvent.click(screen.getByRole('button', { name: '戻る' }));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
    expect(mockHandleConfirm).not.toHaveBeenCalled();
  });

  it('shows restored department and certification selections', () => {
    fieldValues.departmentId = '1';
    fieldValues.certificationId = '1';

    render(<EmployeeInputForm />);

    const [departmentSelect, certificationSelect] = screen.getAllByRole('combobox');

    expect(departmentSelect).toHaveValue('1');
    expect(certificationSelect).toHaveValue('1');
  });

  it('passes empty certification value to hook when user clears certification', () => {
    fieldValues.certificationId = '1';

    render(<EmployeeInputForm />);

    const [, certificationSelect] = screen.getAllByRole('combobox');

    fireEvent.change(certificationSelect, { target: { value: '' } });

    expect(mockCertificationOnChange).toHaveBeenCalledTimes(1);
    expect(mockHandleCertificationChange).toHaveBeenCalledWith('');
  });

  it('passes selected certification value to hook when user selects a certification', () => {
    render(<EmployeeInputForm />);

    const [, certificationSelect] = screen.getAllByRole('combobox');

    fireEvent.change(certificationSelect, { target: { value: '1' } });

    expect(mockCertificationOnChange).toHaveBeenCalledTimes(1);
    expect(mockHandleCertificationChange).toHaveBeenCalledWith('1');
  });

  it('disables account and password fields in edit mode', () => {
    (useADM004 as jest.Mock).mockReturnValue({
      departments: [],
      certifications: [],
      register: mockRegister,
      control: mockControl,
      watch: jest.fn((name: string) => fieldValues[name] ?? ''),
      formState: {
        errors: {},
      },
      mode: EMPLOYEE_MODE_EDIT,
      originalCertification: null,
      handleCertificationChange: mockHandleCertificationChange,
      handleConfirm: mockHandleConfirm,
      onBack: mockOnBack,
    });

    const { container } = render(<EmployeeInputForm />);

    expect(container.querySelector('input[name="employeeLoginId"]')).toBeDisabled();
    expect(container.querySelector('input[name="employeeLoginPassword"]')).toBeDisabled();
    expect(container.querySelector('input[name="employeeLoginPasswordConfirm"]')).toBeDisabled();
  });
});
