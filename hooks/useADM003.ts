'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEmployeeDetail } from '@/lib/api/employee.api';
import {
  clearEmployeeDetailId,
  loadEmployeeDetailId,
  saveEmployeeDetailId,
} from '@/lib/storage/employeeDetail';
import type { EmployeeDetail } from '@/types/employee';

/**
 * Định dạng ngày theo dạng yyyy/MM/dd để hiển thị trên màn hình chi tiết.
 *
 * @param value Chuỗi ngày dạng yyyy-MM-dd hoặc null.
 * @returns Chuỗi ngày đã định dạng hoặc chuỗi rỗng nếu dữ liệu không hợp lệ.
 */
function formatDate(value: string | null): string {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return '';
  }

  return `${year}/${month}/${day}`;
}

/**
 * Quản lý dữ liệu màn hình chi tiết nhân viên ADM003.
 *
 * @returns Dữ liệu chi tiết nhân viên của màn hình.
 */
export function useADM003() {
  const router = useRouter();
  const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetail | null>(
    null
  );

  /**
   * lấy thông tin chi tiết nhân viên trong session khi màn hình ADM003 được mở.
   */
  useEffect(() => {
    const fetchEmployeeDetail = async () => {
      // Lấy ID nhân viên đã được lưu ở ADM002 trước khi chuyển sang ADM003.
      const employeeId = loadEmployeeDetailId();

      // Nếu không có ID hoặc ID không phải dạng số thì chuyển sang màn hình system error.
      if (!employeeId || !/^\d+$/.test(employeeId)) {
        clearEmployeeDetailId();
        router.push('/employees/system-error');
        return;
      }

      try {
        // Gọi API lấy chi tiết nhân viên theo ID đã lưu trong sessionStorage.
        const response = await getEmployeeDetail(employeeId);

        // API không thành công hoặc không trả về nhân viên thì chuyên sang màn system error.
        if (response.code !== 200 || !response.employee) {
          clearEmployeeDetailId();
          router.push('/employees/system-error');
          return;
        }

        // Lưu dữ liệu chi tiết để component hiển thị.
        setEmployeeDetail(response.employee);
      } catch {
        // Lỗi gọi API thì xóa session đang lưu và chuyển sang màn hình system error.
        clearEmployeeDetailId();
        router.push('/employees/system-error');
      }
    };

    fetchEmployeeDetail();
  }, [router]);

  /**
   * Lưu lại ID nhân viên hiện tại và điều hướng sang màn hình chỉnh sửa ADM004.
   */
  const onEdit = () => {
    // Nếu chưa có dữ liệu chi tiết thì chuyển sang màn hình system error.
    if (!employeeDetail) {
      router.push('/employees/system-error');
      return;
    }

    // Lưu ID nhân viên hiện tại để màn ADM004 biết đang sửa nhân viên nào.
    saveEmployeeDetailId(employeeDetail.employeeId);

    // Điều hướng sang màn hình chỉnh sửa nhân viên.
    router.push('/employees/adm004');
  };

  /**
   * Xóa session chi tiết đang lưu và quay lại màn hình danh sách ADM002.
   */
  const onBack = () => {
    clearEmployeeDetailId();
    router.push('/employees/adm002');
  };

  /**
   * Trả về dữ liệu cần thiết cho màn hình chi tiết nhân viên.
   */
  return {
    employeeDetail,
    onEdit,
    onBack,
    formatDate,
  };
}
