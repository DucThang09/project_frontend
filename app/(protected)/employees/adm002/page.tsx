'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * ADM002, April 13, 2026 tdthang
 */
import { useAuth } from '@/hooks/useAuth';
import EmployeeList from '@/components/EmployeeList';

export default function EmployeeListPage() {
  // Xác thực người dùng trước khi hiển thị màn hình danh sách nhân viên.
  useAuth();

  // Render component danh sách nhân viên trong khu vực đã đăng nhập.
  return <EmployeeList />;
}
