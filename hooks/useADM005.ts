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
    // Hàm để binding dữ liệu từ session lên màn hình confirm.
    const bindConfirmData = () => {
      const employeeInfo = loadEmployeeAdd();
      if (employeeInfo) {
        const confirmData = toEmployeeConfirmData(employeeInfo);
        setData(confirmData);
        setEmployeeData(employeeInfo);
      }
    };

    const loadConfirmData = async () => {
      //Kiểm tra nếu là mode edit thì gọi API lấy thông tin nhân viên
      if (mode === EMPLOYEE_MODE_EDIT) {
        try {
          const response = await getEmployeeDetail(employeeId);
          // Kiểm tra nếu API trả về lỗi hoặc không tồn tại thông tin nhân viên thì chuyển hướng đến trang system error.
          if (response.code !== HTTP_STATUS_OK || !response.employee) {
            router.push('/employees/system-error');
            return;
          } else {
            // API thanh cong thi binding data tu MH edit len man hinh confirm.
            bindConfirmData();
            return;
          }
        } catch {
          router.push('/employees/system-error');
          return;
        }
      } else {
        // Neu la mode add thi binding data tu session da luu o MH add len man hinh confirm.
        bindConfirmData();
        return;
      }
    };

    loadConfirmData();
  }, [employeeId, mode, router]);

  const handleBack = () => {
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
