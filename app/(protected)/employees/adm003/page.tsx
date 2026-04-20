'use client';

import { useAuth } from '@/hooks/useAuth';
import EmployeeDetail from '@/components/EmployeeDetail';

export default function EmployeeDetailPage() {
  useAuth();

  return <EmployeeDetail />;
}
