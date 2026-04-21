'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearEmployeeAdd,
  loadEmployeeConfirmData,
  setEmployeeAddRestore,
} from '@/lib/storage/EmployeeInputForm';
import type { EmployeeConfirmData } from '@/types/employee';

export function useADM005() {
  const router = useRouter();
  const [data, setData] = useState<EmployeeConfirmData | null>(null);

  useEffect(() => {
    const confirmData = loadEmployeeConfirmData();

    if (!confirmData) {
      router.replace('/employees/adm004');
      return;
    }

    setData(confirmData);
  }, [router]);

  const handleBack = () => {
    setEmployeeAddRestore();
    router.push('/employees/adm004');
  };

  const handleOk = () => {
    clearEmployeeAdd();
    router.push('/employees/adm006');
  };

  return {
    data,
    handleBack,
    handleOk,
  };
}
