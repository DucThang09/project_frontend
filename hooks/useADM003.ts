'use client';
//Comment đầu file
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteEmployee, getEmployeeDetail } from '@/lib/api/employee.api';
import { VALIDATION_MESSAGES } from '@/lib/constants/messages';
import type { EmployeeDetail } from '@/types/employee';

/**
 * Định dạng ngày theo dạng yyyy/MM/dd để hiển thị trên màn hình chi tiết.
 *
 * @param value Chuỗi ngày dạng yyyy-MM-dd, yyyy/MM/dd hoặc null.
 * @returns Chuỗi ngày đã định dạng hoặc chuỗi rỗng nếu dữ liệu không hợp lệ.
 */
function formatDate(value: string | null): string {
  if (!value) {
    return '';
  }

  const separator = value.includes('/') ? '/' : '-';
  const [year, month, day] = value.split(separator);
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
  const searchParams = useSearchParams();
  const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetail | null>(
    null
  );
  const employeeId = searchParams.get('employeeId');

  /**
   * Lấy thông tin chi tiết nhân viên theo employeeId trên URL khi màn hình ADM003 được mở.
   */
  useEffect(() => {
    const fetchEmployeeDetail = async () => {
      // Nếu không có employeeId trên URL hoặc employeeId không phải dạng số thì chuyển sang màn hình system error.
      if (!employeeId || !/^\d+$/.test(employeeId)) {
        router.push('/employees/system-error');
        return;
      }
      try {
        // Gọi API lấy chi tiết nhân viên theo employeeId trên URL.
        const response = await getEmployeeDetail(employeeId);

        // API không thành công hoặc không trả về nhân viên thì chuyển sang màn system error.
        if (response.code !== 200 || !response.employee) {
          //lây message lỗi từ API và lưu vào sessionStorage để màn hình system error hiển thị thông báo lỗi phù hợp.
          router.push('/employees/system-error');
          return;
        }

        // Lưu dữ liệu chi tiết để component hiển thị.
        setEmployeeDetail(response.employee);
      } catch {
        // Lỗi gọi API thì chuyển sang màn hình system error.
        router.push('/employees/system-error');
      }
    };

    fetchEmployeeDetail();
  }, [employeeId, router]);

  /**
   * Điều hướng sang màn hình chỉnh sửa ADM004 với employeeId hiện tại trên URL.
   */
  const onEdit = () => { //onEdit chuyển thành handleEdit
    // Nếu chưa có dữ liệu chi tiết thì chuyển sang màn hình system error.
    if (!employeeDetail) {
      router.push('/employees/system-error');
      return;
    }

    router.push(`/employees/adm004?employeeId=${employeeDetail.employeeId}`);
  };

  /**
   * Xác nhận và xóa nhân viên hiện tại.
   */
  const onDelete = async () => {
    // Không có nhân viên nào để xóa thì chuyển sang màn hình system error.
    if (!employeeDetail) {
      router.push('/employees/system-error');
      return;
    }

    // Hủy thao tác nếu người dùng không đồng ý xóa.
    if (!window.confirm(VALIDATION_MESSAGES.MSG004)) {
      return;
    }

    try {
      // Gọi API xóa nhân viên theo ID đang hiển thị trên màn ADM003.
      const response = await deleteEmployee(String(employeeDetail.employeeId));

      // API không thành công hoặc không trả message thì chuyển sang system error.
      if (response.code !== 200 || !response.message?.code) {
        //lây message lỗi từ API và lưu vào sessionStorage để màn hình system error hiển thị thông báo lỗi phù hợp.
        router.push('/employees/system-error');
        return;
      }

      router.push(`/employees/adm006?message=${response.message.code}`);
    } catch {
      // Lỗi khi gọi API thì chuyển sang system error.
      router.push('/employees/system-error');
    }
  };

  /**
   * Quay lại màn hình danh sách ADM002.
   */
  const onBack = () => {
    router.push('/employees/adm002');
  };

  /**
   * Trả về dữ liệu cần thiết cho màn hình chi tiết nhân viên.
   */
  return {
    employeeDetail,
    onEdit,
    onDelete,
    onBack,
    formatDate,
  };
}
