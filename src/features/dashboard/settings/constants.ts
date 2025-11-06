export type WebhookEvent = {
  id: string;
  label: string;
  description: string;
};

export const WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    id: 'pdf.generated',
    label: 'PDF Generated',
    description: 'Triggered when a PDF is successfully generated',
  },
  {
    id: 'pdf.failed',
    label: 'PDF Failed',
    description: 'Triggered when PDF generation fails',
  },
  {
    id: 'pdf.started',
    label: 'PDF Started',
    description: 'Triggered when PDF generation begins',
  },
];

export const WEBHOOK_PAYLOAD_EXAMPLE = `{
  "event": "pdf.generated",
  "timestamp": "2025-03-15T10:30:00Z",
  "data": {
    "template_id": "tpl_abc123",
    "pdf_url": "https://storage.templify.com/pdfs/xyz789.pdf",
    "status": "success",
    "metadata": {
      "pages": 3,
      "size_bytes": 245678
    }
  }
}`;

export const WEBHOOK_SIGNATURE_HEADER = 'X-Templify-Signature';
