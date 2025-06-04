import * as tar from 'tar';

export async function extractAppryseModule(TMP_ZIP_PATH: string, TMP_EXTRACT_DIR: string) {
  await tar.x({
    file: TMP_ZIP_PATH,
    cwd: TMP_EXTRACT_DIR,
  });
}
