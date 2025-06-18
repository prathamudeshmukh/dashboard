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
  const isSampleDataEmpty = formattedSampleData === '{}' || formattedSampleData.trim() === '';

  const jsonFormattedSampleDataForEmbedding = formattedSampleData.replace(/'/g, '"');

  // JavaScript snippet
  const javascript = `// Using fetch API
const response = await fetch('${BASE_API_URL}convert/${templateId}?devMode=true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'client_secret': '${secret}',
    'client_id': '${userId}'
  }${isSampleDataEmpty
    ? ''
    : `,
  body: JSON.stringify({
    templateData: ${formattedSampleData}
  })`}
});

const pdf = await response.blob();`;

  // Python snippet
  const python = `import requests
import json

response = requests.post(
    '${BASE_API_URL}convert/${templateId}?devMode=true',
    headers={
        'Content-Type': 'application/json',
        'client_secret': '${secret}',
        'client_id': '${userId}'
    }${isSampleDataEmpty
      ? ''
      : `,
    json={'templateData': ${jsonFormattedSampleDataForEmbedding}}`}
)

# Save the PDF
with open('output.pdf', 'wb') as f:
    f.write(response.content)`;

  // PHP snippet
  const php = `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, '${BASE_API_URL}convert/${templateId}?devMode=true');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);

${isSampleDataEmpty
  ? ''
  : `$data = ['templateData' => json_decode('${jsonFormattedSampleDataForEmbedding}', true)];
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));`}

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'client_secret: ${secret}',
    'client_id: ${userId}'
]);

$response = curl_exec($ch);
curl_close($ch);

// Save the PDF
file_put_contents('output.pdf', $response);`;

  // cURL snippet
  const shell = `curl -X POST ${BASE_API_URL}convert/${templateId}?devMode=true \\
  -H "Content-Type: application/json" \\
  -H "client_secret: ${secret}" \\
  -H "client_id: ${userId}"${
    isSampleDataEmpty
      ? ''
      : ` \\
  -d '{
    "templateData": ${jsonFormattedSampleDataForEmbedding}
  }'`
  } \\
  --output output.pdf`;

  return {
    javascript,
    python,
    php,
    shell,
  };
};
