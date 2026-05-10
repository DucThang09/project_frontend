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
 * Quản lý dữ liệu, message và điều hướng của màn hình xác nhận ADM005.
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
   * Load dữ liệu xác nhận từ session storage khi component mount.
   * Nếu dữ liệu không hợp lệ hoặc không tồn tại thì chuyển hướng đến trang lỗi hệ thống.
   * Nếu đang ở chế độ sửa, gọi API lấy chi tiết nhân viên và kết hợp với dữ liệu session.
   */
  useEffect(() => {
    // Gán dữ liệu xác nhận và thông tin nhân viên vào state.
    const bindConfirmData = (employeeInfo: EmployeeAdd) => {
      setData(employeeInfo);
      setEmployeeData(employeeInfo);
    };
    // Nếu không có dữ liệu trong session thì chuyển hướng đến trang lỗi hệ thống.
    const redirectByInvalidSession = () => {
      clearEmployeeAdd();
      router.push('/employees/system-error');
    };
    // Load dữ liệu xác nhận; mode sửa sẽ kiểm tra thêm dữ liệu chi tiết từ API.
    const loadConfirmData = async () => {
      const employeeInfo = loadEmployeeAdd();
      // Dữ liệu session phải tồn tại và phù hợp với route hiện tại.
      if (!isEmployeeAddSessionForRoute(employeeInfo, mode, employeeId)) {
        redirectByInvalidSession();
        return;
      }
      // Mode sửa cần kiểm tra employeeId và dữ liệu chi tiết trước khi hiển thị confirm.
      if (mode === EMPLOYEE_MODE_EDIT) {
        if (!/^\d+$/.test(employeeId)) {
          redirectByInvalidSession();
          return;
        }
        // Gọi API lấy chi tiết nhân viên; lỗi hoặc thiếu dữ liệu sẽ chuyển sang system error.
        try {
          const response = await getEmployeeDetail(employeeId);
          // Mã trạng thái không OK hoặc thiếu employee thì không thể confirm.
          if (response.code !== HTTP_STATUS_OK || !response.employee) {
            router.push('/employees/system-error');
            return;
          }
          bindConfirmData(employeeInfo);
          return;
        } catch {
          // Lỗi khi gọi API sẽ chuyển hướng đến trang lỗi hệ thống.
          router.push('/employees/system-error');
          return;
        }
      }
      // Mode thêm dùng trực tiếp dữ liệu xác nhận từ session storage.
      bindConfirmData(employeeInfo);
    };
    // Gọi loadConfirmData khi component mount.
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
   * Xử lý sự kiện khi nhấn nút OK trên màn hình xác nhận.
   */
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
      // Mã trạng thái trả về không OK thì chuyển hướng đến trang lỗi hệ thống.
      if (response.code !== HTTP_STATUS_OK) {
        router.push('/employees/system-error');
        return;
      }
      router.push(`/employees/adm006?mode=${mode}`);
    } catch {
      router.push('/employees/system-error');
    } finally {
      // Xóa dữ liệu tạm của luồng add/edit sau khi submit.
      clearEmployeeAdd();
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
