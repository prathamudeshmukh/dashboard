export type ExtractionQuality = {
  score: 'good' | 'moderate' | 'limited';
  label: string;
  details: string;
};

function countOccurrences(html: string, tag: string): number {
  return html.split(tag).length - 1;
}

function countStructuralElements(html: string): number {
  const tags = ['<h1', '<h2', '<h3', '<p', '<li', '<section', '<div'];
  return tags.reduce((sum, tag) => sum + countOccurrences(html, tag), 0);
}

function buildDetails(
  variableCount: number,
  tableCount: number,
  score: 'good' | 'moderate' | 'limited',
  hasComplexLayout: boolean,
): string {
  if (score === 'limited') {
    if (hasComplexLayout && variableCount === 0) {
      return 'Complex layout detected — some formatting may need adjustment';
    }
    return 'Minimal content extracted';
  }

  const varLabel = variableCount === 1 ? '1 variable detected' : `${variableCount} variables detected`;
  if (tableCount > 0) {
    return `${varLabel} · table layout`;
  }
  return varLabel;
}

export function computeExtractionQuality(
  htmlContent: string,
  sampleJson: Record<string, string> | null,
): ExtractionQuality {
  const variableCount = sampleJson ? Object.keys(sampleJson).length : 0;
  const htmlLength = htmlContent.length;
  const tableCount = countOccurrences(htmlContent, '<table');
  const imageCount = countOccurrences(htmlContent, '<img');
  const structuralElementCount = countStructuralElements(htmlContent);
  const hasComplexLayout = tableCount > 3 || imageCount > 5;

  if (variableCount >= 5 && htmlLength > 5000) {
    const details = buildDetails(variableCount, tableCount, 'good', hasComplexLayout);
    return { score: 'good', label: 'Good match', details };
  }

  if ((variableCount >= 1 || structuralElementCount > 10) && !(variableCount === 0 && hasComplexLayout)) {
    const details = buildDetails(variableCount, tableCount, 'moderate', hasComplexLayout);
    return { score: 'moderate', label: 'Partial match', details };
  }

  const details = buildDetails(variableCount, tableCount, 'limited', hasComplexLayout);
  return { score: 'limited', label: 'Limited match', details };
}
