import http from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';

const customer = {
  customerId: 53168,
  custId: 53168,
  cusNme: 'Thilini Wathsala',
  custNme: 'Thilini Wathsala',
  instId: 2,
  lgnNme: 'LWTEST,52988',
};

const tradingAccounts = [
  { tradingAccName: 'trade1', exchange: 'TDWL', tradingAccId: 56448, cashAccId: 54362, custodianType: '0', status: 2, isDefaultAccount: true },
  { tradingAccName: 'trade2', exchange: 'TDWL', tradingAccId: 56449, cashAccId: 54363, custodianType: '0', status: 2, isDefaultAccount: false },
  { tradingAccName: 'Jadwa custody', exchange: 'TDWL', tradingAccId: 1000016011, cashAccId: 54364, custodianType: '1', status: 2, isDefaultAccount: false },
];

const cashAccounts = [
  { cashAccName: 'cash1', cashAccId: 54362, curr: 'SAR', isMar: false, isMutualFundAcc: false, invAccNo: '119113310018', trnLmt: 10000000, buyLmt: 100000000, sellLmt: 100000000, isDefaultAccount: true, ibanNo: 'SA4430100119113310018' },
  { cashAccName: 'cash2', cashAccId: 54363, curr: 'SAR', isMar: false, isMutualFundAcc: false, invAccNo: '119113310025', trnLmt: 10000000, buyLmt: 100000000, sellLmt: 100000000, isDefaultAccount: false, ibanNo: 'SA4930100119113310025' },
  { cashAccName: 'custody-cash', cashAccId: 54364, curr: 'SAR', isMar: false, isMutualFundAcc: false, invAccNo: '119113310032', trnLmt: 10000000, buyLmt: 100000000, sellLmt: 100000000, isDefaultAccount: false, ibanNo: 'SA5430100119113310032' },
];

let orders = [
  makeOrder({ clOrdId: '250323000000071', ordNo: '250323000000071', price: 1.6, ordQty: 1500, ordSts: '2' }),
  makeOrder({ clOrdId: '250323000000051', origClOrdId: '250323000000041', ordNo: '250323000000041', price: 2.6, ordQty: 1800, ordSts: '2' }),
  makeOrder({ clOrdId: '250323000000061', ordNo: '250323000000061', price: 1.6, ordQty: 1500, ordSts: '2' }),
];

const sessions = new Map();

