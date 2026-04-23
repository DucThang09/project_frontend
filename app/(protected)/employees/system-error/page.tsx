'use client';

import { useAuth } from '@/hooks/useAuth';
import SystemError from '@/components/SystemError';

export default function EmployeeSystemErrorPage() {
  useAuth();

  return <SystemError />;
}
