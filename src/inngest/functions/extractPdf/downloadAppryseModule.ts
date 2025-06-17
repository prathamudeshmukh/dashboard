import fs from 'node:fs';

import axios from 'axios';

const APPRYSE_MODULE_SDK_URL = 'https://www.pdftron.com/downloads/StructuredOutputLinux.tar.gz';

export async function downloadAppryseModule(TMP_ZIP_PATH: string, logger?: any) {
  logger.info('Checking Appryse module at:', TMP_ZIP_PATH);
  if (fs.existsSync(TMP_ZIP_PATH)) {
    logger.info(`Module already found at ${TMP_ZIP_PATH}`);
    return;
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
