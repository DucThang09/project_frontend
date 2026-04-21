import { fireEvent, render, screen } from '@testing-library/react';
import EmployeeInputForm from '@/components/EmployeeInputForm';
import { useADM004 } from '@/hooks/useADM004';

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
  const fieldValues: Record<string, string> = {
    departmentId: '',
    certificationId: '',
  };
  const mockRegister = jest.fn((name: string) => ({
    name,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
  }));
  const mockControl = {};
  const mockWatch = jest.fn().mockReturnValue('');

  beforeEach(() => {
    jest.clearAllMocks();
    fieldValues.departmentId = '';
    fieldValues.certificationId = '';

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
      watch: jest.fn((name: string) => fieldValues[name] ?? ''),
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
});
