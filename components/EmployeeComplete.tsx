'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { EMPLOYEE_MODE_EDIT } from '@/lib/constants/employee';
import { VALIDATION_MESSAGES } from '@/lib/constants/messages';

export default function EmployeeComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const message =
    mode === EMPLOYEE_MODE_EDIT
      ? VALIDATION_MESSAGES.MSG002
      : VALIDATION_MESSAGES.MSG001;

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title">{message}</h1>
        <div className="notification-box-btn">
          <button
            type="button"
            onClick={() => router.push('/employees/adm002')}
            className="btn btn-primary btn-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
