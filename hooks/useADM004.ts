'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getDepartments } from '@/lib/api/department.api';
import { validateEmployeeInput } from '@/lib/api/employee.api';
import { getCertifications } from '@/lib/api/certification.api';
import {
  EMPLOYEE_MODE_ADD,
  EMPLOYEE_MODE_EDIT,
  VALIDATION_LABELS,
} from '@/lib/constants/employee';
import {
  VALIDATION_MESSAGES,
  type ValidationMessageCode,
  formatValidationMessage,
} from '@/lib/constants/messages';
import {
  clearEmployeeAddRestore,
  loadEmployeeAdd,
  RestoreEmployeeAdd,
  saveEmployeeAdd,
  saveEmployeeConfirmData,
  toEmployeeAdd,
  toEmployeeConfirmData,
  toEmployeeFormValues,
} from '@/lib/storage/EmployeeInputForm';
import { employeeInputFormSchema } from '@/lib/validation/EmployeeInputFormSchema';
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';
import type {
  ApiMessage,
  EmployeeFormValues,
  EmployeeValidationRequest,
} from '@/types/employee';

// Map label backend trả về sang đúng field của react-hook-form.
const LABEL_TO_FIELD: Partial<Record<string, keyof EmployeeFormValues>> = {
  [VALIDATION_LABELS.employeeLoginId]: 'employeeLoginId',
  [VALIDATION_LABELS.departmentId]: 'departmentId',
  [VALIDATION_LABELS.employeeName]: 'employeeName',
  [VALIDATION_LABELS.employeeNameKana]: 'employeeNameKana',
  [VALIDATION_LABELS.employeeBirthDate]: 'employeeBirthDate',
  [VALIDATION_LABELS.employeeEmail]: 'employeeEmail',
  [VALIDATION_LABELS.employeeTelephone]: 'employeeTelephone',
  [VALIDATION_LABELS.employeeLoginPassword]: 'employeeLoginPassword',
  [VALIDATION_LABELS.employeeLoginPasswordConfirm]:
    'employeeLoginPasswordConfirm',
  [VALIDATION_LABELS.certificationId]: 'certificationId',
  [VALIDATION_LABELS.certificationStartDate]: 'certificationStartDate',
  [VALIDATION_LABELS.certificationEndDate]: 'certificationEndDate',
  [VALIDATION_LABELS.score]: 'score',
};

export function createEmployeeEmpty(): EmployeeFormValues {
  return {
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
  };
}

