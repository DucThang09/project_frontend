'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { EMPLOYEE_MODE_EDIT } from '@/lib/constants/employee';
import {
  VALIDATION_MESSAGES,
  type ValidationMessageCode,
} from '@/lib/constants/messages';

/**
 * Quản lý message và điều hướng của màn hình hoàn tất ADM006.
 *
 * @returns Message hiển thị và handler khi bấm OK.
 */
export function useADM006() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const messageCode = searchParams.get('message') as ValidationMessageCode | null;
  const message =
    messageCode && VALIDATION_MESSAGES[messageCode]
      ? VALIDATION_MESSAGES[messageCode]
      : mode === EMPLOYEE_MODE_EDIT
      ? VALIDATION_MESSAGES.MSG002
      : VALIDATION_MESSAGES.MSG001;

  const onOk = () => {
    router.push('/employees/adm002');
  };

  return {
    message,
    onOk,
  };
}
