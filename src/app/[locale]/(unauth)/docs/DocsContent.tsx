import Link from 'next/link';

import { CodeSnippet } from '@/components/CodeSnippet';

const CODE = {
  endpoint: `POST /convert/TEMPLATE_ID_HERE`,
  headers: `client_id: CLIENT_ID_HERE, client_secret: CLIENT_SECRET_HERE`,
  requestBody: `{
  "templateData": {
    "name": "John Doe",
    "invoice_number": "INV-1001",
    "items": [
      { "description": "Item 1", "price": 20 },
      { "description": "Item 2", "price": 30 }
    ]
  }
}`,
  response: `{
  data: PDF_DOC_IN_BYTE_ARRAY
}`,
  cUrlExample: `curl --location 'https://api.templify.cloud/convert/YOUR_TEMPLATE_ID_HERE' \\
  --header 'client_id: USER_ID_HERE' \\
  --header 'client_secret: CLIENT_SECRET_HERE' \\
  --header 'Content-Type: application/json' \\
  --header 'Cookie: NEXT_LOCALE=en' \\
  --data '{
    "templateData": {
      "name": "John Doe",
      "invoice_number": "INV-1001",
      "items": [
        { "description": "Item 1", "price": 20 }, 
        { "description": "Item 2", "price": 30 }
      ]
    }
  }'`,
  previewDevModeExample: `curl --location 'https://api.templify.cloud/convert/YOUR_TEMPLATE_ID_HERE?devMode=true' \\
  --header 'client_id: USER_ID_HERE' \\
  --header 'client_secret: CLIENT_SECRET_HERE' \\
  --header 'Content-Type: application/json' \\
  --header 'Cookie: NEXT_LOCALE=en' \\
  --data '{
    "templateData": {
      "name": "John Doe",
      "invoice_number": "INV-1001",
      "items": [
        { "description": "Item 1", "price": 20 }, 
        { "description": "Item 2", "price": 30 }
      ]
    }
  }'`,
  errorResponse: `{
  "error": "Template ID not found"
}`,
};

