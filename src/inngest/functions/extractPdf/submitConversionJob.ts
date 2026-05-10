import axios from 'axios';

type SubmitResult = { jobId: string };

export async function submitConversionJob(downloadUrl: string): Promise<SubmitResult> {
  const baseUrl = process.env.PDF_TO_HTML_BASE_URL;
  const token = process.env.PDF_TO_HTML_TOKEN;

  const response = await axios.post(
    `${baseUrl}/convert/async`,
    { pdf_url: downloadUrl, extract_variables: true, model: 'gpt-4o' },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 10_000,
    },
  );

  if (response.status !== 202) {
    throw new Error(`Unexpected status ${response.status} from /convert/async`);
  }

  return { jobId: response.data.job_id as string };
}
