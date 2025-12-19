export const TEMPLIFY_API_SNIPPETS = {
  endpoint: `POST /convert/TEMPLATE_ID_HERE`,

  headers: `client_id: CLIENT_ID_HERE
client_secret: CLIENT_SECRET_HERE`,

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

  cUrlAsync: `curl --location 'https://api.templify.cloud/convert/TEMPLATE_ID?mode=async' \\
--header 'Prefer: respond-async' \\
--header 'client_id: USER_ID' \\
--header 'client_secret: SECRET' \\
--header 'Content-Type: application/json' \\
--data '{ "templateData": { "name": "John" } }'`,

  asyncResponse: `{
  "template_id": "tmpl_123",
  "status": "STARTED",
  "job_id": "01HF4S8JAC9P7Z92K2N7Q3Y3G7"
}`,

  pdfStarted: `{
  "id": "evt_84h1N3P2",
  "type": "pdf.started",
  "created_at": "2025-11-02T10:12:00Z",
  "attempt": 1,
  "meta": {
    "input_data": { "company_name": "ABC Corp" }
  }
}`,

  pdfGenerated: `{
  "id": "evt_84h1N3P2",
  "type": "pdf.generated",
  "created_at": "2025-11-02T10:12:00Z",
  "data": {
    "download_url": "https://cdn.templify.cloud/renders/xyz.pdf",
    "render_ms": 12450,
    "expires_at": "2025-11-03T10:12:00Z"
  }
}`,

  pdfFailed: `{
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
}`,

  webhookSignatureHeader: `x-templify-signature: sha256=<signature>`,

  webhookSecretEnv: `TEMPLIFY_WEBHOOK_SECRET=whsec_4f8d2c9e9a0e6d`,

  verifyWebhook: `const crypto = require("crypto");

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
});`,

  ngrok: `ngrok http 3000

# Example forwarding URL:
https://d7a3-10-1-2-55.ngrok-free.app`,

  ngrokWebhook: `https://YOUR_NGROK_URL/webhooks/templify`,

  previewDevModeExample: `curl --location 'https://api.templify.cloud/convert/YOUR_TEMPLATE_ID_HERE?devMode=true' \\
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
}'`,

  errorResponse: `{
  "error": "Template ID not found"
}`,
} as const;
