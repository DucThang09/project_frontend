'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * ADM004.ts, April 13, 2026 tdthang
 */
import { useAuth } from '@/hooks/useAuth';
import EmployeeInputForm from '@/components/EmployeeInputForm';

export default function EmployeeEditPage() {
  useAuth();

  return <EmployeeInputForm />;
}
