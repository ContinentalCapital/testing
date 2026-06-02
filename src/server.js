const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { URL } = require('node:url');
const { parseSalesEmail, aggregateSales } = require('./salesParser');
const { SalesStore } = require('./store');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const store = new SalesStore(process.env.SALES_DATA_PATH);
const clients = new Set();

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) return JSON.parse(raw);
  if (type.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(raw));
  return { text: raw };
}

async function dashboardPayload() {
  const sales = await store.list();
  return { summary: aggregateSales(sales), sales };
}

async function broadcast() {
  const payload = JSON.stringify(await dashboardPayload());
  for (const res of clients) res.write(`data: ${payload}\n\n`);
}

async function serveStatic(res, pathname) {
  const file = pathname === '/' || pathname === '/dashboard' ? 'index.html' : pathname.slice(1);
  const fullPath = path.join(PUBLIC_DIR, file);
  if (!fullPath.startsWith(PUBLIC_DIR)) return false;
  try {
    const content = await fs.readFile(fullPath);
    const ext = path.extname(fullPath);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream' });
    res.end(content);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return false;
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/sales') {
    return sendJson(res, 200, await dashboardPayload());
  }

  if (req.method === 'GET' && url.pathname === '/api/events') {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive'
    });
    clients.add(res);
    res.write(`data: ${JSON.stringify(await dashboardPayload())}\n\n`);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/email-sales') {
    const payload = await readBody(req);
    const sale = parseSalesEmail({
      from: payload.from || payload.sender,
      subject: payload.subject,
      text: payload.text || payload['body-plain'] || payload.body,
      html: payload.html || payload['body-html']
    });

    if (!sale) {
      return sendJson(res, 422, { error: 'No USD sale amount was found in the email payload.' });
    }

    await store.upsert(sale);
    await broadcast();
    return sendJson(res, 201, { sale, dashboard: await dashboardPayload() });
  }

  if (req.method === 'POST' && url.pathname === '/api/sales') {
    const payload = await readBody(req);
    if (!payload.amount || Number.isNaN(Number(payload.amount))) {
      return sendJson(res, 400, { error: 'amount is required and must be numeric' });
    }
    const now = new Date();
    const sale = {
      id: payload.id || `manual-${now.getTime()}`,
      amount: Number(payload.amount),
      currency: payload.currency || 'USD',
      customer: payload.customer || 'Manual sale',
      source: payload.source || 'manual',
      subject: payload.subject || 'Manual sale',
      soldAt: payload.soldAt ? new Date(payload.soldAt).toISOString() : now.toISOString(),
      receivedAt: now.toISOString()
    };
    await store.upsert(sale);
    await broadcast();
    return sendJson(res, 201, { sale, dashboard: await dashboardPayload() });
  }

  if (req.method === 'GET' && await serveStatic(res, url.pathname)) return;
  sendJson(res, 404, { error: 'Not found' });
}

function createServer() {
  return http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error(error);
      sendJson(res, 500, { error: 'Internal server error' });
    });
  });
}

if (require.main === module) {
  createServer().listen(PORT, () => {
    console.log(`Live sales dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`Forward parsed sales emails to: http://localhost:${PORT}/api/email-sales`);
  });
}

module.exports = { createServer, handleRequest };
