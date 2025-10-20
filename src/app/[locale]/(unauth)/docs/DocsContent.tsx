/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
'use client';

import { trackEvent } from '@/libs/analytics/trackEvent';

// Wrapper component for clickable code viewers
const ClickableCodeViewer = ({
  value,
  language,
  height = 'h-32',
  codeType,
  section,
}: {
  value: string;
  language: string;
  height?: string;
  codeType: string;
  section: string;
}) => {
  const handleCodeViewerClick = (codeType: string, language: string, section: string) => {
    trackEvent('docs_code_example_copied', {
      example_type: codeType,
      language,
      section,
    });
  };
  return (
    <pre
      className={`${height} cursor-pointer overflow-auto rounded-lg border border-gray-700 bg-gray-900 p-4 transition-all duration-200 hover:border-blue-400 hover:bg-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-blue-400 dark:hover:bg-gray-800`}
      onClick={() => handleCodeViewerClick(codeType, language, section)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCodeViewerClick(codeType, language, section);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-100 dark:text-gray-100">
        {value.trim()}
      </code>
    </pre>
  );
};

export default function DocsContent() {
  const handleApiEndpointClick = (endpoint: string, method: string, section: string) => {
    trackEvent('docs_api_endpoint_clicked', {
      endpoint,
      method,
      section,
    });
  };

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
        <pre
          className="flex h-16 cursor-pointer items-center overflow-auto rounded-lg  bg-gray-900 p-4 transition-all duration-200 hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          onClick={() => handleApiEndpointClick('/convert/TEMPLATE_ID_HERE', 'POST', 'api-endpoints')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleApiEndpointClick('/convert/TEMPLATE_ID_HERE', 'POST', 'api-endpoints');
            }
          }}
          role="button"
          tabIndex={0}
        >
          <code className="font-mono text-sm text-gray-100 dark:text-gray-100">POST /convert/TEMPLATE_ID_HERE</code>
        </pre>

        <p><strong>Headers:</strong></p>
        <ClickableCodeViewer
          value={`{
  "client_id": "CLIENT_ID_HERE",
  "client_secret": "CLIENT_SECRET_HERE"
}`}
          language="json"
          codeType="headers"
          section="api-endpoints"
        />

        <p><strong>Request Body:</strong></p>
        <ClickableCodeViewer
          value={`{
  "templateData": {
    "name": "John Doe",
    "invoice_number": "INV-1001",
    "items": [
      { "description": "Item 1", "price": 20 },
      { "description": "Item 2", "price": 30 }
    ]
  }
}`}
          language="json"
          height="h-48"
          codeType="request-body"
          section="api-endpoints"
        />

        <p><strong>Response:</strong></p>
        <ClickableCodeViewer
          value={`{
  data:PDF_DOC_IN_BYTE_ARRAY
}`}
          language="json"
          height="h-24"
          codeType="response"
          section="api-endpoints"
        />
      </div>

      <div id="request-response-examples">
        <h2>📬 Request & Response Examples</h2>

        <p><strong>cURL Example:</strong></p>
        <ClickableCodeViewer
          value={`curl --location https://api.templify.cloud/convert/YOUR_TEMPLATE_ID_HERE' \\
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
          language="bash"
          height="h-64"
          codeType="curl"
          section="request-response-examples"
        />
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
            When you&nbsp;
            <strong>create a new template</strong>
            , it is&nbsp;
            <strong>automatically published to production</strong>
            .
          </li>
          <li>
            The template becomes immediately available to your&nbsp;
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
                Saves the changes in the&nbsp;
                <strong>unpublished (dev) version</strong>
                .
              </li>
              <li>
                Ideal for testing changes in&nbsp;
                <strong>lower environments</strong>
                {' '}
                (e.g., staging).
              </li>
              <li>
                These changes&nbsp;
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
                Saves and&nbsp;
                <strong>publishes the new version</strong>
                {' '}
                to&nbsp;
                <strong>production</strong>
                .
              </li>
              <li>
                All future PDF generations (including from&nbsp;
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
            Add&nbsp;
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

        <ClickableCodeViewer
          value={`curl --location https://api.templify.cloud/convert/YOUR_TEMPLATE_ID_HERE?devMode=true' \\
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
          language="bash"
          height="h-64"
          codeType="curl-dev"
          section="template-versioning"
        />

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
        <ClickableCodeViewer
          value={`{
  "error": "Template ID not found"
}`}
          language="json"
          height="h-20"
          codeType="error-response"
          section="error-handling"
        />
      </div>

      <div id="security-best-practices">
        <h2>🔒 Security & Best Practices</h2>
        <ul>
          <li>
            Always&nbsp;
            <strong>store API keys securely</strong>
            {' '}
            and do not expose them in front-end code.
          </li>
          <li>
            Use&nbsp;
            <strong>HTTPS</strong>
            {' '}
            for all API requests to ensure encryption.
          </li>
          <li>
            Implement&nbsp;
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
            <a
              href="mailto:support@templify.cloud"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleExternalLinkClick('mailto:support@templify.cloud', 'support@templify.cloud', 'contact-support')}
            >
              support@templify.cloud
            </a>
          </li>
          <li>
            <strong>API Status:</strong>
            {' '}
            <a
              href="https://status.templify.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleExternalLinkClick('https://status.templify.cloud', 'API Status', 'contact-support')}
            >
              https://status.templify.cloud
            </a>
          </li>
        </ul>
      </div>

      <p>Happy coding! 🚀</p>
    </div>
  );
}
