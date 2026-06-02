const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' });
const todayTotal = document.querySelector('#todayTotal');
const totalRevenue = document.querySelector('#totalRevenue');
const salesCount = document.querySelector('#salesCount');
const salesRows = document.querySelector('#salesRows');
const status = document.querySelector('#status');
const dashboardLink = document.querySelector('#dashboardLink');

function render(payload) {
  todayTotal.textContent = currency.format(payload.summary.todayTotal);
  totalRevenue.textContent = currency.format(payload.summary.totalRevenue);
  salesCount.textContent = payload.summary.salesCount;

  if (!payload.sales.length) {
    salesRows.innerHTML = '<tr><td colspan="4" class="empty">No sales yet. Forward a sales email to <code>/api/email-sales</code>.</td></tr>';
    return;
  }

  salesRows.innerHTML = payload.sales.slice(0, 25).map((sale) => `
    <tr>
      <td>${dateTime.format(new Date(sale.soldAt))}</td>
      <td>${escapeHtml(sale.customer)}</td>
      <td>${escapeHtml(sale.subject)}</td>
      <td class="amount">${currency.format(sale.amount)}</td>
    </tr>
  `).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

async function refresh() {
  const response = await fetch('/api/sales');
  render(await response.json());
}

function connectLiveUpdates() {
  const events = new EventSource('/api/events');
  events.onopen = () => { status.textContent = 'Live'; };
  events.onmessage = (event) => render(JSON.parse(event.data));
  events.onerror = () => {
    status.textContent = 'Reconnecting…';
    setTimeout(refresh, 5000);
  };
}

dashboardLink.addEventListener('click', async (event) => {
  event.preventDefault();
  await navigator.clipboard.writeText(new URL('/dashboard', window.location.origin).href);
  dashboardLink.textContent = 'Copied!';
  setTimeout(() => { dashboardLink.textContent = 'Copy dashboard link'; }, 1800);
});

refresh().then(connectLiveUpdates).catch(() => {
  status.textContent = 'Offline';
});
