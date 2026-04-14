'use client';

import { useAuth } from '@/hooks/useAuth';
import EmployeeComplete from '@/components/employees/EmployeeComplete';

export default function EmployeeCompletePage() {
  useAuth();

  return <EmployeeComplete />;
}
