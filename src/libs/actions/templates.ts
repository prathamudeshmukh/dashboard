'use server';

import { desc, eq } from 'drizzle-orm';

import { templates } from '@/models/Schema';
import type { FetchTemplates, SaveTemplate } from '@/types/Template';

import { db } from '../DB';

export async function saveTemplate({
  description,
  userId,
  templateContent,
  templateSampleData,
  templateStyle,
  assets,
}: SaveTemplate) {
  try {
    await db.insert(templates).values({
      description,
      userId, // FK reference to the users table
      templateContent,
      templateSampleData: JSON.parse(templateSampleData),
      templateStyle,
      assets: JSON.parse(assets),
    });
    return { success: true, message: 'Template saved successfully' };
  } catch (error: any) {
    console.error('Error saving template:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchTemplates({ userId }: FetchTemplates) {
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
