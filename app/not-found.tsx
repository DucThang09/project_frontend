import { redirect } from 'next/navigation';

export default function NotFound() {
  redirect('/employees/system-error?message=ER022');
}
