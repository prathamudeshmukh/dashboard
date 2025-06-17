import fs from 'node:fs/promises';

import * as tar from 'tar';

export async function extractAppryseModule(TMP_ZIP_PATH: string, TMP_EXTRACT_DIR: string, logger: any) {
  try {
    await tar.x({
      file: TMP_ZIP_PATH,
      cwd: TMP_EXTRACT_DIR,
    });

    logger.info(`✅ /Extraction completed: ${TMP_ZIP_PATH}`);

    // Delete the .tar.gz file after successful extraction
    await fs.unlink(TMP_ZIP_PATH);
    logger.info(`🗑️ Deleted archive file: ${TMP_ZIP_PATH}`);
  } catch (error) {
    console.error(`Failed to extract or clean up: ${TMP_ZIP_PATH}`, error);
    throw error;
  }
}
