'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getCertifications } from '@/lib/api/certification.api';
import { getDepartments } from '@/lib/api/department.api';
import {
  getEmployeeDetail,
  validateEmployeeInput,
} from '@/lib/api/employee.api';
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
  toEmployeeFormValuesFromDetail,
} from '@/lib/storage/EmployeeInputForm';
import { loadEmployeeDetailId } from '@/lib/storage/employee-detail';
import { employeeInputFormSchema } from '@/lib/validation/EmployeeInputFormSchema';
import type { CertificationDTO } from '@/types/certification';
import type { DepartmentDTO } from '@/types/department';
import type {
  ApiMessage,
  EmployeeFormValues,
  EmployeeValidationRequest,
} from '@/types/employee';

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

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeInputFormSchema),
    defaultValues: createEmployeeEmpty(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const { reset, handleSubmit, setError, clearErrors } = form;

  const employeeId = searchParams.get('id') ?? loadEmployeeDetailId();
  const mode = employeeId ? EMPLOYEE_MODE_EDIT : EMPLOYEE_MODE_ADD;

  useEffect(() => {
    const employeeInfo = loadEmployeeAdd();
    const isBackFromConfirm = RestoreEmployeeAdd();
    let active = true;

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
        errors.push('グループ一覧の取得に失敗しました。');
      }

      if (certificationResult.status === 'fulfilled') {
        setCertifications(certificationResult.value);
      } else {
        setCertifications([]);
        errors.push('資格一覧の取得に失敗しました。');
      }

      setErrorMessage(errors.join(' '));
    };

    const initializeForm = async () => {
      if (isBackFromConfirm && employeeInfo) {
        reset(toEmployeeFormValues(employeeInfo));
        clearEmployeeAddRestore();
        return;
      }

      if (mode === EMPLOYEE_MODE_EDIT && employeeId) {
        try {
          const response = await getEmployeeDetail(employeeId);

          if (!active || response.code !== 200 || !response.employee) {
            router.push('/employees/system-error');
            return;
          }

          reset(toEmployeeFormValuesFromDetail(response.employee));
          return;
        } catch {
          if (active) {
            router.push('/employees/system-error');
          }
          return;
        }
      }

      if (!employeeInfo) {
        reset(createEmployeeEmpty());
      }
    };

    fetchMasterData();
    initializeForm();

    return () => {
      active = false;
    };
  }, [employeeId, mode, reset, router]);

  const formatBackendMessage = (message: ApiMessage | undefined) => {
    if (!message || !(message.code in VALIDATION_MESSAGES)) {
      return formatValidationMessage('ER023');
    }

    return formatValidationMessage(
      message.code as ValidationMessageCode,
      ...message.params
    );
  };

  const applyBackendValidationError = (message: ApiMessage | undefined) => {
    if (!message) {
      setErrorMessage(formatValidationMessage('ER023'));
      return;
    }

    const formattedMessage = formatBackendMessage(message);

    if (message.code === 'ER003' || message.code === 'ER004') {
      setErrorMessage(formattedMessage);
      return;
    }

    if (message.code === 'ER012') {
      setError('certificationEndDate', {
        type: 'server',
        message: formattedMessage,
      });
      setErrorMessage('');
      return;
    }

    if (message.code === 'ER017') {
      setError('employeeLoginPasswordConfirm', {
        type: 'server',
        message: formattedMessage,
      });
      setErrorMessage('');
      return;
    }

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

  const onConfirm = handleSubmit(async (values) => {
    clearErrors();
    setErrorMessage('');

    const validatePayload = toEmployeeValidationRequest(values);
    const response = await validateEmployeeInput(validatePayload);

    if (response.code !== 200) {
      applyBackendValidationError(response.message);
      return;
    }

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
