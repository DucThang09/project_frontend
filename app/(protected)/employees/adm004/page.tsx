'use client';
//Comment đầu file
import { useAuth } from '@/hooks/useAuth';
import EmployeeInputForm from '@/components/EmployeeInputForm';

export default function EmployeeEditPage() {
  useAuth();

  return <EmployeeInputForm />;
}
