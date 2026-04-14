'use client';

import { useRouter } from 'next/navigation';

export default function EmployeeComplete() {
  const router = useRouter();

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title">ユーザの登録が完了しました。 or ユーザの更新が完了しました。 or ユーザの削除が完了しました。</h1>
        <div className="notification-box-btn">
          <button type="button" onClick={() => router.push('/employees/list')} className="btn btn-primary btn-sm">OK</button>
        </div>
      </div>
    </div>
  );
}
