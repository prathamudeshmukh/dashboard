type GenerateCodeSnippetsProps = {
  BASE_API_URL: string;
  templateId: string;
  secret: string;
  userId: string;
  formattedSampleData: string;
};

export const generateCodeSnippets = ({
  BASE_API_URL,
  templateId,
  secret,
  userId,
  formattedSampleData,
}: GenerateCodeSnippetsProps) => {
  // Determine if formattedSampleData is essentially empty JSON
  const isSampleDataEmpty = formattedSampleData === '{}' || formattedSampleData === '';

  // Construct the request body string conditionally
  const jsonFormattedSampleDataForEmbedding = formattedSampleData.replace(/'/g, '"');

  // Request body structure for Python, PHP, cURL
  let pythonPhpCurlRequestBody;
  if (isSampleDataEmpty) {
    pythonPhpCurlRequestBody = '{}'; // Empty JSON object
  } else {
    pythonPhpCurlRequestBody = `{
    "templateData": ${jsonFormattedSampleDataForEmbedding}
  }`;
  }

  // Request body structure for JavaScript (using JSON.stringify)
  let javascriptRequestBodyValue;
  if (isSampleDataEmpty) {
    javascriptRequestBodyValue = '{}'; // An empty object string for stringify
  } else {
    javascriptRequestBodyValue = `templateData: ${formattedSampleData},`; // Original formattedSampleData, as it will be stringified
  }

  return {
    javascript: `// Using fetch API
const response = await fetch('${BASE_API_URL}convert/${templateId}?devMode=true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'client_secret': '${secret}',
    'client_id': '${userId}'
  },
  body: JSON.stringify({
    ${javascriptRequestBodyValue},
  })
});

const pdf = await response.blob();`,

    python: `import requests
import json

response = requests.post(
    '${BASE_API_URL}convert/${templateId}?devMode=true',
    headers={
        'Content-Type': 'application/json',
        'client_secret': '${secret}',
        'client_id': '${userId}'
    },
    json=${isSampleDataEmpty ? '{}' : `{'templateData': ${jsonFormattedSampleDataForEmbedding}}`}
)

# Save the PDF
with open('output.pdf', 'wb') as f:
    f.write(response.content)`,

    php: `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, '${BASE_API_URL}convert/${templateId}?devMode=true');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);

$data = ${isSampleDataEmpty ? '[]' : `['templateData' => json_decode('${jsonFormattedSampleDataForEmbedding}', true)]`};

curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'client_secret: ${secret}',
    'client_id: ${userId}'
]);

$response = curl_exec($ch);
curl_close($ch);

// Save the PDF
file_put_contents('output.pdf', $response);`,

    shell: `curl -X POST ${BASE_API_URL}convert/${templateId}?devMode=true \\
  -H "Content-Type: application/json" \\
  -H "client_secret: ${secret}" \\
  -H "client_id: ${userId}" \\
  -d '${pythonPhpCurlRequestBody}' \\
  --output output.pdf`,
  };
};
