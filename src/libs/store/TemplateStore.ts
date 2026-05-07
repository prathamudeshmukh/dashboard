import { create } from 'zustand';

import type { ExtractionQuality } from '@/libs/computeExtractionQuality';
import { CreationMethodEnum, EditorTypeEnum } from '@/types/Enum';
import type { TemplateGalleryProps, TemplateSuccessData } from '@/types/Template';

type TemplateStore = {

  templateName: string;
  templateDescription: string;
  selectedTemplate: string | null;

  htmlContent: string;
  htmlStyle: string;
  htmlTemplateJson: string;
  handlebarsCode: string;
  handlebarTemplateJson: string;
  templateGallery: TemplateGalleryProps[] | null;

  creationMethod: CreationMethodEnum;
  activeTab: string;

  successData: TemplateSuccessData | null;
  extractionQuality: ExtractionQuality | null;

  setTemplateName: (name: string) => void;
  setTemplateDescription: (desc: string) => void;
  selectTemplate: (templateId: string) => void;
  setHtmlContent: (content: string) => void;
  setHtmlStyle: (htmlStyle: string) => void;
  setHtmlTemplateJson: (json: string) => void;
  setHandlebarsCode: (code: string) => void;
  setHandlebarTemplateJson: (json: string) => void;
  setTemplateGallery: (template: TemplateGalleryProps[]) => void;
  setActiveTab: (tab: string) => void;
  setCreationMethod: (method: CreationMethodEnum) => void;

  setSuccessData: (data: TemplateSuccessData) => void;
  clearSuccessData: () => void;
  setExtractionQuality: (quality: ExtractionQuality) => void;

  saveTemplate: () => void;
  resetTemplate: () => void;
};

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  // Template metadata
  templateName: '',
  templateDescription: '',
  selectedTemplate: null,

  // Template content
  htmlContent: '',
  htmlStyle: '',
  htmlTemplateJson: '{}',
  handlebarsCode: '',
  handlebarTemplateJson: '{}',
  templateGallery: null,

  activeTab: EditorTypeEnum.HANDLEBARS,
  creationMethod: CreationMethodEnum.TEMPLATE_GALLERY,

  successData: null,
  extractionQuality: null,
  // Setters
  setTemplateName: name => set({ templateName: name }),
  setTemplateDescription: desc => set({ templateDescription: desc }),

  selectTemplate: templateId => set({ selectedTemplate: templateId }),

  setHtmlContent: content => set({ htmlContent: content }),
  setHtmlStyle: style => set({ htmlStyle: style }),
  setHtmlTemplateJson: json => set({ htmlTemplateJson: json }),
  setHandlebarsCode: code => set({ handlebarsCode: code }),
  setHandlebarTemplateJson: json => set({ handlebarTemplateJson: json }),
  setTemplateGallery: template => set({ templateGallery: template }),
  setActiveTab: tab => set({ activeTab: tab }),
  setCreationMethod: method => set({ creationMethod: method }),

  setSuccessData: (data: TemplateSuccessData) => set({ successData: data }),
  setExtractionQuality: (quality: ExtractionQuality) => set({ extractionQuality: quality }),

  // Actions
  saveTemplate: () => {
    const state = get();
    // API call
    alert(`Template "${state.templateName}" saved successfully!`); // eslint-disable-line no-alert
  },

  resetTemplate: () =>
    set({
      templateName: '',
      templateDescription: '',
      selectedTemplate: null,

      htmlContent: '',
      htmlStyle: '',
      htmlTemplateJson: '{}',
      handlebarsCode: '',
      handlebarTemplateJson: '{}',

      activeTab: EditorTypeEnum.HANDLEBARS,
      creationMethod: CreationMethodEnum.TEMPLATE_GALLERY,
      extractionQuality: null,
    }),

  clearSuccessData: () => set({ successData: null }),
}));
