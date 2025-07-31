import type { Editor } from 'grapesjs';

import { fetchTemplateById } from '@/libs/actions/templates';
import type { CreationMethodEnum } from '@/types/Enum';

export async function loadTemplateContent({
  editor,
  templateId,
  htmlContent,
  setHtmlContent,
  setHtmlStyle,
  setCreationMethod,
  setTemplateName,
  setTemplateDescription,
  setHtmlTemplateJson,
}: {
  editor: Editor;
  templateId: string | null;
  htmlContent: string;
  setHtmlContent: (val: string) => void;
  setHtmlStyle: (val: string) => void;
  setCreationMethod: (val: CreationMethodEnum) => void;
  setTemplateName: (val: string) => void;
  setTemplateDescription: (val: string) => void;
  setHtmlTemplateJson: (val: string) => void;
}) {
  if (!editor) {
    return;
  }

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
      setHtmlTemplateJson(JSON.stringify(response.data.templateSampleData));
      if (content) {
        editor.setComponents(content);
      }
      if (style) {
        editor.setStyle(style);
      }
    } catch (error) {
      console.error('Failed to load template for editing:', error);
    }
  } else if (htmlContent) {
    editor.setComponents(htmlContent);
  }
}
