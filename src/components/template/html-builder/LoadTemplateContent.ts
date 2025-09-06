import { fetchTemplateById } from '@/libs/actions/templates';
import type { CreationMethodEnum } from '@/types/Enum';

export async function loadTemplateContent({
  templateId,
  setHtmlContent,
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
  setTemplateDescription: (val: string) => void;
}) {
  if (templateId) {
    try {
      const response = await fetchTemplateById(templateId);
      if (!response?.data) {
        return;
      }

      const content = response.data.templateContent as string;
      const style = response.data.templateStyle as string;

      setHtmlContent(content);
      setHtmlStyle(style);
      setCreationMethod(response.data.creationMethod as CreationMethodEnum);
      setTemplateName(response.data.templateName as string);
      setTemplateDescription(response.data.description as string);
    } catch (error) {
      console.error('Failed to load template for editing:', error);
    }
  }
}
