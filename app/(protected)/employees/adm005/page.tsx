'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * ADM005.ts, April 13, 2026 tdthang
 */
import { useAuth } from '@/hooks/useAuth';
import EmployeeConfirm from '@/components/EmployeeConfirm';
/**
 * Trang xác nhận thông tin nhân viên trước khi thêm mới hoặc cập nhật. Sử dụng hook useAuth để kiểm tra quyền truy cập của người dùng.
 * @returns 
 */
export default function EmployeeConfirmPage() {
  useAuth();
  return <EmployeeConfirm />;
}
