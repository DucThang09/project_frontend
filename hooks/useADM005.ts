'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * useADM005.ts, April 13, 2026 tdthang
 */
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
} from '@/lib/storage/EmployeeInputForm';
import type {
  EmployeeAdd,
  EmployeeValidationRequest,
} from '@/types/employee';

/**
 * Quản lý dữ liệu, message và điều hướng
 */
export function useADM005() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<EmployeeAdd | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeAdd | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Lấy employeeId và mode từ URL để xác định đang ở chế độ thêm hay sửa.
  const employeeId = searchParams.get('employeeId') || '';
  const mode = employeeId ? EMPLOYEE_MODE_EDIT : EMPLOYEE_MODE_ADD;
  /** 
   * Load dữ liệu xác nhận từ session storage khi component mount. Nếu dữ liệu không hợp lệ hoặc không tồn tại, chuyển hướng đến trang lỗi hệ thống.
   * Nếu đang ở chế độ sửa, gọi API để lấy chi tiết nhân viên và kết hợp với dữ liệu từ session storage để hiển thị thông tin xác nhận. Nếu có lỗi chuyển hướng đến trang lỗi hệ thống.
   */
  useEffect(() => {
    // Hàm để gán dữ liệu xác nhận và thông tin nhân viên vào state.
    const bindConfirmData = (employeeInfo: EmployeeAdd) => {
      setData(employeeInfo);
      setEmployeeData(employeeInfo);
    };
    // Nếu không có dữ liệu trong session thì chuyển hướng đến trang lỗi hệ thống.
    const redirectByInvalidSession = () => {
      clearEmployeeAdd();
      router.push('/employees/system-error');
    };
    // Hàm để load dữ liệu xác nhận. Nếu đang ở chế độ sửa, gọi API để lấy chi tiết nhân viên và kết hợp với dữ liệu từ session storage. Nếu có lỗi chuyển hướng đến trang lỗi hệ thống.
    const loadConfirmData = async () => {
      const employeeInfo = loadEmployeeAdd();
      // Kiểm tra nếu không có dữ liệu trong session hoặc dữ liệu không hợp lệ cho route hiện tại thì chuyển hướng đến trang lỗi hệ thống.
      if (!isEmployeeAddSessionForRoute(employeeInfo, mode, employeeId)) {
        redirectByInvalidSession();
        return;
      }
      // Nếu đang ở chế độ sửa, gọi API để lấy chi tiết nhân viên và kết hợp với dữ liệu từ session storage. Nếu có lỗi chuyển hướng đến trang lỗi hệ thống.
      if (mode === EMPLOYEE_MODE_EDIT) {
        if (!/^\d+$/.test(employeeId)) {
          redirectByInvalidSession();
          return;
        }
        // Gọi API để lấy chi tiết nhân viên. Nếu có lỗi hoặc không có dữ liệu nhân viên trả về, chuyển hướng đến trang lỗi hệ thống. Nếu thành công, gán dữ liệu xác nhận và thông tin nhân viên vào state.
        try {
          const response = await getEmployeeDetail(employeeId);
          // Nếu mã trạng thái không phải là OK hoặc không có dữ liệu nhân viên trả về, chuyển hướng đến trang lỗi hệ thống.
          if (response.code !== HTTP_STATUS_OK || !response.employee) {
            router.push('/employees/system-error');
            return;
          }
          // Nếu có thì lấy dữ liệu từ session storage để hiển thị thông tin xác nhận.
          bindConfirmData(employeeInfo);
          return;
        } catch {// Nếu có lỗi khi gọi API, chuyển hướng đến trang lỗi hệ thống.
          router.push('/employees/system-error');
          return;
        }
      }
      // Nếu đang ở chế độ thêm, gán dữ liệu xác nhận và thông tin nhân viên từ session storage vào state để hiển thị thông tin xác nhận.
      bindConfirmData(employeeInfo);
    };
    // Gọi hàm loadConfirmData khi component mount.
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
  /**
   * Xử lý sự kiện khi nhấn nút "OK" trên màn hình xác nhận. 
   * @returns 
   */
  const handleOk = async () => {
    if (!employeeData || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    //
    try {
      const payload = toValidationRequest(employeeData);
      const response =
        mode === EMPLOYEE_MODE_EDIT && employeeId
          ? await updateEmployee(employeeId, payload)
          : await addEmployee(payload);
      // Nếu mã trạng thái trả về không phải là OK, chuyển hướng đến trang lỗi hệ thống.
      if (response.code !== HTTP_STATUS_OK) {
        router.push('/employees/system-error');
        return;
      }
      router.push(`/employees/adm006?mode=${mode}`);
    } catch {
      router.push('/employees/system-error');
    } finally {
      clearEmployeeAdd();// Xóa dữ liệu tạm của luồng add/edit sau khi submit.
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