function nowStamp() {
  const date = new Date();
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}${String(date.getUTCHours()).padStart(2, '0')}${String(date.getUTCMinutes()).padStart(2, '0')}${String(date.getUTCSeconds()).padStart(2, '0')}`;
}

function today() {
  return nowStamp().slice(0, 8);
}

function token(prefix = 'trade') {
  return `dummy-${prefix}-${randomUUID()}`;
}

function priceToken() {
  return `MUBASHER/mock-${randomUUID()}`;
}

function withReqId(payload) {
  return { ...payload, unqReqId: randomUUID() };
}

function makeOrder(overrides = {}) {
  const clOrdId = overrides.clOrdId ?? `${today()}${String(Math.floor(Math.random() * 999999)).padStart(9, '0')}`;
  return {
    tradingAccId: overrides.tradingAccId ?? 56448,
    cashAccId: overrides.cashAccId ?? 54362,
    ordCatgry: 1,
    exg: overrides.exg ?? 'TDWL',
    symbol: overrides.symbol ?? '1010',
    price: Number(overrides.price ?? 1.6),
    curr: 'SAR',
    ordQty: Number(overrides.ordQty ?? 1500),
    clOrdId,
    origClOrdId: overrides.origClOrdId ?? clOrdId,
    ordNo: overrides.ordNo ?? clOrdId,
    ordSts: overrides.ordSts ?? 'M',
    ordTyp: overrides.ordTyp ?? '2',
    ordSide: overrides.ordSide ?? '1',
    netOrdVal: Number(((overrides.price ?? 1.6) * (overrides.ordQty ?? 1500) + 2.68).toFixed(2)),
    tif: overrides.tif ?? 0,
    brokerCommission: 2.33,
    exgCom: 0,
    brokerVat: 0.35,
    exgVat: 0,
    vatAmount: 0.35,
    comsn: 2.33,
    avgPrice: Number(overrides.price ?? 1.6),
    ordAvgCst: Number((Number(overrides.price ?? 1.6) + 0.00179).toFixed(5)),
    cumQty: overrides.ordSts === '2' ? Number(overrides.ordQty ?? 1500) : 0,
    lvQty: overrides.ordSts === '2' ? 0 : Number(overrides.ordQty ?? 1500),
    canAmend: null,
    canCancel: null,
    minFillQty: overrides.minQty ?? 100,
    disQty: overrides.disQty ?? 0,
    lstUptdTme: nowStamp(),
    mktCode: overrides.marketCode ?? 'MAIN',
    statusText: overrides.statusText ?? '',
    crdTime: nowStamp(),
    execId: null,
    ltPrice: null,
    ltShare: null,
    remoteClOrdID: overrides.remoteClOrdID ?? null,
    remoteOrigClOrdID: null,
  };
}

function getSession(req) {
  const tradeToken = req.headers.tradetoken || req.headers.tradeToken;
  return tradeToken ? sessions.get(String(tradeToken)) : null;
}

function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    sendJson(res, 401, withReqId({ msgType: 0, errorCode: 1, errorMessage: 'User Session Not Found' }));
    return null;
  }
  return session;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, tradeToken',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, CONNECT, PATCH',
    'Access-Control-Max-Age': '3600',
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { __invalidJson: raw };
  }
}

function login(body, res) {
  if (!body.lgnNme || body.__invalidJson) {
    sendJson(res, 200, withReqId({ msgType: 1, authSts: 0, tradeToken: null, refreshToken: null, customerId: 0, instId: 0, rejResn: 'Missing or invalid encrypted lgnNme' }));
    return;
  }
  const tradeToken = token('trade');
  const refreshToken = token('refresh');
  const session = { ...customer, tradeToken, refreshToken, issuedAt: Date.now(), expiresAt: Date.now() + 600000 };
  sessions.set(tradeToken, session);
  sessions.set(refreshToken, session);
  sendJson(res, 200, withReqId({
    msgType: 1,
    authSts: 1,
    tradeToken,
    customerId: customer.customerId,
    cusNme: customer.cusNme,
    lstLgnTme: nowStamp(),
    priceToken: priceToken(),
    rejResn: null,
    refreshToken,
    tokenRefreshInt: 600,
    wsKey: null,
    instId: customer.instId,
  }));
}

function refresh(req, body, res) {
  const session = requireSession(req, res);
  if (!session) return;
  if (!body.refreshToken || !sessions.has(String(body.refreshToken))) {
    sendJson(res, 200, withReqId({ msgType: 3, authSts: -1, tradeToken: null, refreshToken: null }));
    return;
  }
  const tradeToken = token('trade');
  const refreshToken = token('refresh');
  sessions.delete(session.tradeToken);
  sessions.delete(session.refreshToken);
  const next = { ...session, tradeToken, refreshToken, issuedAt: Date.now(), expiresAt: Date.now() + 600000 };
  sessions.set(tradeToken, next);
  sessions.set(refreshToken, next);
  sendJson(res, 200, withReqId({ msgType: 3, authSts: 1, tradeToken, refreshToken }));
}

function route(req, body, res) {
  const path = new URL(req.url ?? '/', `http://${req.headers.host}`).pathname;

  if (req.method === 'OPTIONS') return sendJson(res, 204, {});
  if (req.method === 'GET' && path === '/health') return sendJson(res, 200, { ok: true, service: 'DFN LWAPI mock backend', time: new Date().toISOString() });
  if (req.method !== 'POST') return sendJson(res, 405, { errorCode: 405, errorMessage: 'Only POST is supported for LWAPI demo endpoints' });

  if (path === '/Auth/Login') return login(body, res);
  if (path !== '/Auth/Login' && !['/health'].includes(path) && !requireSession(req, res)) return;

  switch (path) {
    case '/Auth/Refresh': return refresh(req, body, res);
    case '/Auth/Logout': {
      const tradeToken = req.headers.tradetoken;
      if (tradeToken) sessions.delete(String(tradeToken));
      return sendJson(res, 200, withReqId({ msgType: 402, status: 1 }));
    }
    case '/Auth/Verify': return sendJson(res, 200, withReqId({ isAuthenticated: true, name: customer.cusNme, cusId: customer.customerId, issuedAt: Date.now() - 10000, expiresAt: Date.now() + 590000, msgType: 468 }));
    case '/Auth/OTP': return sendJson(res, 200, withReqId({ msgType: 406, status: body.otp ? 1 : 0, rejResn: body.otp ? null : 'OTP is required in mock mode' }));
    case '/Customer/Profile': return sendJson(res, 200, withReqId({ msgType: 0, custNme: customer.cusNme, custId: customer.customerId, lastLogin: nowStamp(), priceToken: priceToken() }));
    case '/Customer/Details': return sendJson(res, 200, withReqId({ msgType: 6, tradingAccounts, cashAccounts }));
    case '/Customer/BuyingPower': return sendJson(res, 200, withReqId({ msgType: 46, cashAccId: body.cashAccId ?? 54362, buyPwr: 44377968, balance: 47414566, openBuyBlock: 0, odLmt: 0, marLmt: '500000.0', cashTopupAmnt: 0, curr: 'SAR', cashForWith: 44377968, blkAmt: 2500000, penSet: 0, payAmt: 536598, rcbl: 0, rapv: 6700000, unrealSales: 0, groupBuyingPower: 0, isMar: false, symbolMarginability: body.symbol ? 1 : 0, marginZeroPercent: 0, margin25Percent: 0, margin50Percent: 0, margin75Percent: 0, margin100Percent: 0, marBlk: 0, marDue: 0 }));
    case '/Customer/Holdings': return sendJson(res, 200, withReqId({ msgType: 4, holdings: [{ tradingAccId: body.tradingAccId ?? 56448, exg: 'TDWL', symbol: '1010', avgCst: 1.60179, avgPrice: 1.6, qty: 6700, owndQty: 6700, avaiQtyForSell: 6700, avaiQty: 6700, payQty: 0, recQty: 6700, pendSell: 0, pendBuy: 0, curr: 'SAR', lstUpdate: `${today()}073005000`, netReceivable: 0, isDisplay: 1, pldQty: 0, wAvgPrice: 1.6, weightedAvgCost: 1.60179, realizedGainLost: 0, mktPri: 20, ltp: 0, instruTyp: 0, unrealizedGainLossPct: 0, unrealizedGainLoss: 0 }] }));
    case '/Onboarding/Customer/Availability': return sendJson(res, 200, withReqId({ msgType: 335, status: 1, available: true, nic: body.nic ?? null, channel: body.channel ?? 79 }));
    case '/Order/List': return sendJson(res, 200, withReqId({ msgType: 23, ordCatgry: null, ordLst: orders.filter((order) => !body.tradingAccId || Number(order.tradingAccId) === Number(body.tradingAccId)) }));
    case '/Order/Executions': return sendJson(res, 200, withReqId({ msgType: 48, executions: [{ clOrdId: body.clOrdId, remoteClOrdID: body.remoteClOrdID, execId: randomUUID(), symbol: '1010', exg: 'TDWL', lastPx: 1.6, lastQty: 100, execTime: nowStamp() }] }));
    case '/Order/New': {
      const order = makeOrder({ ...body, ordSts: 'M' });
      orders = [order, ...orders];
      return sendJson(res, 200, withReqId({ msgType: 2, order }));
    }
    case '/Order/Update': {
      const order = makeOrder({ ...body, ordSts: 'Q', origClOrdId: body.clOrdId });
      orders = [order, ...orders];
      return sendJson(res, 200, withReqId({ msgType: 15, order }));
    }
    case '/Order/Cancel': return sendJson(res, 200, withReqId({ msgType: 16, order: makeOrder({ ...body, ordSts: '4', statusText: 'Cancelled by mock backend' }) }));
    case '/Order/Commission': return sendJson(res, 200, withReqId({ msgType: 47, commission: { exg: body.exg ?? 'TDWL', symbol: body.symbol ?? '1010', ordQty: body.ordQty ?? 1500, price: body.price ?? 1.6, comsn: 2.33, exgCom: 0, brokerCommission: 2.33, otherCommission: 0, vatAmount: 0.35, brokerVat: 0.35, exgVat: 0 } }));
    case '/Order/Search': return sendJson(res, 200, withReqId({ msgType: 24, ordLst: orders.filter((order) => !body.symbol || order.symbol === body.symbol) }));
    default: return sendJson(res, 404, withReqId({ errorCode: 404, errorMessage: `Mock route not found: ${path}` }));
  }
}

const server = http.createServer(async (req, res) => {
  try {
    route(req, await readBody(req), res);
  } catch (error) {
    sendJson(res, 500, withReqId({ errorCode: 500, errorMessage: error instanceof Error ? error.message : 'Unknown mock backend error' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`DFN LWAPI mock backend running at http://localhost:${PORT}`);
});
