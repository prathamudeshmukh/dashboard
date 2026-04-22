import axios from 'axios';
import type { Logger } from 'inngest/middleware/logger';

type ConvertToHTMLResult = {
  html: string;
  sampleJson: Record<string, string> | null;
};

export async function convertToHTML(downloadUrl: string, logger: Logger): Promise<ConvertToHTMLResult> {
  try {
    const baseUrl = process.env.PDF_TO_HTML_BASE_URL;
    const token = process.env.PDF_TO_HTML_TOKEN;
    logger.info('Extracting html from pdf');
    const response = await axios.post(
      `${baseUrl}/convert`,
      { pdf_url: downloadUrl, extract_variables: true },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
    );
    logger.info('Conversion completed');
    return {
      html: response.data.html as string,
      sampleJson: (response.data.sample_json as Record<string, string> | null | undefined) ?? null,
    };
  } catch (error) {
    logger.error('Conversion error', error);
    throw error;
  }
}
