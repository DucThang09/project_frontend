// So ban ghi mac dinh tren moi trang cua man hinh danh sach nhan vien.
export const EMPLOYEE_LIST_PAGE_SIZE = 20;
export const EMPLOYEE_MODE_ADD = 'add';
export const EMPLOYEE_MODE_EDIT = 'edit';
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
