const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com/i/v0/e/';

export async function trackServerEvent(event: string, properties: Record<string, any>) {
  try {
    await fetch(`${POSTHOG_HOST}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
      body: JSON.stringify({
        event,
        properties,
        distinct_id: properties.user_id || 'anonymous',
      }),
    });
  } catch (err) {
    console.error('Failed to send PostHog event:', err);
  }
}
