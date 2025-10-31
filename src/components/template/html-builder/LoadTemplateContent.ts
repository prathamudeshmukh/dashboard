import { fetchTemplateById } from '@/libs/actions/templates';
import type { CreationMethodEnum } from '@/types/Enum';

export async function loadTemplateContent({
  templateId,
  setHtmlContent,
  setHtmlTemplateJson,
  setHtmlStyle,
  setCreationMethod,
  setTemplateName,
  setTemplateDescription,
}: {
  templateId: string | null;
  setHtmlContent: (val: string) => void;
  setHtmlStyle: (val: string) => void;
  setCreationMethod: (val: CreationMethodEnum) => void;
  setTemplateName: (val: string) => void;
  setHtmlTemplateJson: (val: string) => void;
  setTemplateDescription: (val: string) => void;
}) {
  if (!templateId) {
    return;
  }
  try {
    const response = await fetchTemplateById(templateId);
    if (!response?.data) {
      return;
    }

    const content = response.data.templateContent as string;
    const style = response.data.templateStyle as string;
    const dataSource = JSON.stringify(response.data.templateSampleData);
    const creationMethod = response.data.creationMethod as CreationMethodEnum;
    const templateName = response.data.templateName as string;
    const templateDescription = response.data.description as string;

    setHtmlContent(content);
    setHtmlStyle(style);
    setHtmlTemplateJson(dataSource);
    setCreationMethod(creationMethod);
    setTemplateName(templateName);
    setTemplateDescription(templateDescription);
  } catch (error) {
    console.error('Failed to load template for editing:', error);
  }
}
