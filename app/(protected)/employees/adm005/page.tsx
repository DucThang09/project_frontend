'use client';
//Comment đầu file
import { useAuth } from '@/hooks/useAuth';
import EmployeeConfirm from '@/components/EmployeeConfirm';

export default function EmployeeConfirmPage() {
  useAuth();

  return <EmployeeConfirm />;
}
