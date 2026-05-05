'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * system-error, April 13, 2026 tdthang
 */
import { useAuth } from '@/hooks/useAuth';
import SystemError from '@/components/SystemError';

export default function EmployeeSystemErrorPage() {
  useAuth();

  return <SystemError />;
}
