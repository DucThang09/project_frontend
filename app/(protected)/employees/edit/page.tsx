'use client';

import { useAuth } from '@/hooks/useAuth';
import EmployeeEdit from '@/components/employees/EmployeeEdit';

export default function EmployeeEditPage() {
  useAuth();

  return <EmployeeEdit />;
}
