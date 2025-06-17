import fs from 'node:fs/promises';

import * as tar from 'tar';

export async function extractAppryseModule(TMP_ZIP_PATH: string, TMP_EXTRACT_DIR: string, logger: any) {
  try {
    try {
      const files = await fs.readdir(TMP_EXTRACT_DIR);
      if (files.length > 0) {
        logger.info(`🟢 Extract directory already exists and is not empty: ${TMP_EXTRACT_DIR}`);
        return; // Skip extraction and deletion
      }
    } catch (err: any) {
      // If directory doesn't exist, continue — no need to log unless it's a different error
      if (err.code !== 'ENOENT') {
        logger.warn(`⚠️ Could not read extract dir: ${TMP_EXTRACT_DIR}`, err);
      }
    }

    logger.info(`📦 Starting extraction of ${TMP_ZIP_PATH} to ${TMP_EXTRACT_DIR}`);

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
