import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '@/lib/auth/token';

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

const useGuest = () => {
    const router = useRouter();
  
    useEffect(() => {
      // Nếu đã đăng nhập rồi thì không cần ở lại màn hình login.
      const token = getToken();
      if (token && !isTokenExpired(token?.accessToken)) {
        router.push('/employees/list');
      }
    }, [router]);
}


export { useAuth, useGuest };
