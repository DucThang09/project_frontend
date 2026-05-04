'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  addEmployee,
  getEmployeeDetail,
  updateEmployee,
} from '@/lib/api/employee.api';
import {
  EMPLOYEE_MODE_ADD,
  EMPLOYEE_MODE_EDIT,
  HTTP_STATUS_OK,
} from '@/lib/constants/employee';
import {
  clearEmployeeAdd,
  isEmployeeAddSessionForRoute,
  loadEmployeeAdd,
  setEmployeeAddRestore,
  toEmployeeConfirmData,
} from '@/lib/storage/EmployeeInputForm';
import type {
  EmployeeAdd,
  EmployeeConfirmData,
  EmployeeValidationRequest,
} from '@/types/employee';

/**
 * Hook xu ly man ADM005.
 */
export function useADM005() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<EmployeeConfirmData | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeAdd | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeId = searchParams.get('employeeId') || '';
  const mode = employeeId ? EMPLOYEE_MODE_EDIT : EMPLOYEE_MODE_ADD;

  useEffect(() => {
    const bindConfirmData = (employeeInfo: EmployeeAdd) => {
      const confirmData = toEmployeeConfirmData(employeeInfo);
      setData(confirmData);
      setEmployeeData(employeeInfo);
    };

    const redirectByInvalidSession = () => {
      clearEmployeeAdd();
      router.push('/employees/system-error');
    };

    const loadConfirmData = async () => {
      const employeeInfo = loadEmployeeAdd();

      if (!isEmployeeAddSessionForRoute(employeeInfo, mode, employeeId)) {
        redirectByInvalidSession();
        return;
      }

      if (mode === EMPLOYEE_MODE_EDIT) {
        if (!/^\d+$/.test(employeeId)) {
          redirectByInvalidSession();
          return;
        }

        try {
          const response = await getEmployeeDetail(employeeId);
          if (response.code !== HTTP_STATUS_OK || !response.employee) {
            router.push('/employees/system-error');
            return;
          }

          bindConfirmData(employeeInfo);
          return;
        } catch {
          router.push('/employees/system-error');
          return;
        }
      }

      bindConfirmData(employeeInfo);
    };

    loadConfirmData();
  }, [employeeId, mode, router]);

  const handleBack = () => {
    if (!isEmployeeAddSessionForRoute(employeeData, mode, employeeId)) {
      clearEmployeeAdd();
      router.push('/employees/system-error');
      return;
    }

    setEmployeeAddRestore();

    if (mode === EMPLOYEE_MODE_EDIT) {
      router.push(`/employees/adm004?employeeId=${employeeId}`);
      return;
    }

    router.push('/employees/adm004');
  };

  const toValidationRequest = (
    employeeInfo: EmployeeAdd
  ): EmployeeValidationRequest => ({
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
  });

  const handleOk = async () => {
    if (!employeeData || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = toValidationRequest(employeeData);
      const response =
        mode === EMPLOYEE_MODE_EDIT && employeeId
          ? await updateEmployee(employeeId, payload)
          : await addEmployee(payload);

      if (response.code !== HTTP_STATUS_OK) {
        router.push('/employees/system-error');
        return;
      }

      clearEmployeeAdd();
      router.push(`/employees/adm006?mode=${mode}`);
    } catch {
      router.push('/employees/system-error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    data,
    isSubmitting,
    handleBack,
    handleOk,
  };
}
