import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BEST_PRACTICES = [
  'Always use HTTPS endpoints to ensure encrypted communication',
  'Verify webhook signatures using the webhook secret to ensure requests are from Templify',
  'Implement proper error handling and retry logic on your endpoint',
  'Return a 200 status code quickly to acknowledge receipt',
  'Process webhook payloads asynchronously to avoid timeouts',
  'Regenerate your webhook secret if you suspect it has been compromised',
];

export const WebhookSecurityBestPractices = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Best Practices</CardTitle>
        <CardDescription>Additional recommendations for webhook security</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {BEST_PRACTICES.map((practice, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>
                {index === 1
                  ? (
                      <>
                        <strong>Verify webhook signatures</strong>
                        {' '}
                        using the webhook secret to ensure requests are from
                        Templify
                      </>
                    )
                  : (
                      practice
                    )}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
