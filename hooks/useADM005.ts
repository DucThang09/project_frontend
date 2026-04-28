'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addEmployee, updateEmployee } from '@/lib/api/employee.api';
import { EMPLOYEE_MODE_EDIT } from '@/lib/constants/employee';
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

/**
 * Hook xử lý màn ADM005.
 * Màn này hiển thị thông tin xác nhận trước khi thêm mới hoặc cập nhật nhân viên.
 */
export function useADM005() {
  const router = useRouter();

  // Dữ liệu dùng để hiển thị lên màn hình xác nhận ADM005.
  const [data, setData] = useState<EmployeeConfirmData | null>(null);

  // Dữ liệu đầy đủ dùng để gọi API thêm mới hoặc cập nhật nhân viên.
  const [employeeData, setEmployeeData] = useState<EmployeeAdd | null>(null);

  // Trạng thái đang submit, dùng để chặn người dùng bấm OK nhiều lần liên tiếp.
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Lấy dữ liệu đã lưu từ ADM004 để hiển thị ở màn xác nhận.
   * Nếu không có dữ liệu thì người dùng không đi đúng luồng, quay lại ADM004.
   */
  useEffect(() => {
    const confirmData = loadEmployeeConfirmData();
    const employeeData = loadEmployeeAdd();

    if (!confirmData || !employeeData) {
      router.replace('/employees/adm004');
      return;
    }

    setData(confirmData);
    setEmployeeData(employeeData);
  }, [router]);

  /**
   * Xử lý khi bấm nút Back ở ADM005.
   * Đánh dấu restore để ADM004 lấy lại dữ liệu người dùng đã nhập trước đó.
   */
  const handleBack = () => {
    setEmployeeAddRestore();
    if (employeeData?.mode === EMPLOYEE_MODE_EDIT && employeeData.employeeId) {
      router.push(`/employees/adm004?employeeId=${employeeData.employeeId}`);
      return;
    }

    router.push('/employees/adm004');
  };

  /**
   * Chuyển dữ liệu form đã lưu sang payload gửi lên API add/update.
   * Payload này dùng chung cấu trúc với request validate ở ADM004.
   */
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

  /**
   * Xử lý khi bấm nút OK ở ADM005.
   * Tùy theo mode mà gọi API thêm mới hoặc cập nhật nhân viên.
   */
  const handleOk = async () => {
    // Chặn submit lặp hoặc submit khi thiếu dữ liệu confirm.
    if (!employeeData || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo payload từ dữ liệu đã lưu trong session.
      const payload = toValidationRequest(employeeData);

      // Có employeeId thì gọi update, ngược lại gọi add.
      const response =
        employeeData.mode === EMPLOYEE_MODE_EDIT && employeeData.employeeId
        ? await updateEmployee(employeeData.employeeId, payload)
        : await addEmployee(payload);

      // Nếu API trả lỗi nghiệp vụ thì chuyển sang màn system error.
      if (response.code !== 200) {
        router.push('/employees/system-error');
        return;
      }

      // Nếu lưu thành công thì xóa dữ liệu tạm và chuyển sang màn hoàn tất ADM006.
      clearEmployeeAdd();
      router.push(`/employees/adm006?mode=${employeeData.mode}`);
    } catch {
      // Nếu gọi API bị lỗi ngoài dự kiến thì chuyển sang màn system error.
      router.push('/employees/system-error');
    } finally {
      // Kết thúc trạng thái submit để mở lại nút OK nếu vẫn ở màn hiện tại.
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
