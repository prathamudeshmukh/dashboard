import { AlertTriangle, Shield } from 'lucide-react';

import { CodeSnippet } from '@/components/CodeSnippet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CODE_EXAMPLES = {
  nodejs: `const crypto = require('crypto');

app.post('/webhooks/templify', (req, res) => {
  const signature = req.headers['x-templify-signature'];
  const payload = JSON.stringify(req.body);
  
  // Your webhook secret from Templify
  const secret = process.env.TEMPLIFY_WEBHOOK_SECRET;
  
  // Compute the expected signature
  const expectedSignature = 'sha256=' + 
    crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  
  // Compare signatures securely
  if (crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )) {
    // Signature is valid - process the webhook
    console.log('Webhook verified:', req.body);
    res.status(200).send('OK');
  } else {
    // Invalid signature - reject the request
    res.status(401).send('Invalid signature');
  }
});`,
  python: `import hmac
import hashlib
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhooks/templify', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Templify-Signature')
    payload = request.get_data()
    
    # Your webhook secret from Templify
    secret = os.environ['TEMPLIFY_WEBHOOK_SECRET']
    
    # Compute the expected signature
    expected_signature = 'sha256=' + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    # Compare signatures securely
    if hmac.compare_digest(signature, expected_signature):
        # Signature is valid - process the webhook
        data = request.get_json()
        print('Webhook verified:', data)
        return 'OK', 200
    else:
        # Invalid signature - reject the request
        return 'Invalid signature', 401`,
  nextjs: `import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-templify-signature');
  const payload = await req.text();
  
  // Your webhook secret from Templify
  const secret = process.env.TEMPLIFY_WEBHOOK_SECRET!;
  
  // Compute the expected signature
  const expectedSignature = 'sha256=' + 
    crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  
  // Compare signatures securely
  if (crypto.timingSafeEqual(
    Buffer.from(signature || ''),
    Buffer.from(expectedSignature)
  )) {
    // Signature is valid - process the webhook
    const data = JSON.parse(payload);
    console.log('Webhook verified:', data);
    return NextResponse.json({ received: true });
  } else {
    // Invalid signature - reject the request
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }
}`,
};

export const WebhookSignatureExamples = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-5" />
          Verifying Webhook Signatures
        </CardTitle>
        <CardDescription>How to verify that webhook requests are genuinely from Templify</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            Each webhook request includes an
            {' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">X-Templify-Signature</code>
            {' '}
            header containing an
            HMAC-SHA256 signature. Verify this signature to ensure the request is authentic.
          </p>
        </div>

        <Tabs defaultValue="nodejs">
          <TabsList>
            <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="nextjs">Next.js</TabsTrigger>
          </TabsList>

          <TabsContent value="nodejs">
            <h4 className="mb-2 text-sm font-semibold">Node.js / Express Example</h4>
            <CodeSnippet value={CODE_EXAMPLES.nodejs} language="javascript" className="max-h-[340px]" />
          </TabsContent>
          <TabsContent value="python">
            <h4 className="mb-2 text-sm font-semibold">Python / Flask Example</h4>
            <CodeSnippet value={CODE_EXAMPLES.python} language="python" className="max-h-[340px]" />
          </TabsContent>
          <TabsContent value="nextjs">
            <h4 className="mb-2 text-sm font-semibold">Next.js API Route Example</h4>
            <CodeSnippet value={CODE_EXAMPLES.nextjs} language="javascript" className="max-h-[340px]" />
          </TabsContent>
        </Tabs>

        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="size-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Important Security Notes</AlertTitle>
          <AlertDescription className="space-y-2 text-amber-700">
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Always use timing-safe comparison functions to prevent timing attacks</li>
              <li>Never log or expose your webhook secret in client-side code</li>
              <li>Store the webhook secret securely in environment variables</li>
              <li>Reject requests with invalid signatures immediately</li>
              <li>Use the raw request body for signature verification (before parsing JSON)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
