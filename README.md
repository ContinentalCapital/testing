# Live Email Sales Dashboard

This project is a small Node.js app that gives you a live dashboard link at `/dashboard`. The dashboard updates automatically through server-sent events whenever a new sales email payload is posted to `/api/email-sales`.

## Run locally

```bash
npm start
```

Open <http://localhost:3000/dashboard>.

## Connect your email sales

Use an email automation or inbound parse service such as Zapier, Make, Mailgun, Postmark, or SendGrid to forward sales emails to:

```text
POST https://your-domain.example/api/email-sales
```

The endpoint accepts JSON, raw text, or form-encoded payloads. It looks for a USD amount such as `$49.00`, plus optional details like `Order #123`, `Customer: Jane`, and `Date: 2026-06-02`.

Example:

```bash
curl -X POST http://localhost:3000/api/email-sales \
  -H 'content-type: application/json' \
  -d '{"from":"store@example.com","subject":"Order #A100","text":"Customer: Jane Doe\nTotal: $49.00"}'
```

You can also add manual sales for testing:

```bash
curl -X POST http://localhost:3000/api/sales \
  -H 'content-type: application/json' \
  -d '{"customer":"Jane Doe","amount":49}'
```

Sales are stored in `data/sales.json` by default. Set `SALES_DATA_PATH=/path/to/sales.json` to change the storage file.
