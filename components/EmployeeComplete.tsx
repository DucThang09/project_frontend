'use client';

import { useRouter } from 'next/navigation';

export default function EmployeeComplete() {
  const router = useRouter();

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title">The employee registration flow is not connected to DB yet.</h1>
        <div className="notification-box-btn">
          <button type="button" onClick={() => router.push('/employees/adm002')} className="btn btn-primary btn-sm">OK</button>
        </div>
      </div>
    </div>
  );
}
