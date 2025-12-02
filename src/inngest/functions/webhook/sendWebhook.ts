import { eq } from 'drizzle-orm';

import { inngest } from '@/inngest/client';
import { db } from '@/libs/DB';
import {
  webhook_deliveries,
  webhook_events,
} from '@/models/Schema';
import { decrypt } from '@/service/crypto';

export const sendWebhook = inngest.createFunction(
  {
    id: 'webhook/send',
    name: 'Send Webhook Event',
  },
  { event: 'webhook/send' },
  async ({ event, attempt }) => {
    const { clientId, type, data, meta, endpointId, endpointUrl, encryptedSecret } = event.data;

    const decryptedSecret = decrypt(encryptedSecret);

    // 2️⃣ Create persistent webhook event
    const eventId = crypto.randomUUID();
    const payloadObject = {
      id: `evt_${crypto.randomUUID().slice(0, 8)}`,
      type,
      created_at: new Date().toISOString(),
      attempt,
      data: data ?? null,
      meta: meta ?? null,
    };

    await db.insert(webhook_events).values({
      id: eventId,
      clientId,
      type,
      payload: payloadObject,
    });

    // 3️⃣ Create delivery tracking entry
    const deliveryId = crypto.randomUUID();
    await db.insert(webhook_deliveries).values({
      id: deliveryId,
      eventId,
      endpointId,
      status: 'pending',
      attempt,
    });

    // -----------------------------------------------
    // Prepare signature generation
    // -----------------------------------------------
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(decryptedSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(JSON.stringify(payloadObject)),
    );

    const signatureHex = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const signatureHeader = `sha256=${signatureHex}`;

    // 4️⃣ Attempt actual webhook POST
    let status = 'succeeded';
    let lastCode = 200;
    let lastError = null;
    let lastLatency = 0;

    try {
      const start = performance.now();
      const payload = await db.query.webhook_events.findFirst({
        where: eq(webhook_events.id, eventId),
      });

      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-templify-signature': signatureHeader,
          'x-templify-event': type,
        },
        body: JSON.stringify(payload?.payload),
      });

      lastLatency = Math.round(performance.now() - start);
      lastCode = res.status;

      if (!res.ok) {
        status = 'failed';
        lastError = `HTTP ${res.status}`;
      }
    } catch (err: any) {
      status = 'failed_permanent';
      lastError = err.message;
    }

    // 5️⃣ Update delivery with response info
    await db
      .update(webhook_deliveries)
      .set({
        status,
        last_code: lastCode,
        last_error: lastError,
        last_latency_ms: lastLatency,
        updatedAt: new Date(),
      })
      .where(eq(webhook_deliveries.id, deliveryId));

    return { success: status === 'succeeded' };
  },
);
