'use client';

import Link from 'next/link';

import { trackEvent } from '@/libs/analytics/trackEvent';

export default function DocsContent() {
  const handleExternalLinkClick = (linkUrl: string, linkText: string, section: string) => {
    trackEvent('docs_external_link_clicked', {
      link_url: linkUrl,
      link_text: linkText,
      section,
    });
  };

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <h1>Templify API Documentation</h1>

      <div id="introduction">
        <h2>🚀 Introduction</h2>
        <p>
          Templify is an API-first SaaS that allows developers to create and manage templates and generate PDFs dynamically.
          This documentation provides the necessary details to integrate the Templify API seamlessly into your application.
        </p>
      </div>

      <div id="authentication">
        <h2>🔐 Authentication</h2>
        <p>
          Templify API requires authentication using a
          {' '}
          <strong>Client ID</strong>
          {' '}
          and
          {' '}
          <strong>Secret ID</strong>
          .
          These credentials must be included in the request headers.
        </p>

        <p>
          To obtain your API key, sign in to your Templify account and navigate to the
          {' '}
          <strong>API Keys</strong>
          {' '}
          section.
        </p>
      </div>

      <div id="api-endpoints">
        <h2>🔗 API Endpoints</h2>

        <h3>
          📄&nbsp;
          <strong>Generate PDF</strong>
        </h3>

        <p><strong>Endpoint:</strong></p>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800"><code>POST /convert/TEMPLATE_ID_HERE</code></pre>

        <p><strong>Headers:</strong></p>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
          <code>
            client_id: CLIENT_ID_HERE
            client_secret: CLIENT_SECRET_HERE
          </code>
        </pre>

        <p><strong>Request Body:</strong></p>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
          <code>
            {`{
  "templateData": {
    "name": "John Doe",
    "invoice_number": "INV-1001",
    "items": [
      { "description": "Item 1", "price": 20 },
      { "description": "Item 2", "price": 30 }
    ]
  }
}`}
          </code>
        </pre>

        <p><strong>Response:</strong></p>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
          <code>
            {`{
  data:PDF_DOC_IN_BYTE_ARRAY
}`}
          </code>
        </pre>
      </div>

      <div id="request-response-examples">
        <h2>📬 Request & Response Examples</h2>

        <p><strong>cURL Example:</strong></p>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
          <code>
            {`curl --location https://api.templify.cloud/convert/YOUR_TEMPLATE_ID_HERE' \\
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
     }'`}
          </code>
        </pre>
      </div>

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

        <p>To preview changes made in dev (unpublished) mode:</p>
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

        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
          <code>
            {`curl --location https://api.templify.cloud/convert/YOUR_TEMPLATE_ID_HERE?devMode=true' \\
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
     }'`}
          </code>
        </pre>

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

      <div id="error-handling">
        <h2>❌ Error Handling</h2>

        <p>Templify API returns standard HTTP status codes.</p>

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
              <td>Request successful.</td>
            </tr>
            <tr>
              <td>400</td>
              <td>Bad Request</td>
              <td>Missing required parameters.</td>
            </tr>
            <tr>
              <td>401</td>
              <td>Unauthorized</td>
              <td>Invalid API key.</td>
            </tr>
            <tr>
              <td>402</td>
              <td>Unauthorized</td>
              <td>Insufficient credits.</td>
            </tr>
            <tr>
              <td>404</td>
              <td>Not Found</td>
              <td>Template ID does not exist.</td>
            </tr>
            <tr>
              <td>500</td>
              <td>Server Error</td>
              <td>An internal server error occurred.</td>
            </tr>
          </tbody>
        </table>

        <p>Example error response:</p>
        <pre className="overflow-x-auto rounded-lg bg-gray-800 p-4 dark:bg-gray-800">
          <code>
            {`{
  "error": "Template ID not found"
}`}
          </code>
        </pre>
      </div>

      <div id="security-best-practices">
        <h2>🔒 Security & Best Practices</h2>
        <ul>
          <li>
            Always
            {' '}
            <strong>store API keys securely</strong>
            {' '}
            and do not expose them in front-end code.
          </li>
          <li>
            Use
            {' '}
            <strong>HTTPS</strong>
            {' '}
            for all API requests to ensure encryption.
          </li>
          <li>
            Implement
            {' '}
            <strong>rate limiting</strong>
            {' '}
            to prevent abuse.
          </li>
        </ul>
      </div>

      <div id="contact-support">
        <h2>📞 Contact & Support</h2>
        <p>For any queries or issues, contact our support team:</p>
        <ul>
          <li>
            <strong>Email:</strong>
            {' '}
            <Link
              href="mailto:support@templify.cloud"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleExternalLinkClick('mailto:support@templify.cloud', 'support@templify.cloud', 'contact-support')}
            >
              support@templify.cloud
            </Link>
          </li>
          <li>
            <strong>API Status:</strong>
            {' '}
            <Link
              href="https://status.templify.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleExternalLinkClick('https://status.templify.cloud', 'API Status', 'contact-support')}
            >
              https://status.templify.cloud
            </Link>
          </li>
        </ul>
      </div>

      <p>Happy coding! 🚀</p>
    </div>
  );
}
