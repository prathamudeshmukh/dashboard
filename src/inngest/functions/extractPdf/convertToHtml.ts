import axios, { type AxiosResponse } from 'axios';

export async function convertToHTML(downloadUrl: string, logger: any) {
  try {
    const baseUrl = process.env.JOB_RUNNER_BASE_URL;
    const token = process.env.JOB_RUNNER_TOKEN;
    logger.info('Extracting html from pdf');
    const response: AxiosResponse<string> = await axios.post(
      `${baseUrl}/extract-html`,
      { downloadUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error Fetching Extracted PDF content:', error);
    throw error;
  }
}
