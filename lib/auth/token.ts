const ACCESS_TOKEN_KEY = 'access_token';
const TOKEN_TYPE_KEY = 'token_type';

// Dùng localStorage để vẫn giữ phiên khi người dùng mở lại bằng URL hoặc tab mới.
function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function storeToken(token: string, tokenType: string) {
  const storage = getStorage();
  storage?.setItem(ACCESS_TOKEN_KEY, token);
  storage?.setItem(TOKEN_TYPE_KEY, tokenType);
}

export function getToken(): { accessToken: string; tokenType: string } | null {
  const storage = getStorage();
  const accessToken = storage?.getItem(ACCESS_TOKEN_KEY);
  const tokenType = storage?.getItem(TOKEN_TYPE_KEY);

  if (accessToken && tokenType) {
    return { accessToken, tokenType };
  }
  return null;
}

export function removeToken() {
  const storage = getStorage();
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(TOKEN_TYPE_KEY);
}

// Giải mã payload của JWT để kiểm tra token còn hạn hay không.
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
