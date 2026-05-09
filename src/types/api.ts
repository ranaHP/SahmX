export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject { [key: string]: JsonValue | undefined; }

export interface AuthSession {
  tradeToken: string;
  refreshToken: string;
  customerId: string | number;
  instId: string | number;
  cusNme?: string;
  custNme?: string;
  custId?: string | number;
  lastLogin?: string;
  priceToken?: string;
  tokenRefreshInt?: number;
  lstLgnTme?: string;
  loginName?: string;
  savedAt: number;
  lastRefreshAt?: number;
  tradingAccId?: string | number | null;
  cashAccId?: string | number | null;
}

export interface AuthResponse extends JsonObject {
  authSts?: number;
  status?: number;
  rejResn?: string;
  tradeToken?: string;
  refreshToken?: string;
  customerId?: string | number;
  instId?: string | number;
  cusNme?: string;
  custNme?: string;
  custId?: string | number;
  lastLogin?: string;
  priceToken?: string;
  tokenRefreshInt?: number;
  lstLgnTme?: string;
  isAuthenticated?: boolean;
  name?: string;
  cusId?: string | number;
  issuedAt?: number;
  expiresAt?: number;
  errorCode?: number;
  errorMessage?: string;
  unqReqId?: string;
}

export interface DemoAccount {
  id: string;
  customerReference: string;
  tradingAccount: string;
  accountType: string;
  symbolHints?: string;
  lgnNme: string;
}

export type ApiCategory = 'Authentication & Authorization' | 'Customer' | 'Order' | 'Onboarding' | 'Trading / Market features';

export interface CustomerTradingAccount extends JsonObject {
  tradingAccId?: string | number;
  isDefaultAccount?: boolean;
}

export interface CustomerCashAccount extends JsonObject {
  cashAccId?: string | number;
  isDefaultAccount?: boolean;
}

export interface CustomerDetailsResponse extends JsonObject {
  tradingAccounts?: CustomerTradingAccount[];
  cashAccounts?: CustomerCashAccount[];
}

export interface RequestDefinition {
  id: string;
  name: string;
  category: ApiCategory;
  method: 'POST';
  endpoint: string;
  requiresAuth: boolean;
  description: string;
  body: JsonObject;
}

export interface RequestResult {
  id: string;
  requestId: string;
  name: string;
  endpoint: string;
  method: string;
  ok: boolean;
  status?: number;
  responseTimeMs: number;
  timestamp: number;
  requestBody: string;
  responseRaw: string;
  responseJson?: JsonValue;
  errorMessage?: string;
}
