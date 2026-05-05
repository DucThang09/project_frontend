'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * ADM003.ts, April 13, 2026 tdthang
 */
import { useAuth } from '@/hooks/useAuth';
import EmployeeDetail from '@/components/EmployeeDetail';

export default function EmployeeDetailPage() {
  useAuth();

  return <EmployeeDetail />;
}
