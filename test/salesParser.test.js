const test = require('node:test');
const assert = require('node:assert/strict');
const { parseSalesEmail, aggregateSales } = require('../src/salesParser');

test('parses a sales email amount and metadata', () => {
  const sale = parseSalesEmail({
    from: 'shop@example.com',
    subject: 'Order #A100 paid',
    text: 'Customer: Jane Doe\nDate: 2026-06-02\nTotal: $1,249.50'
  }, new Date('2026-06-02T12:00:00Z'));

  assert.equal(sale.id, 'A100');
  assert.equal(sale.amount, 1249.50);
  assert.equal(sale.customer, 'Jane Doe');
  assert.equal(sale.soldAt, '2026-06-02T00:00:00.000Z');
});

test('returns null for emails without USD sale amounts', () => {
  assert.equal(parseSalesEmail({ subject: 'hello', text: 'no sale here' }), null);
});

test('aggregates daily and lifetime totals', () => {
  const summary = aggregateSales([
    { amount: 10, soldAt: '2026-06-02T10:00:00Z' },
    { amount: 5.25, soldAt: '2026-06-01T10:00:00Z' }
  ], new Date('2026-06-02T18:00:00Z'));

  assert.equal(summary.todayTotal, 10);
  assert.equal(summary.totalRevenue, 15.25);
  assert.equal(summary.salesCount, 2);
  assert.deepEqual(summary.daily, [
    { date: '2026-06-01', total: 5.25 },
    { date: '2026-06-02', total: 10 }
  ]);
});
