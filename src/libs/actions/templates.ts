'use server';

import { desc, eq } from 'drizzle-orm';

import { templates } from '@/models/Schema';

import { db } from '../DB';

export async function UpsertTemplate({
  templateId,
  description,
  userId,
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
        userId,
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

export async function fetchTemplates(userId: string) {
  try {
    const userTemplates = await db
      .select()
      .from(templates)
      .where(eq(templates.userId, userId))
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

export async function deleteTemplate(templateId: string) {
  try {
    await db.delete(templates).where(eq(templates.id, templateId));
    return { success: true, message: 'Template deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return { success: false, error: error.message };
  }
}
