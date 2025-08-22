import { generatePdfCore } from '@/service/generatePdfCore';
import type { GeneratePdfWorkerRequest } from '@/types/PDF/GeneratePDF';

export async function generatePdfWorker(request: GeneratePdfWorkerRequest) {
  return generatePdfCore(request);
}
