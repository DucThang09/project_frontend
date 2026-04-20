'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import {
  clearEmployeeAddRestoreFlag,
  createEmptyEmployeeFormValues,
  formatDisplayDate,
  loadEmployeeAddDraft,
  saveEmployeeAddDraft,
  saveEmployeeConfirmData,
  shouldRestoreEmployeeAddDraft,
  toEmployeeAddDraft,
  toEmployeeFormValues,
} from '@/lib/storage/employee-add';
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';
import type { EmployeeFormValues } from '@/types/employee';

export function useADM004() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Khởi tạo form của màn add/edit.
  const form = useForm<EmployeeFormValues>({
    defaultValues: createEmptyEmployeeFormValues(),
  });

  const { reset, handleSubmit, watch, setValue } = form;
  const certificationId = watch('certificationId');
  // Đọc id từ query string để phân giữa add mode và edit mode.
  const employeeId = searchParams.get('id');

  useEffect(() => {
    // Phân nhánh trạng thái khởi tạo của màn hình:
    // quay lại từ confirm thì restore draft, có id thì đi theo nhánh edit, không có id thì là add.
    const isBackFromConfirm = shouldRestoreEmployeeAddDraft();
    const isEditMode = Boolean(employeeId);

    if (isBackFromConfirm) {
      // lấy lại dữ liệu user đã nhập trước đó.
      const draft = loadEmployeeAddDraft();
      if (draft) {
        reset(toEmployeeFormValues(draft));
      } else {
        // Nếu không còn draft thì fallback về trạng thái add rỗng để tránh form bị treo dữ liệu cũ.
        reset(createEmptyEmployeeFormValues());
      }

      // Chỉ restore draft một lần sau khi quay về từ confirm.
      clearEmployeeAddRestoreFlag();
    } else if (isEditMode) {
      // gọi API lấy employee detail theo employeeId,
      // nếu API thành công thì bind dữ liệu lên form,
      // nếu API lỗi hoặc không tồn tại dữ liệu thì xử lý theo luồng lỗi của màn edit.
      reset(createEmptyEmployeeFormValues());
    } else {
      // Add mode: khi không có id trên router thì để trống toàn bộ hạng mục nhập.
      reset(createEmptyEmployeeFormValues());
    }
  }, [employeeId, reset]);

  useEffect(() => {
    let active = true;

    // Gọi song song 2 API master data và trả danh sách về form để bind vào dropdown.
    // Option rỗng ở đầu combobox được render bên component nên hook chỉ quản lý dữ liệu.
    const fetchMasterData = async () => {
      const [departmentResult, certificationResult] = await Promise.allSettled([
        getDepartments(),
        getCertifications(),
      ]);

      // Chặn setState nếu effect đã bị hủy khi người dùng rời màn hình.
      if (!active) {
        return;
      }

      // Nếu API master data lỗi thì gom message để hiển thị
      // ngay dưới header của màn hình add.
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

      // Nếu cả hai API thành công thì message sẽ là chuỗi rỗng.
      // Nếu có lỗi, message sẽ được render ngay dưới header ở component.
      setErrorMessage(errors.join(' '));
    };

    fetchMasterData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Trong add mode, nếu người dùng bỏ chọn chứng chỉ thì xóa các field phụ thuộc
    // để dữ liệu trên màn hình quay về đúng trạng thái chưa chọn 資格.
    if (certificationId !== '') {
      return;
    }

    setValue('certificationStartDate', null);
    setValue('certificationEndDate', null);
    setValue('score', '');
  }, [certificationId, setValue]);

  // Trước khi sang confirm cần lưu lại:
  // 1. Dữ liệu form gốc để có thể quay về edit tiếp.
  // 2. Dữ liệu đã format để hiển thị ở màn confirm.
  const onConfirm = handleSubmit((values) => {
    const draft = toEmployeeAddDraft(values);

    // Tìm tên phòng ban và tên chứng chỉ từ master data để hiển thị ở màn confirm.
    const selectedDepartment = departments.find(
      (department) => String(department.departmentId) === draft.departmentId
    );
    const selectedCertification = certifications.find(
      (certification) => String(certification.certificationId) === draft.certificationId
    );

    saveEmployeeAddDraft(draft);
    saveEmployeeConfirmData({
      employeeLoginId: draft.employeeLoginId,
      departmentName: selectedDepartment?.departmentName ?? '',
      employeeName: draft.employeeName,
      employeeNameKana: draft.employeeNameKana,
      employeeBirthDate: formatDisplayDate(draft.employeeBirthDate),
      employeeEmail: draft.employeeEmail,
      employeeTelephone: draft.employeeTelephone,
      certificationName: selectedCertification?.certificationName ?? '',
      certificationStartDate: formatDisplayDate(draft.certificationStartDate),
      certificationEndDate: formatDisplayDate(draft.certificationEndDate),
      score: draft.score,
    });

    // Chuyển sang màn confirm sau khi đã lưu xong draft và dữ liệu hiển thị.
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
