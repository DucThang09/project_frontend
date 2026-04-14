'use client';

import { useAuth } from '@/hooks/useAuth';
import EmployeeList from '@/components/employees/EmployeeList';

export default function EmployeeListPage() {
  useAuth();

  return <EmployeeList />;
}
