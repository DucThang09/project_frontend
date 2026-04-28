'use client';
//Comment đầu file
import { useRouter } from 'next/navigation';
import { VALIDATION_MESSAGES } from '@/lib/constants/messages';
//Comment đầu function
export default function SystemError() {
  const router = useRouter();

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title">{VALIDATION_MESSAGES.ER015}</h1>
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
