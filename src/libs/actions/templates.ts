'use server';

import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';

import { generated_templates, templates } from '@/models/Schema';
import type { FetchTemplateResponse, FetchTemplatesRequest, GeneratedTemplates, JsonObject, PaginatedResponse, UsageMetric, UsageMetricRequest } from '@/types/Template';

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
    await db.insert(templates)
      .values({
        description,
        email,
        templateName,
        templateContent,
        templateSampleData: templateSampleData ? JSON.parse(templateSampleData) : {},
        templateStyle,
        assets: assets ? JSON.parse(assets) : null,
        templateType,
        templateId: templateId || undefined,
        environment: 'dev',
      })
      .onConflictDoUpdate({
        target: [templates.templateId, templates.environment],
        set: {
          description,
          templateContent,
          templateStyle,
          templateSampleData: templateSampleData ? JSON.parse(templateSampleData) : {},
          updatedAt: sql`now()`,
        },
        where: eq(templates.environment, 'dev'),
      });

    return {
      success: true,
      message: templateId ? 'Template updated successfully' : 'Template saved successfully',
    };
  } catch (error: any) {
    console.error(`Error upserting template:`, error);
    throw new Error(`Failed to upsert template: ${error.message}`);
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

    await db.insert(templates)
      .values({
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
      })
      .onConflictDoUpdate({
        target: [templates.templateId, templates.environment],
        set: {
          description: devTemplate.description,
          templateName: devTemplate.templateName,
          email: devTemplate.email,
          templateContent: devTemplate.templateContent,
          templateSampleData: devTemplate.templateSampleData,
          templateStyle: devTemplate.templateStyle,
          assets: devTemplate.assets,
          templateType: devTemplate.templateType,
          updatedAt: sql`now()`,
        },
        where: eq(templates.environment, 'prod'),
      });

    return { message: 'Template published to production successfully' };
  } catch (error) {
    throw new Error(`Failed to publish template to production: ${error}`);
  }
}

export async function fetchTemplates({
  email,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  searchQuery = '',
}: FetchTemplatesRequest): Promise<PaginatedResponse<FetchTemplateResponse>> {
  try {
    if (!email) {
      throw new Error('Please provide email id');
    }

    const offest = (page - 1) * pageSize;

    const conditions = [
      eq(templates.email, email),
      eq(templates.environment, 'dev'),
    ];

    if (startDate) {
      conditions.push(gte(templates.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(templates.createdAt, endDate));
    }

    if (searchQuery) {
      conditions.push(ilike(templates.templateName, `%${searchQuery}%`));
    }

    const userTemplates = await db
      .select({
        templateName: templates.templateName,
        templateId: templates.templateId,
        description: templates.description!,
        templateType: templates.templateType,
        totalRecords: sql<number>`COALESCE(COUNT(*) OVER(), 0)`,
      })
      .from(templates)
      .where(and(...conditions))
      .limit(pageSize)
      .offset(offest)
      .orderBy(desc(templates.id));

    const totalRecords = userTemplates[0]?.totalRecords || 0;

    const totalPages = Math.ceil(totalRecords / pageSize);
    return {
      data: userTemplates,
      total: totalRecords,
      page,
      pageSize,
      totalPages,
    };
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    throw new Error('Failed to fetch Template');
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
    return console.error(`Failed to Create History: ${error}`);
  }
}

export async function fetchUsageMetrics({
  email,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
}: UsageMetricRequest): Promise<PaginatedResponse<UsageMetric>> {
  try {
    if (!email) {
      throw new Error('Please Provide email id');
    }
    const offset = (page - 1) * pageSize;

    const conditions = [eq(templates.email, email)];

    if (startDate) {
      conditions.push(gte(generated_templates.generated_date, startDate));
    }

    if (endDate) {
      conditions.push(lte(generated_templates.generated_date, endDate));
    }

    const metrics = await db
      .select({
        generatedDate: generated_templates.generated_date,
        templateName: templates.templateName,
        email: templates.email,
        data: generated_templates.data_value as JsonObject,
        totalRecords: sql<number>`COUNT(*) OVER()`,
      })
      .from(generated_templates)
      .innerJoin(templates, eq(generated_templates.template_id, templates.id))
      .where(and(...conditions))
      .limit(pageSize)
      .offset(offset);

    const totalRecords = metrics[0]?.totalRecords || 0;

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      data: metrics,
      total: totalRecords,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    throw new Error(`Failed to fetch usage metrics: ${error}`);
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
