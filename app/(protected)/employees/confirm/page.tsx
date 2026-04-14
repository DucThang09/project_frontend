'use client';

import { useAuth } from '@/hooks/useAuth';
import EmployeeConfirm from '@/components/employees/EmployeeConfirm';

export default function EmployeeConfirmPage() {
  useAuth();

  return <EmployeeConfirm />;
}
