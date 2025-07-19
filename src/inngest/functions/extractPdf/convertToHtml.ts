import axios from 'axios';

export async function convertToHTML(downloadUrl: string, pdfId: string, logger: any) {
  try {
    const baseUrl = process.env.JOB_RUNNER_BASE_URL;
    const token = process.env.JOB_RUNNER_TOKEN;
    logger.info('Extracting html from pdf');
    const response = await axios.post(
      `${baseUrl}/extract-html`,
      { downloadUrl, pdfId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
    );
    return response.data.htmlContent;
  } catch (error) {
    console.error('Error Fetching Extracted PDF content:', error);
    throw error;
  }
}
