import type { AxiosResponse } from 'axios';
import axios from 'axios';

export const generatePDFBuffer = async (content: string): Promise<ArrayBuffer> => {
  try {
    const baseUrl = process.env.JOB_RUNNER_BASE_URL;
    const token = process.env.JOB_RUNNER_TOKEN;

    const response: AxiosResponse<ArrayBuffer> = await axios.post(
      `${baseUrl}/generate-pdf`,
      { html: content },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
