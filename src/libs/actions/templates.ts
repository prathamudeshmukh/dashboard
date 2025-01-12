'use server';

import { desc, eq } from 'drizzle-orm';

import { templates } from '@/models/Schema';
import type { Template, UpdateTemplateInput } from '@/types/Template';

import { db } from '../DB';

export async function saveTemplate({
  description,
  userId,
  templateContent,
  templateSampleData,
  templateStyle,
  assets,
  templateType,
}: Template) {
  try {
    await db.insert(templates).values({
      description,
      userId, // FK reference to the users table
      templateContent,
      templateSampleData: JSON.parse(templateSampleData),
      templateStyle,
      assets: JSON.parse(assets),
      templateType,
    });
    return { success: true, message: 'Template saved successfully' };
  } catch (error: any) {
    console.error('Error saving template:', error);
    return { success: false, error: error.message };
  }
}

export async function updateTemplate({
  templateId,
  description,
  templateContent,
  templateStyle,
  templateSampleData,
}: UpdateTemplateInput) {
  try {
    await db
      .update(templates)
      .set({
        ...(description && { description }), // Update only if provided
        templateContent,
        templateStyle,
        templateSampleData,
      })
      .where(eq(templates.id, templateId));

    return { success: true, message: 'Template updated successfully' };
  } catch (error: any) {
    console.error('Error updating template:', error);
    return { success: false, error: error.message };
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
