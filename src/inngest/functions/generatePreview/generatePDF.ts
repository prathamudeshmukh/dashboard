import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';

import { generatePdf } from '@/libs/actions/templates';

export async function generatePDF(templateId: string, logger: any): Promise<string> {
  logger.info('Generating PDF for template', { templateId });

  try {
    // Check available disk space before generation
    const stats = await fs.statfs(tmpdir());
    const freeSpaceGB = (stats.bfree * stats.bavail) / (1024 ** 3);

    logger.info('Disk space check', {
      templateId,
      freeSpaceGB: freeSpaceGB.toFixed(2),
    });

    if (freeSpaceGB < 1) { // Less than 1GB free
      throw new Error(`Insufficient disk space: ${freeSpaceGB.toFixed(2)}GB free`);
    }

    const result = await generatePdf({ templateId });

    if (result.error) {
      throw new Error(`PDF generation failed: ${result.error}`);
    }

    if (!result.pdf) {
      throw new Error('PDF generation returned empty result');
    }

    return result.pdf as string;
  } catch (error) {
    logger.error('PDF generation error', { templateId, error });
    throw error;
  }
}
