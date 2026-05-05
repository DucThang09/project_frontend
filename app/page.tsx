'use client';
/**
 * Copyright(C) 2026 Luvina Software Company
 * Home.ts, April 13, 2026 tdthang
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '@/lib/auth/token';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token.accessToken)) {
      // Đã đăng nhập → chuyển tới trang employees
      router.replace('/employees/list');
    } else {
      // Chưa đăng nhập → chuyển tới trang login
      router.replace('/login');
    }
  }, [router]);

  return null;
}
