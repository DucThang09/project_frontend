'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEmployeeDetail } from '@/lib/api/employee.api';
import {
  clearEmployeeDetailId,
  loadEmployeeDetailId,
  saveEmployeeDetailId,
} from '@/lib/storage/employee-detail';
import type { EmployeeDetail } from '@/types/employee';

function formatDate(value: string | null): string {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return '';
  }

  return `${year}/${month}/${day}`;
}

export function useADM003() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetail | null>(
    null
  );

  useEffect(() => {
    let active = true;

    const fetchEmployeeDetail = async () => {
      const employeeId = loadEmployeeDetailId();

      if (!employeeId || !/^\d+$/.test(employeeId)) {
        clearEmployeeDetailId();
        router.push('/employees/system-error');
        return;
      }

      try {
        const response = await getEmployeeDetail(employeeId);

        if (
          !active ||
          response.code !== 200 ||
          !response.employee
        ) {
          clearEmployeeDetailId();
          router.push('/employees/system-error');
          return;
        }

        setEmployeeDetail(response.employee);
      } catch {
        clearEmployeeDetailId();
        router.push('/employees/system-error');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchEmployeeDetail();

    return () => {
      active = false;
    };
  }, [router]);

  const onEdit = () => {
    if (!employeeDetail) {
      router.push('/employees/system-error');
      return;
    }

    saveEmployeeDetailId(employeeDetail.employeeId);
    router.push('/employees/adm004');
  };

  const onBack = () => {
    clearEmployeeDetailId();
    router.push('/employees/adm002');
  };

  return {
    loading,
    employeeDetail,
    onEdit,
    onBack,
    formatDate,
  };
}
