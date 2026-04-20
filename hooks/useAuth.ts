import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '@/lib/auth/token';

/**
 * Hook báº£o vá»‡ cÃ¡c mÃ n hÃ¬nh yÃªu cáº§u Ä‘Äƒng nháº­p.
 */
const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    // Chá»‰ cho vÃ o mÃ n hÃ¬nh báº£o vá»‡ khi cÃ²n token há»£p lá»‡.
    const token = getToken();
    if (!token || isTokenExpired(token?.accessToken)) {
      router.push('/login');
    }
  }, [router]);
};

/**
 * Hook cháº·n ngÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Äƒng nháº­p truy cáº­p láº¡i mÃ n hÃ¬nh login.
 */
const useGuest = () => {
  const router = useRouter();

  useEffect(() => {
    // Náº¿u Ä‘Ã£ Ä‘Äƒng nháº­p rá»“i thÃ¬ khÃ´ng cáº§n á»Ÿ láº¡i mÃ n hÃ¬nh login.
    const token = getToken();
    if (token && !isTokenExpired(token?.accessToken)) {
      router.push('/employees/adm002');
    }
  }, [router]);
};

export { useAuth, useGuest };
