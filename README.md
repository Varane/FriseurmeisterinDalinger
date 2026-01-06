# Ina Dalinger – Friseurmeisterin (Static Storefront)

## Local server
```bash
node scripts/serve.mjs
```
Visit `http://127.0.0.1:4173` for the homepage and `/shop/` for the shop.

## Edit content
Update the JSON files:
- `data/site.json` for homepage copy and contact placeholders.
- `data/products.json` for product catalog entries.

## Stripe checkout
Stripe links are placeholders. Replace each product `paymentLinkUrl` with a real Stripe Payment Link URL to enable “Buy now”.
