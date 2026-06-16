# NOWPayments webhook — prueba manual

Edge Function: `gsa_nowpayments_webhook`

URL: `https://<project-ref>.supabase.co/functions/v1/gsa_nowpayments_webhook`

## Formato oficial del IPN (payment callback)

Según [NOWPayments API Postman](https://documenter.getpostman.com/view/7907941/2s93JusNJt#api-documentation), el IPN es un **callback de pago**, no de suscripción:

```json
{
  "payment_id": 123456789,
  "parent_payment_id": 987654321,
  "invoice_id": null,
  "payment_status": "finished",
  "price_amount": 1,
  "price_currency": "usd",
  "pay_amount": 15,
  "actually_paid": 15,
  "order_id": null,
  "purchase_id": "123456789",
  "outcome_amount": 14.8106,
  "outcome_currency": "trx",
  "fee": { "currency": "btc", "depositFee": 0.09, "withdrawalFee": 0, "serviceFee": 0 }
}
```

No incluye `subscription_id`. En pagos de suscripción suele venir `invoice_id` (ej. `5293207980`).

## Cómo enlazamos pago → suscripción GSA

1. **Checkout** (`gsa_subscription_nowpayment_creation`): guarda en la columna JSON `platform_subscription_data`:
   - `platform_subscription_id` (columna dedicada) = ID de suscripción NOWPayments
   - `gsa_checkout_order_id` (dentro del JSON) = `gsa-sub-{id}` donde `{id}` es `gsa.subscriptions.id`
   - `gsa_pending_subscription_dashboard_type_id` = plan que el usuario eligió
2. **Webhook**: solo activa si el pago se verifica contra un `platform_subscription_id` existente.

`gsa_checkout_order_id` **no es una columna** de la tabla; vive dentro de `platform_subscription_data`. Solo existe en checkouts hechos **después** de desplegar la versión actual de `gsa_subscription_nowpayment_creation`. El pago `4414934591` fue con checkout anterior → probablemente **no** lo tiene.

Consulta para comprobarlo:

```sql
SELECT id, platform_subscription_id, platform_subscription_data
FROM gsa.subscriptions
WHERE platform_subscription_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
```

## Precondiciones

1. Desplegar: `supabase functions deploy gsa_nowpayments_webhook --no-verify-jwt`
2. Desplegar: `supabase functions deploy gsa_subscription_nowpayment_creation`
3. SQL: [`docs/sql/gsa_nowpayments_webhook_grants.sql`](../sql/gsa_nowpayments_webhook_grants.sql)
4. Secrets: `NOWPAYMENTS_IPN_SECRET`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_EMAIL`, `NOWPAYMENTS_PASSWORD`
5. IPN URL en dashboard NOWPayments

## Opción A — E2E con pago real

1. Login → contratar plan (nuevo checkout con `order_id` en creación)
2. Completar pago en NOWPayments
3. Verificar `gsa.subscription_payments` y `gsa.subscriptions` activa

## Opción B — IPN simulado (payload oficial)

```bash
node scripts/sign-nowpayments-ipn.mjs \
  --secret "$NOWPAYMENTS_IPN_SECRET" \
  --payment-id 4414934591 \
  --invoice-id 5293207980 \
  --price-amount 1 \
  --outcome-amount 0.98
```

Requiere que exista `platform_subscription_id` en DB y secrets de API para resolver por `invoice_id`.

## Opción C — Reenvío IPN desde NOWPayments

Dashboard → pago → Resend IPN.

## Baja manual

```sql
UPDATE gsa.subscriptions
SET status = 'inactive', updated_at = now()
WHERE id = <subscription_id>;
```
