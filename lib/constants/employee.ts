/**
 * Đây là file định nghĩa các constant liên quan đến employee, bao gồm:
 */
export const EMPLOYEE_LIST_PAGE_SIZE = 20;
export const EMPLOYEE_MODE_ADD = 'add';
export const EMPLOYEE_MODE_EDIT = 'edit';
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
export const EMPLOYEE_FORM_VALIDATION_MODES = {
  validateMode: 'onBlur',
  reValidateMode: 'onChange',
} as const;

export const EMPLOYEE_VALIDATION_LENGTHS = {
  loginIdMax: 50,
  passwordMin: 8,
  passwordMax: 50,
  employeeNameMax: 125,
  employeeNameKanaMax: 125,
  emailMax: 125,
  telephoneMax: 50,
} as const;
/** 
 * Định nghĩa các format và message code dùng chung cho phần validation
 */
export const EMPLOYEE_VALIDATION_FORMATS = {
  emailExample: 'xxx@xxx.xxx',
} as const;

export const EMPLOYEE_VALIDATION_MESSAGE_CODES = {
  required: 'ER001',
  selectRequired: 'ER002',
  emailFormat: 'ER005',
  maxLength: 'ER006',
  passwordLength: 'ER007',
  telephoneFormat: 'ER008',
  kanaFormat: 'ER009',
  dateOrder: 'ER012',
  passwordConfirmMismatch: 'ER017',
  halfWidthNumber: 'ER018',
  loginIdFormat: 'ER019',
} as const;
/**
 * Định nghĩa các label hiển thị cho các field, dùng chung cho phần validation và hiển thị lỗi.
 */
export const VALIDATION_LABELS = {
  employeeLoginId: 'アカウント名',
  departmentId: 'グループ',
  employeeName: '氏名',
  employeeNameKana: 'カタカナ氏名',
  employeeBirthDate: '生年月日',
  employeeEmail: 'メールアドレス',
  employeeTelephone: '電話番号',
  employeeLoginPassword: 'パスワード',
  employeeLoginPasswordConfirm: 'パスワード（確認）',
  certificationId: '資格',
  certificationStartDate: '資格交付日',
  certificationEndDate: '失効日',
  score: '点数',
} as const;
