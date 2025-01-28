'use server';

import { and, desc, eq } from 'drizzle-orm';

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
        .where(and(
          eq(templates.templateId, templateId),
          eq(templates.environment, 'dev'),
        ));

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

export async function PublishTemplateToProd(templateId: string) {
  try {
    // Fetch the dev template
    const devTemplate = await db.query.templates.findFirst({
      where: and(
        eq(templates.templateId, templateId),
        eq(templates.environment, 'dev'),
      ),
    });

    if (!devTemplate) {
      throw new Error('Development template not found');
    }

    // Check if prod version exists
    const prodTemplate = await db.query.templates.findFirst({
      where: and(
        eq(templates.templateId, devTemplate.templateId as string),
        eq(templates.environment, 'prod'),
      ),
    });

    // Prepare the template data
    const templateData = {
      templateId: devTemplate.templateId,
      description: devTemplate.description,
      templateName: devTemplate.templateName,
      email: devTemplate.email,
      templateContent: devTemplate.templateContent,
      templateSampleData: devTemplate.templateSampleData,
      templateStyle: devTemplate.templateStyle,
      assets: devTemplate.assets,
      templateType: devTemplate.templateType,
      environment: 'prod' as const,
    };

    if (prodTemplate) {
      // Update existing prod template
      await db.update(templates)
        .set(templateData)
        .where(
          and(
            eq(templates.templateId, devTemplate.templateId as string),
            eq(templates.environment, 'prod'),
          ),
        );

      return { message: 'Template published to production updated successfully' };
    } else {
      // Create new prod template
      await db.insert(templates).values(templateData);

      return { message: 'Template published to production successfully' };
    }
  } catch (error) {
    throw new Error(`Failed to publish template to production: ${error}`);
  }
}

export async function fetchTemplates(email: string) {
  try {
    const userTemplates = await db
      .select()
      .from(templates)
      .where(and(
        eq(templates.email, email),
        eq(templates.environment, 'dev'),
      ))
      .orderBy(desc(templates.id));
    return { success: true, data: userTemplates };
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchTemplateById(templateId: string, isDev: boolean = true) {
  try {
    const template = await db.query.templates.findFirst({
      where: and(
        eq(templates.templateId, templateId),
        eq(templates.environment, isDev ? 'dev' : 'prod'),
      ),
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return { success: true, data: template };
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
    await db.delete(templates).where(eq(templates.templateId, templateId));
    return { success: true, message: 'Template deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return { success: false, error: error.message };
  }
}
