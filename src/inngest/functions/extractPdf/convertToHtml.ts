import axios from 'axios';

export async function convertToHTML(downloadUrl: string, logger: any) {
  try {
    const baseUrl = process.env.JOB_RUNNER_BASE_URL;
    const token = process.env.JOB_RUNNER_TOKEN;
    logger.info('Extracting html from pdf');
    const response = await axios.post(
      `${baseUrl}/convert`,
      { pdf_url: downloadUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 240000,
      },
    );
    logger.info('Response', response);
    return response.data.html;
  } catch (error) {
    console.error('Error Fetching Extracted PDF content:', error);
    throw error;
  }
}
