export function extractJsonFromHtml(html: string): Record<string, string> {
  const regex = /\{\{\s*([\w.]+)\s*\}\}/g;
  const json: Record<string, any> = {};
  let match;

  /* eslint-disable no-cond-assign */
  while ((match = regex.exec(html))) {
    const path = match[1]?.split('.');
    let current = json;

    path?.forEach((key, index) => {
      if (index === path?.length - 1) {
        current[key] = 'value';
      } else {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
    });
  }

  return json;
}
