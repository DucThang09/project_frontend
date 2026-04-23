'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addEmployee, updateEmployee } from '@/lib/api/employee.api';
import {
  clearEmployeeAdd,
  loadEmployeeAdd,
  loadEmployeeConfirmData,
  setEmployeeAddRestore,
} from '@/lib/storage/EmployeeInputForm';
import type {
  EmployeeAdd,
  EmployeeConfirmData,
  EmployeeValidationRequest,
} from '@/types/employee';

export function useADM005() {
  const router = useRouter();
  const [data, setData] = useState<EmployeeConfirmData | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeAdd | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ADM005 chỉ hoạt động khi đã có dữ liệu lưu từ ADM004.
    const confirmData = loadEmployeeConfirmData();
    const savedEmployee = loadEmployeeAdd();

    if (!confirmData || !savedEmployee) {
      router.replace('/employees/adm004');
      return;
    }

    setData(confirmData);
    setEmployeeData(savedEmployee);
  }, [router]);

  const handleBack = () => {
    // Đánh dấu để ADM004 restore lại dữ liệu đã nhập.
    setEmployeeAddRestore();
    router.push('/employees/adm004');
  };

  // Dùng lại payload validate để gọi API add/update.
  const toValidationRequest = (
    savedEmployee: EmployeeAdd
  ): EmployeeValidationRequest => ({
    employeeId: savedEmployee.employeeId || undefined,
    employeeLoginId: savedEmployee.employeeLoginId,
    departmentId: savedEmployee.departmentId,
    employeeName: savedEmployee.employeeName,
    employeeNameKana: savedEmployee.employeeNameKana,
    employeeBirthDate: savedEmployee.employeeBirthDate,
    employeeEmail: savedEmployee.employeeEmail,
    employeeTelephone: savedEmployee.employeeTelephone,
    employeeLoginPassword: savedEmployee.employeeLoginPassword,
    employeeLoginPasswordConfirm: savedEmployee.employeeLoginPasswordConfirm,
    certificationId: savedEmployee.certificationId,
    certificationStartDate: savedEmployee.certificationStartDate,
    certificationEndDate: savedEmployee.certificationEndDate,
    score: savedEmployee.score,
  });

  const handleOk = async () => {
    // Chặn submit lặp hoặc submit khi thiếu dữ liệu confirm.
    if (!employeeData || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = toValidationRequest(employeeData);
      // Có employeeId thì gọi update, ngược lại gọi add.
      const response = employeeData.mode === 'edit' && employeeData.employeeId
        ? await updateEmployee(employeeData.employeeId, payload)
        : await addEmployee(payload);

      // Save lỗi thì chuyển sang màn hình system error.
      if (response.code !== 200) {
        router.push('/employees/system-error');
        return;
      }

      // Save thành công thì xóa dữ liệu trong session và sang màn complete.
      clearEmployeeAdd();
      router.push(`/employees/adm006?mode=${employeeData.mode}`);
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
