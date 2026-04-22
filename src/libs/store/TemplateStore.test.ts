import { beforeEach, describe, expect, it } from 'vitest';

import { CreationMethodEnum } from '@/types/Enum';

import { useTemplateStore } from './TemplateStore';

describe('TemplateStore', () => {
  beforeEach(() => {
    useTemplateStore.getState().resetTemplate();
  });

  it('defaults creationMethod to TEMPLATE_GALLERY', () => {
    const { creationMethod } = useTemplateStore.getState();

    expect(creationMethod).toBe(CreationMethodEnum.TEMPLATE_GALLERY);
  });

  it('resets creationMethod to TEMPLATE_GALLERY after resetTemplate', () => {
    useTemplateStore.getState().setCreationMethod(CreationMethodEnum.EXTRACT_FROM_PDF);
    useTemplateStore.getState().resetTemplate();

    expect(useTemplateStore.getState().creationMethod).toBe(CreationMethodEnum.TEMPLATE_GALLERY);
  });
});
