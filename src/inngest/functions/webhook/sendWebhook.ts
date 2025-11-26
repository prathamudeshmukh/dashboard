import { eq } from 'drizzle-orm';

import { inngest } from '@/inngest/client';
import { db } from '@/libs/DB';
import {
  webhook_deliveries,
  webhook_events,
} from '@/models/Schema';

export const sendWebhook = inngest.createFunction(
  {
    id: 'webhook/send',
    name: 'Send Webhook Event',
  },
  { event: 'webhook/send' },
  async ({ event }) => {
    const { clientId, type, data, meta, endpointId, endpointUrl } = event.data;

    // 2️⃣ Create persistent webhook event
    const eventId = crypto.randomUUID();

    await db.insert(webhook_events).values({
      id: eventId,
      clientId,
      type,
      payload: {
        id: `evt_${crypto.randomUUID().slice(0, 8)}`,
        type,
        created_at: new Date().toISOString(),
        attempt: 1,
        data: data ?? null,
        meta: meta ?? null,
      },
    });

    // 3️⃣ Create delivery tracking entry
    const deliveryId = crypto.randomUUID();
    await db.insert(webhook_deliveries).values({
      id: deliveryId,
      eventId,
      endpointId,
      status: 'pending',
      attempt: 1,
    });

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
