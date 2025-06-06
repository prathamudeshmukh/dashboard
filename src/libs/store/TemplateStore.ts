import { create } from 'zustand';

import { CreationMethodEnum, EditorTypeEnum } from '@/types/Enum';
import type { TemplateGalleryProps, TemplateSuccessData } from '@/types/Template';

type TemplateStore = {

  templateName: string;
  templateDescription: string;
  selectedTemplate: string | null;

  htmlContent: string;
  htmlStyle: string;
  handlebarsCode: string;
  handlebarsJson: string;
  templateGallery: TemplateGalleryProps[] | null;

  creationMethod: CreationMethodEnum;
  activeTab: string;

  successData: TemplateSuccessData | null;

  setTemplateName: (name: string) => void;
  setTemplateDescription: (desc: string) => void;
  selectTemplate: (templateId: string) => void;
  setHtmlContent: (content: string) => void;
  setHtmlStyle: (htmlStyle: string) => void;
  setHandlebarsCode: (code: string) => void;
  setHandlebarsJson: (json: string) => void;
  setTemplateGallery: (template: TemplateGalleryProps[]) => void;
  setActiveTab: (tab: string) => void;
  setCreationMethod: (method: CreationMethodEnum) => void;

  setSuccessData: (data: TemplateSuccessData) => void;
  clearSuccessData: () => void;

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
  handlebarsCode: '',
  handlebarsJson: '{}',
  templateGallery: null,

  activeTab: EditorTypeEnum.VISUAL,
  creationMethod: CreationMethodEnum.EXTRACT_FROM_PDF,

  successData: null,
  // Setters
  setTemplateName: name => set({ templateName: name }),
  setTemplateDescription: desc => set({ templateDescription: desc }),

  selectTemplate: templateId => set({ selectedTemplate: templateId }),

  setHtmlContent: content => set({ htmlContent: content }),
  setHtmlStyle: style => set({ htmlStyle: style }),
  setHandlebarsCode: code => set({ handlebarsCode: code }),
  setHandlebarsJson: json => set({ handlebarsJson: json }),
  setTemplateGallery: template => set({ templateGallery: template }),
  setActiveTab: tab => set({ activeTab: tab }),
  setCreationMethod: method => set({ creationMethod: method }),

  setSuccessData: (data: TemplateSuccessData) => set({ successData: data }),

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
      handlebarsCode: '',
      handlebarsJson: '{}',

      activeTab: EditorTypeEnum.VISUAL,
      creationMethod: CreationMethodEnum.EXTRACT_FROM_PDF,
    }),

  clearSuccessData: () => set({ successData: null }),
}));