export function useADM004() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate lần đầu, sau đó validate ngay khi người dùng sửa.
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeInputFormSchema),
    defaultValues: createEmployeeEmpty(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const { reset, handleSubmit, setError, clearErrors } = form;

  // Có id thì coi là màn edit, ngược lại là màn add.
  const employeeId = searchParams.get('id');
  const mode = employeeId ? EMPLOYEE_MODE_EDIT : EMPLOYEE_MODE_ADD;

  useEffect(() => {
    // Quay lại từ confirm thì restore dữ liệu đã nhập trước đó.
    const employeeInfo = loadEmployeeAdd();
    const isBackFromConfirm = RestoreEmployeeAdd();

    if (isBackFromConfirm && employeeInfo) {
      reset(toEmployeeFormValues(employeeInfo));
      clearEmployeeAddRestore();
    } else if (mode === EMPLOYEE_MODE_EDIT) {
      // Màn sửa chưa có luồng load dữ liệu thật từ backend.
    } else if (!employeeInfo) {
      reset(createEmployeeEmpty());
    }

    
    let active = true;

    // Tải master data cần cho combobox phòng ban và chứng chỉ.
    const fetchMasterData = async () => {
      const [departmentResult, certificationResult] = await Promise.allSettled([
        getDepartments(),
        getCertifications(),
      ]);

      if (!active) {
        return;
      }

      const errors: string[] = [];

      if (departmentResult.status === 'fulfilled') {
        setDepartments(departmentResult.value);
      } else {
        setDepartments([]);
        errors.push('ã‚°ãƒ«ãƒ¼ãƒ—ä¸€è¦§ã®å–å¾—ã«å¤±æ•—ã—ã¾ã—ãŸã€‚');
      }

      if (certificationResult.status === 'fulfilled') {
        setCertifications(certificationResult.value);
      } else {
        setCertifications([]);
        errors.push('è³‡æ ¼ä¸€è¦§ã®å–å¾—ã«å¤±æ•—ã—ã¾ã—ãŸã€‚');
      }

      setErrorMessage(errors.join(' '));
    };
    fetchMasterData();

    return () => {
      active = false;
    };
  }, [mode, reset]);

  // Dùng mã lỗi và params từ backend để dựng message hiển thị.
  const formatBackendMessage = (message: ApiMessage | undefined) => {
    if (!message || !(message.code in VALIDATION_MESSAGES)) {
      return formatValidationMessage('ER023');
    }

    return formatValidationMessage(
      message.code as ValidationMessageCode,
      ...message.params
    );
  };

  // Một số mã lỗi lên box tổng, còn lại map về field nếu xác định được.
  const applyBackendValidationError = (message: ApiMessage | undefined) => {
    if (!message) {
      setErrorMessage(formatValidationMessage('ER023'));
      return;
    }

    const formattedMessage = formatBackendMessage(message);

    // Hai lỗi này hiển thị ở box lỗi tổng phía trên form.
    if (message.code === 'ER003' || message.code === 'ER004') {
      setErrorMessage(formattedMessage);
      return;
    }

    // Lỗi quan hệ ngày chứng chỉ thì gắn trực tiếp vào field ngày hết hạn.
    if (message.code === 'ER012') {
      setError('certificationEndDate', {
        type: 'server',
        message: formattedMessage,
      });
      setErrorMessage('');
      return;
    }

    // Lỗi confirm password thì luôn gắn vào field xác nhận mật khẩu.
    if (message.code === 'ER017') {
      setError('employeeLoginPasswordConfirm', {
        type: 'server',
        message: formattedMessage,
      });
      setErrorMessage('');
      return;
    }

    // Các lỗi còn lại thử map từ label backend sang field tương ứng.
    const field = message.params[0]
      ? LABEL_TO_FIELD[message.params[0]]
      : undefined;
    if (field) {
      setError(field, {
        type: 'server',
        message: formattedMessage,
      });
      setErrorMessage('');
      return;
    }

    setErrorMessage(formattedMessage);
  };

  const toEmployeeValidationRequest = (
    values: EmployeeFormValues
  ): EmployeeValidationRequest => {
    // Chuẩn hóa lại dữ liệu giống lúc lưu sang màn confirm.
    const employeeInfo = toEmployeeAdd(
      values,
      departments,
      certifications,
      mode,
      employeeId
    );

    return {
      employeeId: employeeInfo.employeeId || undefined,
      employeeLoginId: employeeInfo.employeeLoginId,
      departmentId: employeeInfo.departmentId,
      employeeName: employeeInfo.employeeName,
      employeeNameKana: employeeInfo.employeeNameKana,
      employeeBirthDate: employeeInfo.employeeBirthDate,
      employeeEmail: employeeInfo.employeeEmail,
      employeeTelephone: employeeInfo.employeeTelephone,
      employeeLoginPassword: employeeInfo.employeeLoginPassword,
      employeeLoginPasswordConfirm: employeeInfo.employeeLoginPasswordConfirm,
      certificationId: employeeInfo.certificationId,
      certificationStartDate: employeeInfo.certificationStartDate,
      certificationEndDate: employeeInfo.certificationEndDate,
      score: employeeInfo.score,
    };
  };

  // Chỉ lưu sang confirm khi backend validate pass.
  const onConfirm = handleSubmit(async (values) => {
    clearErrors();
    setErrorMessage('');

    // Gọi backend validate lại trước khi cho sang màn confirm.
    const validatePayload = toEmployeeValidationRequest(values);
    const response = await validateEmployeeInput(validatePayload);

    if (response.code !== 200) {
      applyBackendValidationError(response.message);
      return;
    }

    // Lưu cả dữ liệu gốc và dữ liệu hiển thị để ADM005 dùng lại.
    const employeeInfo = toEmployeeAdd(
      values,
      departments,
      certifications,
      mode,
      employeeId
    );
    saveEmployeeAdd(employeeInfo);
    saveEmployeeConfirmData(toEmployeeConfirmData(employeeInfo));
    router.push('/employees/adm005');
  });

  const onBack = () => {
    router.push('/employees/adm002');
  };

  return {
    ...form,
    departments,
    certifications,
    errorMessage,
    mode,
    employeeId,
    onConfirm,
    onBack,
  };
}
