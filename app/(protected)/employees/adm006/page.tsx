'use client';
//Comment đầu file
import { useAuth } from '@/hooks/useAuth';
import EmployeeComplete from '@/components/EmployeeComplete';

export default function EmployeeCompletePage() {
  useAuth();

  return <EmployeeComplete />;
}
