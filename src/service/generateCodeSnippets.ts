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
  // Replace single quotes with double quotes for JSON compatibility in Python/PHP/cURL
  const jsonFormattedSampleData = formattedSampleData.replace(/'/g, '"');

  return {
    javascript: `// Using fetch API
const response = await fetch('${BASE_API_URL}convert/${templateId}?devMode=true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'client_secret': '${secret}', // Ensure comma is here
    'client_id': '${userId}'
  },
  body: JSON.stringify({
    templateData: ${formattedSampleData},
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
    json={
        'templateData': ${jsonFormattedSampleData},
    }
)

# Save the PDF
with open('output.pdf', 'wb') as f:
    f.write(response.content)`,

    php: `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, '${BASE_API_URL}convert/${templateId}?devMode=true');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);

$data = [
    'templateData' => json_decode('${jsonFormattedSampleData}', true), // Decode JSON string
];

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

    curl: `curl -X POST ${BASE_API_URL}convert/${templateId}?devMode=true \\
  -H "Content-Type: application/json" \\
  -H "client_secret: ${secret}" \\
  -H "client_id: ${userId}" \\
  -d '{
    "templateData": ${jsonFormattedSampleData}
  }' \\
  --output output.pdf`,
  };
};
