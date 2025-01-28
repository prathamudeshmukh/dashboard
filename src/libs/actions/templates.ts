'use server';

import { desc, eq } from 'drizzle-orm';

import { generated_templates, templates } from '@/models/Schema';
import type { GeneratedTemplates } from '@/types/Template';

import { db } from '../DB';

export async function UpsertTemplate({
  templateId,
  description,
  email,
  templateName,
  templateContent,
  templateSampleData,
  templateStyle,
  assets,
  templateType,
}: any) {
  if (!description || !templateContent || !templateName) {
    throw new Error('Missing required fields: description, templateContent or templateName.');
  }

  try {
    if (templateId) {
      // Perform update
      await db
        .update(templates)
        .set({
          ...(description && { description }),
          templateContent,
          templateStyle,
          templateSampleData: templateSampleData ? JSON.parse(templateSampleData) : {},
        })
        .where(eq(templates.id, templateId));

      return { success: true, message: 'Template updated successfully' };
    } else {
      // Perform insert
      await db.insert(templates).values({
        description,
        email,
        templateName,
        templateContent,
        templateSampleData: templateSampleData ? JSON.parse(templateSampleData) : {},
        templateStyle,
        assets: assets ? JSON.parse(assets) : null,
        templateType,
      });

      return { success: true, message: 'Template saved successfully' };
    }
  } catch (error: any) {
    console.error(`Error ${templateId ? 'updating' : 'saving'} template:`, error);
    throw new Error(`Failed to ${templateId ? 'update' : 'save'} template: ${error.message}`);
  }
}

export async function fetchTemplates(email: string) {
  try {
    const userTemplates = await db
      .select()
      .from(templates)
      .where(eq(templates.email, email))
      .orderBy(desc(templates.id));
    return { success: true, data: userTemplates };
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchTemplateById(templateId: string) {
  try {
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId));

    if (template.length === 0) {
      throw new Error('Template not found');
    }

    return { success: true, data: template[0] };
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return { success: false, error: error.message };
  }
}

export async function addGeneratedTemplateHistory({
  templateId,
  dataValue,
}: GeneratedTemplates) {
  if (!templateId) {
    throw new Error('Missing templateId');
  }

  try {
    await db.insert(generated_templates).values({
      template_id: templateId,
      data_value: dataValue || null,
    });

    return { message: 'History Added for Generated Template' };
  } catch (error) {
    throw new Error(`Failed to Create History: ${error}`);
  }
}

export async function deleteTemplate(templateId: string) {
  try {
    await db.delete(templates).where(eq(templates.id, templateId));
    return { success: true, message: 'Template deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return { success: false, error: error.message };
  }
}
