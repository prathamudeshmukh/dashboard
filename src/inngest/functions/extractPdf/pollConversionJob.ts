import axios from 'axios';

type PollResult =
  | { status: 'pending' | 'processing'; pagesDone: number; pagesTotal: number }
  | { status: 'done'; html: string; sampleJson: Record<string, string> | null; pagesDone: number; pagesTotal: number }
  | { status: 'failed'; error: string };

export async function pollConversionJob(jobId: string): Promise<PollResult> {
  const baseUrl = process.env.PDF_TO_HTML_BASE_URL;
  const token = process.env.PDF_TO_HTML_TOKEN;

  const response = await axios.get(`${baseUrl}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10_000,
  });

  const data = response.data;

  if (data.status === 'failed') {
    return { status: 'failed', error: data.error as string };
  }

  if (data.status === 'done') {
    return {
      status: 'done',
      pagesDone: data.pages_done as number,
      pagesTotal: data.pages_total as number,
      html: data.html as string,
      sampleJson: (data.sample_json as Record<string, string> | null | undefined) ?? null,
    };
  }

  return {
    status: data.status as 'pending' | 'processing',
    pagesDone: data.pages_done as number,
    pagesTotal: data.pages_total as number,
  };
}
