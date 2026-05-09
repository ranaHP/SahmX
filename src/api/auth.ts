import type { AuthResponse } from '../types/api';
import { sendApiRequest, sessionFromAuth } from './client';
import { useAppStore } from '../store/appStore';

export async function loginClassic(lgnNme: string) {
  const { data, result } = await sendApiRequest({
    id: 'auth-login-classic', name: 'Trade Authentication – Classic', method: 'POST', endpoint: '/Auth/Login', requiresAuth: false,
    body: { msgType: 1, lgnNme },
  });
  const auth = data as AuthResponse;
  if (auth.authSts === 1 || auth.authSts === 9) useAppStore.getState().setSession(sessionFromAuth(auth, lgnNme));
  return { auth, result };
}

export async function refreshTradeToken() {
  const session = useAppStore.getState().session;
  const { data, result } = await sendApiRequest({
    id: 'auth-refresh', name: 'Refresh Token - Classic', method: 'POST', endpoint: '/Auth/Refresh', requiresAuth: true,
    body: { msgType: 3, refreshToken: session?.refreshToken ?? '' },
  });
  const auth = data as AuthResponse;
  if (auth.authSts === 1 && session) useAppStore.getState().setSession({ ...session, tradeToken: String(auth.tradeToken ?? session.tradeToken), refreshToken: String(auth.refreshToken ?? session.refreshToken), lastRefreshAt: Date.now() });
  return { auth, result };
}

export async function verifyTradeToken() {
  const { data, result } = await sendApiRequest({
    id: 'auth-verify', name: 'Token Verification', method: 'POST', endpoint: '/Auth/Verify', requiresAuth: true,
    body: { msgType: 468 },
  });
  return { verification: data, result };
}

export async function logoutTrade() {
  const session = useAppStore.getState().session;
  const { data, result } = await sendApiRequest({
    id: 'auth-logout', name: 'Logout Service', method: 'POST', endpoint: '/Auth/Logout', requiresAuth: true,
    body: { msgType: 402, customerId: session?.customerId ?? '' },
  });
  const auth = data as AuthResponse;
  if (auth.status === 1) useAppStore.getState().clearSession();
  return { auth, result };
}
