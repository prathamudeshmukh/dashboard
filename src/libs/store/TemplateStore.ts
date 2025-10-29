import { create } from 'zustand';

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
  templateError: string;
  jsonError: string;

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
  setTemplateError: (error: string) => void;
  setJsonError: (error: string) => void;
  clearErrors: () => void;

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
  creationMethod: CreationMethodEnum.EXTRACT_FROM_PDF,

  successData: null,
  templateError: '',
  jsonError: '',

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

  setTemplateError: error => set({ templateError: error }),
  setJsonError: error => set({ jsonError: error }),
  clearErrors: () => set({ templateError: '', jsonError: '' }),

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
      creationMethod: CreationMethodEnum.EXTRACT_FROM_PDF,
    }),

  clearSuccessData: () => set({ successData: null }),
}));
