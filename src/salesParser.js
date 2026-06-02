const CURRENCY_AMOUNT = /(?:\$|USD\s*)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i;
const ORDER_ID = /(?:order|sale|invoice|receipt|transaction)\s*(?:#|id|number|no\.?|:)\s*([A-Z0-9-]+)/i;
const CUSTOMER = /(?:customer|buyer|client)\s*:?\s*([^\n\r<]+)/i;
const DATE = /(?:date|sold at|sale date)\s*:?\s*([^\n\r]+)/i;

function toNumber(value) {
  return Number(String(value).replace(/,/g, ''));
}

function parseDate(value, fallback = new Date()) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? fallback : parsed;
}

function parseSalesEmail(email, receivedAt = new Date()) {
  const text = [email.subject, email.text, email.html]
    .filter(Boolean)
    .join('\n')
    .replace(/<[^>]*>/g, ' ');

  const amountMatch = text.match(CURRENCY_AMOUNT);
  if (!amountMatch) {
    return null;
  }

  const orderMatch = text.match(ORDER_ID);
  const customerMatch = text.match(CUSTOMER);
  const dateMatch = text.match(DATE);
  const saleDate = parseDate(dateMatch?.[1], receivedAt);

  return {
    id: orderMatch?.[1] || `email-${receivedAt.getTime()}`,
    amount: toNumber(amountMatch[1]),
    currency: 'USD',
    customer: customerMatch?.[1]?.trim() || 'Unknown customer',
    source: email.from || 'email',
    subject: email.subject || 'Sales email',
    soldAt: saleDate.toISOString(),
    receivedAt: receivedAt.toISOString()
  };
}

function aggregateSales(sales, now = new Date()) {
  const todayKey = now.toISOString().slice(0, 10);
  const totalsByDay = new Map();
  let todayTotal = 0;

  for (const sale of sales) {
    const day = new Date(sale.soldAt).toISOString().slice(0, 10);
    totalsByDay.set(day, (totalsByDay.get(day) || 0) + sale.amount);
    if (day === todayKey) todayTotal += sale.amount;
  }

  const daily = [...totalsByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total: Number(total.toFixed(2)) }));

  return {
    today: todayKey,
    todayTotal: Number(todayTotal.toFixed(2)),
    totalRevenue: Number(sales.reduce((sum, sale) => sum + sale.amount, 0).toFixed(2)),
    salesCount: sales.length,
    daily
  };
}

module.exports = { parseSalesEmail, aggregateSales };
