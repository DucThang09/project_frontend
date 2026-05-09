'use client';
//Comment đầu file
import { useRouter, useSearchParams } from 'next/navigation';
import {
  VALIDATION_MESSAGES,
  type ValidationMessageCode,
} from '@/lib/constants/messages';
//Comment đầu function
export default function SystemError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageCode = searchParams.get('message') as ValidationMessageCode | null;
  const message =
    messageCode && messageCode in VALIDATION_MESSAGES
      ? VALIDATION_MESSAGES[messageCode]
      : VALIDATION_MESSAGES.ER015;

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