export default function DocsContent() {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <h1>Templify API Documentation</h1>

      {/* INTRODUCTION */}
      <div id="introduction">
        <h2>🚀 Introduction</h2>
        <p>
          Templify is an API-first SaaS that allows developers to create and manage templates, generate PDFs dynamically,
          and integrate powerful asynchronous workflows using webhooks.
          This documentation provides everything you need to start using the Templify API.
        </p>
      </div>

      {/* AUTHENTICATION */}
      <div id="authentication">
        <h2>🔐 Authentication</h2>
        <p>
          Templify API requires authentication using both a
          {' '}
          <strong>Client ID</strong>
          {' '}
          {' '}
          and a
          {' '}
          <strong>Client Secret</strong>
          .
          These must be included in every API request via headers.
        </p>

        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
          {`client_id: CLIENT_ID_HERE
client_secret: CLIENT_SECRET_HERE`}
        </pre>

        <p>
          You can generate & manage your API keys from the
          {' '}
          <strong>API Keys</strong>
          {' '}
          section of your dashboard.
        </p>
      </div>

      {/* GENERATE PDF */}
      <div id="api-endpoints">
        <h2>🔗 API Endpoints</h2>

        <h3>
          📄
          <strong>Generate PDF</strong>
        </h3>

        <p><strong>Endpoint:</strong></p>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800"><code>{CODE.endpoint}</code></pre>

        <p><strong>Headers:</strong></p>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
          <code>{CODE.headers}</code>
        </pre>

        <p><strong>Request Body:</strong></p>
        <CodeSnippet value={CODE.requestBody} lineNumbers={false} />

        <p><strong>Response:</strong></p>
        <CodeSnippet value={CODE.response} lineNumbers={false} />
      </div>

      {/* REQUEST EXAMPLES */}
      <div id="request-response-examples">
        <h2>📬 Request & Response Examples</h2>

        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4">
          {`curl --location 'https://api.templify.cloud/convert/YOUR_TEMPLATE_ID' \\
--header 'client_id: USER_ID_HERE' \\
--header 'client_secret: CLIENT_SECRET_HERE' \\
--header 'Content-Type: application/json' \\
--data '{
  "templateData": {
     "name": "John Doe",
     "invoice_number": "INV-1001",
     "items": [
       { "description": "Item 1", "price": 20 },
       { "description": "Item 2", "price": 30 }
     ]
  }
}'`}
        </pre>
      </div>

      {/* ASYNC PDF GENERATION */}
      <div id="async-pdf-generation">
        <h2>⚡ Asynchronous PDF Generation</h2>

        <p>
          Templify supports asynchronous PDF generation, allowing long-running documents to be processed in the background.
        </p>

        <h3>How to trigger async mode</h3>
        <p>You can request async processing using either:</p>

        <ul>
          <li>
            <strong>Header:</strong>
            {' '}
            <code>Prefer: respond-async</code>
          </li>
          <li>
            <strong>Query param:</strong>
            {' '}
            <code>?mode=async</code>
          </li>
        </ul>

        <h3>Example (async mode)</h3>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          {`curl --location 'https://api.templify.cloud/convert/TEMPLATE_ID?mode=async' \\
--header 'Prefer: respond-async' \\
--header 'client_id: USER_ID' \\
--header 'client_secret: SECRET' \\
--header 'Content-Type: application/json' \\
--data '{ "templateData": { "name": "John" } }'`}
        </pre>

        <h3>Async Response</h3>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          {`{
  "template_id": "tmpl_123",
  "status": "STARTED",
  "job_id": "01HF4S8JAC9P7Z92K2N7Q3Y3G7"
}`}
        </pre>
      </div>

      {/* WEBHOOK CONFIG */}
      <div id="webhooks">
        <h2>📡 Webhooks for Async PDFs</h2>

        <p>
          When async mode is used, Templify sends webhook notifications at different stages of PDF generation.
        </p>

        <h3>Supported Events</h3>
        <ul>
          <li><strong>pdf.started</strong></li>
          <li><strong>pdf.generated</strong></li>
          <li><strong>pdf.failed</strong></li>
        </ul>

        <h3>Webhook Example Payloads</h3>

        <h4>📤 pdf.started</h4>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          {`{
  "id": "evt_84h1N3P2",
  "type": "pdf.started",
  "created_at": "2025-11-02T10:12:00Z",
  "attempt": 1,
  "meta": {
    "input_data": { "company_name": "ABC Corp" }
  }
}`}
        </pre>

        <h4>📤 pdf.generated</h4>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          {`{
  "id": "evt_84h1N3P2",
  "type": "pdf.generated",
  "created_at": "2025-11-02T10:12:00Z",
  "data": {
    "download_url": "https://cdn.templify.cloud/renders/xyz.pdf",
    "render_ms": 12450,
    "expires_at": "2025-11-03T10:12:00Z"
  }
}`}
        </pre>

        <h4>📤 pdf.failed</h4>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          {`{
  "id": "evt_84h1N3P3",
  "type": "pdf.failed",
  "data": {
    "error": {
      "code": "PDF_GENERATION_FAILED",
      "message": "Error generating PDF: HTML validation failed",
      "details": null
    },
    "render_ms": 350
  },
  "meta": {
    "template_id": "tmpl_999",
    "job_id": "job_8r9sm1a3",
    "input_data": { "company_name": "ABC Corp" }
  }
}`}
        </pre>
      </div>

      {/* SIGNATURE VALIDATION */}
      <div id="signature">
        <h2>🔏 Webhook Signature Verification</h2>

        <h3>🔑 Getting Your Webhook Secret</h3>

        <p>
          Each webhook endpoint in Templify is secured using a unique
          <strong> webhook secret</strong>
          .
        </p>

        <p>
          This secret is
          {' '}
          <strong>automatically generated</strong>
          {' '}
          by Templify when you add
          a webhook URL from the dashboard.
        </p>

        <ul>
          <li>
            Go to
            {' '}
            <strong>Settings → Webhooks</strong>
          </li>
          <li>
            Add a new webhook endpoint URL
          </li>
          <li>
            Copy the generated
            {' '}
            <strong>Webhook Secret</strong>
          </li>
        </ul>

        <p>
          You must store this secret securely on your server and use it to validate
          incoming webhook requests.
        </p>

        <p>
          Example:
        </p>

        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          <code>
            TEMPLIFY_WEBHOOK_SECRET=whsec_4f8d2c9e9a0e6d
          </code>
        </pre>

        <p>
          👉 You can manage your webhook endpoints and secrets from here:
        </p>

        <p>
          <Link
            href="dashboard/settings/webhooks"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Open Webhook Settings
          </Link>
        </p>

        <p>Every webhook request includes the header:</p>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">{`x-templify-signature: sha256=<signature>`}</pre>

        <p>You should validate the signature on your server:</p>

        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          {`const crypto = require("crypto");

app.post("/webhooks/templify", (req, res) => {
  const signature = req.headers["x-templify-signature"];
  const payload = JSON.stringify(req.body);
  const secret = process.env.TEMPLIFY_WEBHOOK_SECRET;

  const expectedSignature =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return res.status(200).send("OK");
  }

  res.status(401).send("Invalid signature");
});`}
        </pre>
      </div>

      {/* TESTING WITH NGROK */}
      <div id="ngrok">
        <h2>🧪 Testing Webhooks Locally (ngrok)</h2>

        <p>You can test webhooks locally using ngrok:</p>

        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          {`ngrok http 3000

# Example forwarding URL:
https://d7a3-10-1-2-55.ngrok-free.app`}
        </pre>

        <p>Use this URL as your Webhook URL in Templify dashboard:</p>

        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          https://YOUR_NGROK_URL/webhooks/templify
        </pre>
      </div>

      {/* TEMPLATE VERSIONING (FROM ORIGINAL DOC) */}
      <div id="template-versioning">
        <h2>📦 Template Versioning</h2>

        <p>
          Templify supports
          {' '}
          <strong>template versioning</strong>
          {' '}
          so you can safely test, stage, and publish updates without
          affecting live production templates.
        </p>

        <h3>🚀 Default Behavior</h3>
        <ul>
          <li>New templates are automatically published.</li>
          <li>Used immediately by all generate PDF requests.</li>
        </ul>

        <h3>🛠 Updating Templates</h3>
        <ol>
          <li>
            <strong>Update (Save Only)</strong>
            {' '}
            — stores changes in dev mode.
          </li>
          <li>
            <strong>Update & Publish</strong>
            {' '}
            — pushes changes to production.
          </li>
        </ol>

        <h3>🧪 Previewing Dev Mode Templates</h3>

        <p>
          Use
          <code>?devMode=true</code>
          {' '}
          to preview unpublished templates.
        </p>

        <CodeSnippet value={CODE.previewDevModeExample} language="shell" />

        <h3>✅ Production PDF Generation (Default Behavior)</h3>

        <p>
          When you call the
          {' '}
          <strong>/convert</strong>
          {' '}
          API without
          {' '}
          <strong>devMode=true</strong>
          , Templify will
          {' '}
          <strong>always use the latest published version</strong>
          {' '}
          of the template.
        </p>
      </div>

      {/* ERROR HANDLING */}
      <div id="error-handling">
        <h2>❌ Error Handling</h2>

        <table>
          <thead>
            <tr>
              <th>Status Code</th>
              <th>Meaning</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>200</td>
              <td>OK</td>
              <td>Success</td>
            </tr>
            <tr>
              <td>400</td>
              <td>Bad Request</td>
              <td>Missing parameters</td>
            </tr>
            <tr>
              <td>401</td>
              <td>Unauthorized</td>
              <td>Invalid credentials</td>
            </tr>
            <tr>
              <td>402</td>
              <td>Insufficient credits</td>
              <td>Credit balance too low</td>
            </tr>
            <tr>
              <td>404</td>
              <td>Not Found</td>
              <td>Template not found</td>
            </tr>
            <tr>
              <td>500</td>
              <td>Server Error</td>
              <td>Unexpected error</td>
            </tr>
          </tbody>
        </table>

        <p>Example error response:</p>
        <CodeSnippet value={CODE.errorResponse} lineNumbers={false} />
      </div>

      {/* SECURITY */}
      <div id="security-best-practices">
        <h2>🔒 Security & Best Practices</h2>
        <ul>
          <li>Store API keys securely.</li>
          <li>Never expose secrets to frontend code.</li>
          <li>Use HTTPS for all requests.</li>
          <li>Use signature verification for all webhook requests.</li>
        </ul>
      </div>

      {/* CONTACT */}
      <div id="contact-support">
        <h2>📞 Contact & Support</h2>
        <p>Need help? We're here for you.</p>
        <ul>
          <li>
            <strong>Email:</strong>
            {' '}
            <Link href="mailto:support@templify.cloud">support@templify.cloud</Link>
          </li>
          <li>
            <strong>API Status:</strong>
            {' '}
            <Link href="https://status.templify.cloud" target="_blank">
              https://status.templify.cloud
            </Link>
          </li>
        </ul>
      </div>

      <p>Happy coding! 🚀</p>
    </div>
  );
}
