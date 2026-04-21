'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import { EMPLOYEE_MODE_ADD, EMPLOYEE_MODE_EDIT } from '@/lib/constants/employee';
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
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';
import type { EmployeeFormValues } from '@/types/employee';

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

  // Khởi tạo form của màn add/edit.
  const form = useForm<EmployeeFormValues>({
    defaultValues: createEmployeeEmpty(),
  });
  const { reset, handleSubmit } = form;

  // Đọc id từ query để phân giữa add mode và edit mode.
  const employeeId = searchParams.get('id');
  const mode = employeeId ? EMPLOYEE_MODE_EDIT : EMPLOYEE_MODE_ADD; //Nếu có id thì là màn edit, không có thì là add

  useEffect(() => {
    //Lấy dữ liệu đã lưu trước đó.
    const employeeInfo = loadEmployeeAdd();
    //Kiểm tra có phải vừa từ màn confirm quay lại không.
    const isBackFromConfirm = RestoreEmployeeAdd();

    if (isBackFromConfirm && employeeInfo) {
      //lấy toàn bộ dữ liệu đã lưu trong session vào lại form
      reset(toEmployeeFormValues(employeeInfo));
      clearEmployeeAddRestore();
    } else if (mode === EMPLOYEE_MODE_EDIT ) {

    } else if (!employeeInfo) {
      reset(createEmployeeEmpty());
    }

    // load data cho dropdown
    let active = true;
    const fetchMasterData = async () => {
      const [departmentResult, certificationResult] = await Promise.allSettled([
        getDepartments(),
        getCertifications(),
      ]);

      if (!active) return;

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
    fetchMasterData();

    return () => {
      active = false;
    };
  }, []);

  
  const onConfirm = handleSubmit((values) => {
    const employeeInfo = toEmployeeAdd(values, departments, certifications);// lấy dữ liệu đã chuẩn hóa 
    saveEmployeeAdd(employeeInfo);//lưu vào session 
    saveEmployeeConfirmData(toEmployeeConfirmData(employeeInfo));
    router.push('/employees/adm005');
  });

  // Quay về màn danh sách
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
