import { create } from 'zustand';

export const useTemplateStore = create((set, get) => ({
  // Template metadata
  templateName: '',
  templateDescription: '',
  selectedTemplate: null,

  // Template content
  htmlContent: '',
  handlebarsCode: '',
  handlebarsJson: '{}',

  // Setters
  setTemplateName: name => set({ templateName: name }),
  setTemplateDescription: desc => set({ templateDescription: desc }),
  setTemplateCategory: category => set({ templateCategory: category }),
  setTemplateTags: tags => set({ templateTags: tags }),
  addTag: tag =>
    set(state => ({
      templateTags: [...state.templateTags, tag],
    })),
  removeTag: tag =>
    set(state => ({
      templateTags: state.templateTags.filter(t => t !== tag),
    })),

  selectTemplate: templateId => set({ selectedTemplate: templateId }),

  setHtmlContent: content => set({ htmlContent: content }),
  setHandlebarsCode: code => set({ handlebarsCode: code }),
  setHandlebarsJson: json => set({ handlebarsJson: json }),

  setTemplateVariables: variables => set({ templateVariables: variables }),
  addVariable: variable =>
    set(state => ({
      templateVariables: [...state.templateVariables, variable],
    })),
  removeVariable: varName =>
    set(state => ({
      templateVariables: state.templateVariables.filter(v => v.name !== varName),
    })),

  setSelectedDataset: datasetId => set({ selectedDataset: datasetId }),

  // Actions
  saveTemplate: () => {
    const state = get();
    // API call
    alert(`Template "${state.templateName}" saved successfully!`); // eslint-disable-line no-alert
  },
}));
