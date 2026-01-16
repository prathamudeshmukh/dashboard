import Link from 'next/link';

import { CodeSnippet } from '@/components/CodeSnippet';

import { TEMPLIFY_API_SNIPPETS as CODE } from './snippets/templifyApiSnippets';

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
          <code>{CODE.headers}</code>
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

        <p><strong>cURL Example:</strong></p>
        <CodeSnippet value={CODE.cUrlExample} language="shell" />
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
            <code>?runMode=async</code>
          </li>
        </ul>

        <h3>Example (async mode)</h3>
        <CodeSnippet value={CODE.cUrlAsync} language="shell" />

        <h3>Async Response</h3>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          <code>{CODE.asyncResponse}</code>
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
          <code>{CODE.pdfStarted}</code>
        </pre>

        <h4>📤 pdf.generated</h4>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          <code>{CODE.pdfGenerated}</code>
        </pre>

        <h4>📤 pdf.failed</h4>
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          <code>{CODE.pdfFailed}</code>
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
            {CODE.webhookSecretEnv}
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
        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          <code>{CODE.webhookSignatureHeader}</code>
        </pre>

        <p>You should validate the signature on your server:</p>

        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          <CodeSnippet value={CODE.verifyWebhook} language="javascript" />
        </pre>
      </div>

      {/* TESTING WITH NGROK */}
      <div id="ngrok">
        <h2>🧪 Testing Webhooks Locally (ngrok)</h2>

        <p>You can test webhooks locally using ngrok:</p>

        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          <code>{CODE.ngrok}</code>
        </pre>

        <p>Use this URL as your Webhook URL in Templify dashboard:</p>

        <pre className="overflow-x-auto rounded bg-gray-800 p-4">
          <code>{CODE.ngrokWebhook}</code>
        </pre>
      </div>

      {/* TEMPLATE VERSIONING (FROM ORIGINAL DOC) */}
      <div id="template-versioning">
        <h2>📦 Template Versioning</h2>

        <p>
          Templify supports
          {' '}
          <strong>template versioning</strong>
          , enabling you to safely develop, test, and deploy updates to your templates without affecting the live (production) version.
        </p>

        <h3>🚀 Default Behavior</h3>
        <ul>
          <li>
            When you
            {' '}
            <strong>create a new template</strong>
            , it is
            {' '}
            <strong>automatically published to production</strong>
            .
          </li>
          <li>
            The template becomes immediately available to your
            {' '}
            <strong>generate PDF</strong>
            {' '}
            API calls (unless in dev mode).
          </li>
        </ul>

        <h3>🛠 Updating Templates</h3>

        <p>When editing a template, you have two options:</p>

        <ol>
          <li>
            <strong>Update (Save Only)</strong>
            <ul>
              <li>
                Saves the changes in the
                {' '}
                <strong>unpublished (dev) version</strong>
                .
              </li>
              <li>
                Ideal for testing changes in
                {' '}
                <strong>lower environments</strong>
                {' '}
                (e.g., staging).
              </li>
              <li>
                These changes
                {' '}
                <strong>do not affect</strong>
                {' '}
                the live template used in production.
              </li>
            </ul>
          </li>
          <li>
            <strong>Update and Publish</strong>
            <ul>
              <li>
                Saves and
                {' '}
                <strong>publishes the new version</strong>
                {' '}
                to
                <strong> production</strong>
                .
              </li>
              <li>
                All future PDF generations (including from
                {' '}
                <strong>generate</strong>
                {' '}
                API) will use this updated version.
              </li>
            </ul>
          </li>
        </ol>

        <h3>🧪 Previewing Unpublished Versions (Dev Mode)</h3>

        <ul>
          <li>
            Add
            {' '}
            <strong>?devMode=true</strong>
            {' '}
            to your preview or generation API calls.
          </li>
          <li>This will render the latest saved (unpublished) version of the template.</li>
        </ul>

        <h3>
          Example&nbsp;
          <strong>curl</strong>
          {' '}
          to preview dev version:
        </h3>

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
