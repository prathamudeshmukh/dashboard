import { create } from 'zustand';

import type { TemplateGalleryProps } from '@/types/Template';

type TemplateStore = {

  templateName: string;
  templateDescription: string;
  selectedTemplate: string | null;

  htmlContent: string;
  handlebarsCode: string;
  handlebarsJson: string;
  templateGallery: TemplateGalleryProps[] | null;

  setTemplateName: (name: string) => void;
  setTemplateDescription: (desc: string) => void;
  selectTemplate: (templateId: string) => void;
  setHtmlContent: (content: string) => void;
  setHandlebarsCode: (code: string) => void;
  setHandlebarsJson: (json: string) => void;
  setTemplateGallery: (template: TemplateGalleryProps[]) => void;
  saveTemplate: () => void;
};

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  // Template metadata
  templateName: '',
  templateDescription: '',
  selectedTemplate: null,

  // Template content
  htmlContent: '',
  handlebarsCode: '',
  handlebarsJson: '{}',
  templateGallery: null,

  // Setters
  setTemplateName: name => set({ templateName: name }),
  setTemplateDescription: desc => set({ templateDescription: desc }),

  selectTemplate: templateId => set({ selectedTemplate: templateId }),

  setHtmlContent: content => set({ htmlContent: content }),
  setHandlebarsCode: code => set({ handlebarsCode: code }),
  setHandlebarsJson: json => set({ handlebarsJson: json }),
  setTemplateGallery: template => set({ templateGallery: template }),

  // Actions
  saveTemplate: () => {
    const state = get();
    // API call
    alert(`Template "${state.templateName}" saved successfully!`); // eslint-disable-line no-alert
  },
}));
