import fs from 'node:fs';

export function readHtmlFile(outputHtmlPath: string): string {
  const htmlBuffer = fs.readFileSync(outputHtmlPath);
  return htmlBuffer.toString();
}
