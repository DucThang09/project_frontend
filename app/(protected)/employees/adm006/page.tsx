'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * ADM006, April 13, 2026 tdthang
 */
import { useAuth } from '@/hooks/useAuth';
import EmployeeComplete from '@/components/adm006';

export default function EmployeeCompletePage() {
  useAuth();

  return <EmployeeComplete />;
}
