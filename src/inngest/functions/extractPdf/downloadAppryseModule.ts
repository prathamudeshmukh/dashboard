import fs from 'node:fs';

import axios from 'axios';

const APPRYSE_MODULE_SDK_URL = 'https://www.pdftron.com/downloads/StructuredOutputLinux.tar.gz';

export async function downloadAppryseModule(TMP_ZIP_PATH: string, TMP_EXTRACT_DIR: string, logger?: any) {
  logger.info('Checking Appryse module in extract dir:', TMP_EXTRACT_DIR);

  // Check if extracted directory exists and is non-empty
  if (fs.existsSync(TMP_EXTRACT_DIR)) {
    const files = fs.readdirSync(TMP_EXTRACT_DIR);
    if (files.length > 0) {
      logger.info(`🟢 Appryse module already extracted at ${TMP_EXTRACT_DIR}`);
      return;
    }
  }

  const response = await axios.get(APPRYSE_MODULE_SDK_URL, {
    responseType: 'stream',
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(TMP_ZIP_PATH);
    response.data.pipe(writer);
    writer.on('finish', () => resolve(null));
    writer.on('error', reject);
  });
}
