'use client';
//Comment đầu file
import { useADM006 } from '@/hooks/useADM006';

//Comment đầu function
export default function EmployeeComplete() {
  const { message, onOk } = useADM006();

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title">{message}</h1>
        <div className="notification-box-btn">
          <button
            type="button"
            onClick={onOk}
            className="btn btn-primary btn-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
