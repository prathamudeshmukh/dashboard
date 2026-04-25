import type { TemplateGalleryGroup, TemplateGalleryProps } from '@/types/Template';

export function groupTemplatesByTypeKey(
  templates: TemplateGalleryProps[],
): TemplateGalleryGroup[] {
  const groupMap = new Map<string, TemplateGalleryGroup>();

  for (const t of templates) {
    const existing = groupMap.get(t.typeKey);
    const variant = {
      id: t.id,
      variantName: t.variantName,
      htmlContent: t.htmlContent,
      handlebarContent: t.handlebarContent,
      sampleData: t.sampleData,
      style: t.style,
      previewHtmlContent: t.previewHtmlContent,
    };

    if (existing) {
      existing.variants.push(variant);
    } else {
      groupMap.set(t.typeKey, {
        typeKey: t.typeKey,
        title: t.title,
        description: t.description,
        icon: t.icon,
        color: t.color,
        category: t.category,
        variants: [variant],
      });
    }
  }

  return Array.from(groupMap.values());
}
