import axios from 'axios';
import type { Logger } from 'inngest/middleware/logger';

export async function convertToHTML(downloadUrl: string, logger: Logger) {
  try {
    const baseUrl = process.env.PDF_TO_HTML_BASE_URL;
    const token = process.env.PDF_TO_HTML_TOKEN;
    logger.info('Extracting html from pdf');
    const response = await axios.post(
      `${baseUrl}/convert`,
      { pdf_url: downloadUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
    );
    logger.info('Conversion completed');
    return response.data.html;
  } catch (error) {
    logger.error('Conversion error', error);
    console.error('Error Fetching Extracted PDF content:', error);
    throw error;
  }
}
