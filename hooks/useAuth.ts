import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '@/lib/auth/token';

/**
 * Hook bảo vệ các màn hình yêu cầu đăng nhập.
 */
const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    // Chỉ cho vào màn hình bảo vệ khi còn token hợp lệ.
    const token = getToken();
    if (!token || isTokenExpired(token?.accessToken)) {
      router.push('/login');
    }
  }, [router]);
};

/**
 * Hook chặn người dùng đã đăng nhập truy cập lại màn hình login.
 */
const useGuest = () => {
  const router = useRouter();

  useEffect(() => {
    // Nếu đã đăng nhập rồi thì không cần ở lại màn hình login.
    const token = getToken();
    if (token && !isTokenExpired(token?.accessToken)) {
      router.push('/employees/list');
    }
  }, [router]);
};

export { useAuth, useGuest };
