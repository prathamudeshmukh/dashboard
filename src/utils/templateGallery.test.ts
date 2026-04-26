import { describe, expect, it } from 'vitest';

import type { TemplateGalleryProps } from '@/types/Template';

import { groupTemplatesByTypeKey } from './templateGallery';

function makeTemplate(overrides: Partial<TemplateGalleryProps> & { typeKey: string }): TemplateGalleryProps {
  return {
    id: 'id-1',
    title: 'Invoice Template',
    description: 'An invoice',
    icon: 'FileText',
    color: 'text-blue-600',
    category: 'Finance',
    htmlContent: '<p>invoice</p>',
    handlebarContent: '{{name}}',
    sampleData: null,
    style: null,
    previewHtmlContent: null,
    variantName: null,
    ...overrides,
  };
}

describe('groupTemplatesByTypeKey', () => {
  it('returns empty array for empty input', () => {
    expect(groupTemplatesByTypeKey([])).toEqual([]);
  });

  it('returns one group with two variants when two rows share the same typeKey', () => {
    const templates = [
      makeTemplate({ id: 'v1', typeKey: 'invoice-template', variantName: 'Classic' }),
      makeTemplate({ id: 'v2', typeKey: 'invoice-template', variantName: 'Modern' }),
    ];

    const [group] = groupTemplatesByTypeKey(templates);

    expect(group?.typeKey).toBe('invoice-template');
    expect(group?.variants).toHaveLength(2);
    expect(group?.variants[0]?.id).toBe('v1');
    expect(group?.variants[1]?.id).toBe('v2');
  });

  it('returns two groups for two rows with different typeKeys', () => {
    const templates = [
      makeTemplate({ id: 'v1', typeKey: 'invoice-template' }),
      makeTemplate({ id: 'v2', typeKey: 'resume-template', title: 'Resume Template' }),
    ];

    const groups = groupTemplatesByTypeKey(templates);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.typeKey).toBe('invoice-template');
    expect(groups[1]?.typeKey).toBe('resume-template');
  });

  it('takes type-level fields from the first row in each group', () => {
    const templates = [
      makeTemplate({ id: 'v1', typeKey: 'invoice-template', title: 'Invoice', icon: 'FileText', color: 'text-blue-600' }),
      makeTemplate({ id: 'v2', typeKey: 'invoice-template', title: 'SHOULD-BE-IGNORED', icon: 'X', color: 'red' }),
    ];

    const [group] = groupTemplatesByTypeKey(templates);

    expect(group?.title).toBe('Invoice');
    expect(group?.icon).toBe('FileText');
    expect(group?.color).toBe('text-blue-600');
  });
});
