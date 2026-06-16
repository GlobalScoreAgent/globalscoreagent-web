#!/usr/bin/env node
/**
 * Sign a NOWPayments IPN payload for manual webhook testing (plan Option B).
 *
 * Usage:
 *   node scripts/sign-nowpayments-ipn.mjs --secret YOUR_IPN_SECRET --payload payload.json
 *
 * Or inline (official payment IPN shape):
 *   node scripts/sign-nowpayments-ipn.mjs --secret YOUR_IPN_SECRET \
 *     --payment-id 4414934591 \
 *     --invoice-id 5293207980
 *
 * Then POST with curl (replace project-ref):
 *   curl -X POST "https://<project-ref>.supabase.co/functions/v1/gsa_nowpayments_webhook" \
 *     -H "Content-Type: application/json" \
 *     -H "x-nowpayments-sig: <signature_from_output>" \
 *     -d @payload.json
 */

import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';

function sortObject(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      const value = obj[key];
      result[key] =
        value && typeof value === 'object' && !Array.isArray(value)
          ? sortObject(value)
          : value;
      return result;
    }, {});
}

function signPayload(payload, secret) {
  const sorted = sortObject(payload);
  const message = JSON.stringify(sorted);
  return createHmac('sha512', secret.trim()).update(message).digest('hex');
}

function parseArgs(argv) {
  const args = { payload: null, secret: null, inline: {} };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--secret') args.secret = argv[++i];
    else if (arg === '--payload') args.payload = argv[++i];
    else if (arg === '--payment-id') args.inline.payment_id = Number(argv[++i]);
    else if (arg === '--invoice-id') args.inline.invoice_id = Number(argv[++i]);
    else if (arg === '--order-id') args.inline.order_id = argv[++i];
    else if (arg === '--price-amount') args.inline.price_amount = Number(argv[++i]);
    else if (arg === '--outcome-amount') args.inline.outcome_amount = Number(argv[++i]);
  }
  return args;
}

const { secret, payload: payloadPath, inline } = parseArgs(process.argv);

if (!secret) {
  console.error('Missing --secret (NOWPAYMENTS_IPN_SECRET)');
  process.exit(1);
}

let payload;
if (payloadPath) {
  payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
} else if (Object.keys(inline).length > 0) {
  payload = {
    payment_status: 'finished',
    price_currency: 'usd',
    price_amount: 9,
    outcome_amount: 8.5,
    order_id: null,
    ...inline,
  };
  if (payload.payment_id != null) {
    payload.purchase_id = String(payload.payment_id);
  }
} else {
  console.error('Provide --payload file.json or inline IDs (--payment-id, --subscription-id, ...)');
  process.exit(1);
}

const signature = signPayload(payload, secret);
const body = JSON.stringify(payload, null, 2);

console.log('--- Payload ---');
console.log(body);
console.log('\n--- x-nowpayments-sig ---');
console.log(signature);
