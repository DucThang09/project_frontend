'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import {
  createEmployeeEmpty,
  formatDisplayDate,
  loadEmployeeAdd,
  saveEmployeeAdd,
  saveEmployeeConfirmData,
  shouldRestoreEmployeeAdd,
  toEmployeeAdd,
  toEmployeeFormValues,
} from '@/lib/storage/EmployeeInputForm';
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';
import type { EmployeeFormValues } from '@/types/employee';

export function useADM004() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const isRestoringRef = useRef(false);

  // Khởi tạo form của màn add/edit.
  const form = useForm<EmployeeFormValues>({
    defaultValues: createEmployeeEmpty(),
  });
  const { reset, handleSubmit, watch, setValue } = form;

  // Đọc id từ query string để phân giữa add mode và edit mode.
  const employeeId = searchParams.get('id');

  useEffect(() => {
    const saveData = loadEmployeeAdd();
    const isBackFromConfirm = shouldRestoreEmployeeAdd();

    if (isBackFromConfirm || saveData) {
      isRestoringRef.current = true;
      reset(saveData ? toEmployeeFormValues(saveData) : createEmployeeEmpty());
    } else if (employeeId) {

    } else {
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

    // Xóa field phụ thuộc khi người dùng bỏ chọn chứng chỉ
    const subscription = watch((value, { name }) => {
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        return;
      }

      if (name === 'certificationId' && !value.certificationId) {
        setValue('certificationStartDate', null);
        setValue('certificationEndDate', null);
        setValue('score', '');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // session cho dữ liệu form/confirm.
  const onConfirm = handleSubmit((values) => {
    const saveForm = toEmployeeAdd(values, departments, certifications);
    saveEmployeeAdd(saveForm);
    const selectedDepartment = departments.find(
      (department) => String(department.departmentId) === saveForm.departmentId
    );
    const selectedCertification = certifications.find(
      (certification) => String(certification.certificationId) === saveForm.certificationId
    );
    saveEmployeeConfirmData({
      employeeLoginId: saveForm.employeeLoginId,
      departmentName: selectedDepartment?.departmentName ?? '',
      employeeName: saveForm.employeeName,
      employeeNameKana: saveForm.employeeNameKana,
      employeeBirthDate: formatDisplayDate(saveForm.employeeBirthDate),
      employeeEmail: saveForm.employeeEmail,
      employeeTelephone: saveForm.employeeTelephone,
      certificationName: selectedCertification?.certificationName ?? '',
      certificationStartDate: formatDisplayDate(saveForm.certificationStartDate),
      certificationEndDate: formatDisplayDate(saveForm.certificationEndDate),
      score: saveForm.score,
    });
    router.push('/employees/adm005');
  });

  // Quay về màn danh sách; ADM002 sẽ tự restore lại search, sort và page trước đó.
  const onBack = () => {
    router.push('/employees/adm002');
  };

  return {
    ...form,
    departments,
    certifications,
    errorMessage,
    onConfirm,
    onBack,
  };
}
