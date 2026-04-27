import { fireEvent, render, screen } from '@testing-library/react';
import EmployeeInputForm from '@/components/EmployeeInputForm';
import { useADM004 } from '@/hooks/useADM004';
import { EMPLOYEE_MODE_ADD, EMPLOYEE_MODE_EDIT } from '@/lib/constants/employee';

jest.mock('@/hooks/useADM004');
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ render }: { render: (props: { field: { value: null; onChange: jest.Mock } }) => unknown }) => (
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
  const mockOnConfirm = jest.fn();
  const mockOnBack = jest.fn();
  const mockSetValue = jest.fn();
  const mockClearErrors = jest.fn();
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
    mockSetValue.mockReset();
    mockClearErrors.mockReset();

    (useADM004 as jest.Mock).mockReturnValue({
      departments: [
        { departmentId: 1, departmentName: 'Development' },
      ],
      certifications: [
        { certificationId: 1, certificationName: 'N1' },
      ],
      errorMessage: '',
      register: mockRegister,
      control: mockControl,
      setValue: mockSetValue,
      clearErrors: mockClearErrors,
      watch: jest.fn((name: string) => fieldValues[name] ?? ''),
      formState: {
        errors: {},
      },
      mode: EMPLOYEE_MODE_ADD,
      onConfirm: mockOnConfirm,
      onBack: mockOnBack,
    });
  });

  it('calls onConfirm only when clicking the confirm button', () => {
    render(<EmployeeInputForm />);

    fireEvent.click(screen.getByRole('button', { name: '確認' }));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not call onConfirm when pressing Enter in a form input', () => {
    render(<EmployeeInputForm />);

    fireEvent.keyDown(screen.getAllByRole('textbox')[0], { key: 'Enter', code: 'Enter' });

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onBack without calling onConfirm when clicking the back button', () => {
    render(<EmployeeInputForm />);

    fireEvent.click(screen.getByRole('button', { name: '戻る' }));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('shows restored department and certification selections', () => {
    fieldValues.departmentId = '1';
    fieldValues.certificationId = '1';

    render(<EmployeeInputForm />);

    const [departmentSelect, certificationSelect] = screen.getAllByRole('combobox');

    expect(departmentSelect).toHaveValue('1');
    expect(certificationSelect).toHaveValue('1');
  });

  it('clears dependent certification fields when user clears certification', () => {
    fieldValues.certificationId = '1';

    render(<EmployeeInputForm />);

    const [, certificationSelect] = screen.getAllByRole('combobox');

    fireEvent.change(certificationSelect, { target: { value: '' } });

    expect(mockCertificationOnChange).toHaveBeenCalledTimes(1);
    expect(mockSetValue).toHaveBeenNthCalledWith(1, 'certificationStartDate', null);
    expect(mockSetValue).toHaveBeenNthCalledWith(2, 'certificationEndDate', null);
    expect(mockSetValue).toHaveBeenNthCalledWith(3, 'score', '');
    expect(mockClearErrors).toHaveBeenCalledWith([
      'certificationId',
      'certificationStartDate',
      'certificationEndDate',
      'score',
    ]);
  });

  it('does not clear dependent certification fields when user selects a certification', () => {
    render(<EmployeeInputForm />);

    const [, certificationSelect] = screen.getAllByRole('combobox');

    fireEvent.change(certificationSelect, { target: { value: '1' } });

    expect(mockCertificationOnChange).toHaveBeenCalledTimes(1);
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(mockClearErrors).not.toHaveBeenCalled();
  });

  it('disables account and password fields in edit mode', () => {
    (useADM004 as jest.Mock).mockReturnValue({
      departments: [],
      certifications: [],
      errorMessage: '',
      register: mockRegister,
      control: mockControl,
      setValue: mockSetValue,
      clearErrors: mockClearErrors,
      trigger: jest.fn(),
      watch: jest.fn((name: string) => fieldValues[name] ?? ''),
      formState: {
        errors: {},
      },
      mode: EMPLOYEE_MODE_EDIT,
      onConfirm: mockOnConfirm,
      onBack: mockOnBack,
    });

    const { container } = render(<EmployeeInputForm />);

    expect(container.querySelector('input[name="employeeLoginId"]')).toBeDisabled();
    expect(container.querySelector('input[name="employeeLoginPassword"]')).toBeDisabled();
    expect(container.querySelector('input[name="employeeLoginPasswordConfirm"]')).toBeDisabled();
  });
});
