'use server';

import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';

import { generatePdfCore } from '@/service/generatePdfCore';

import { inngest } from '../../inngest/client';
import { creditTransactions, generated_templates, templateGallery, templates, users } from '../../models/Schema';
import type {
  GeneratedTemplates,
  GeneratePdfRequest,
  JsonObject,
  JsonValue,
  PaginatedResponse,
  UpdatePreviewURLParams,
  UpdatePreviewURLResult,
  UsageMetric,
  UsageMetricRequest,
} from '../../types/Template';
import type { FetchTemplatesRequest } from '../../types/Template/TemplateRequest';
import type { FetchTemplateResponse } from '../../types/Template/TemplateResponse';
import { db } from '../DB';
import { FormatUsageData } from './template/FormatUsageData';
import { groupUsageByPeriod } from './template/GroupUsageByPeriod';
import { deductCredit } from './user';

// Types

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
  templateGeneratedFrom,
  creationMethod,
}: any) {
  if (!description || !templateContent || !templateName) {
    throw new Error('Missing required fields: description, templateContent or templateName.');
  }

  try {
    const response = await db.insert(templates)
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
        templateGeneratedFrom,
        creationMethod,
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
      }).returning();

    if (!response) {
      throw new Error(`Error in Saving Template`);
    }
    const tempID = response[0]?.templateId;
    const data = response[0];

    if (tempID) {
      await inngest.send({
        name: 'template/generate-preview',
        data: { templateId: tempID },
      });
    }

    return {
      success: true,
      data,
      templateId: tempID,
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
        creationMethod: devTemplate.creationMethod,
        templateGeneratedFrom: devTemplate.templateGeneratedFrom,
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
      .orderBy(desc(templates.createdAt));

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

export async function fetchTemplatesFromGallery() {
  try {
    const templates = await db.select().from(templateGallery);
    if (!templates) {
      throw new Error('Templates not found.');
    };
    return templates;
  } catch (error) {
    console.error('Error fetching template gallery:', error);
    throw new Error('Failed to fetch template gallery');
  }
}

export async function fetchTemplateById(templateId: string, isDev: boolean = true) {
  try {
    const result = await db.select({
      templateData: templates,
      user: {
        id: users.id,
        email: users.email,
        cliendId: users.clientId,
        remainingBalance: users.remainingBalance,
      },
    })
      .from(templates)
      .innerJoin(users, eq(templates.email, users.email))
      .where(
        and(
          eq(templates.templateId, templateId),
          eq(templates.environment, isDev ? 'dev' : 'prod'),
        ),
      ).limit(1);

    if (result.length === 0) {
      return {
        error: { message: 'Template not found', status: 404 },
      };
    }

    const template = result[0]?.templateData;
    const userData = result[0]?.user;

    return { data: { ...template, user: userData } };
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return {
      error: { message: 'Error fetching template', status: 500 },
    };
  }
}

export async function generatePdf({
  templateId,
  templateData,
  devMode = true,
  isApi = false,
}: GeneratePdfRequest): Promise<{ pdf?: ArrayBuffer; error?: { message: string; status?: number } }> {
  try {
    let template;

    // If templateId is provided fetch existing template
    if (templateId) {
      template = await fetchTemplateById(templateId, devMode);

      if (template.error) {
        return { error: template.error };
      }
    }
    // Determine the data to be used by generatePdfCore
    const dataForContentGenerator = templateData !== undefined
      ? (templateData as JsonValue) // If templateData was passed, use it (even if it's an empty object {})
      : (template?.data?.templateSampleData as JsonValue); // Otherwise, use the sample data from the template

    // check for balance
    if (
      isApi
      && (!template?.data?.user || template?.data?.user?.remainingBalance == null || template?.data?.user?.remainingBalance <= 0)
    ) {
      return { error: { message: 'Insufficient credits.', status: 402 } };
    }

    // Use the core PDF generation service
    const result = await generatePdfCore({
      templateContent: template?.data?.templateContent as string,
      templateStyle: template?.data?.templateStyle as string,
      templateData: dataForContentGenerator,
    });

    if (template?.data?.id && isApi) {
      await deductCredit(template.data.user?.cliendId as string);
      await addGeneratedTemplateHistory({
        templateId: template.data.id,
        dataValue: templateData,
      });
    }

    return { pdf: result.pdf };
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return { error: { message: 'Internal Server Error', status: 500 } };
  }
}

export async function updateTemplatePreviewURL({
  templateId,
  previewURL,
}: UpdatePreviewURLParams): Promise<UpdatePreviewURLResult> {
  try {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    if (!previewURL) {
      throw new Error('Preview URL is required');
    }

    // Update the template
    const updateResult = await db
      .update(templates)
      .set({
        previewURL,
      })
      .where(
        and(
          eq(templates.templateId, templateId),
          eq(templates.environment, 'dev'),
        ),
      )
      .returning({
        id: templates.id,
        templateId: templates.templateId,
        previewURL: templates.previewURL,
        updatedAt: templates.updatedAt,
      });

    if (!updateResult.length) {
      throw new Error('Template not found or update failed');
    }

    const updatedTemplate = updateResult[0];
    return {
      data: {
        templateId: updatedTemplate?.templateId as string,
        previewURL: updatedTemplate?.previewURL as string,
      },
    };
  } catch (error) {
    console.error('Error updating template preview URL:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to update preview URL',
    };
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

export async function getUsageData(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  const records = await db
    .select({ date: generated_templates.generated_date })
    .from(generated_templates)
    .innerJoin(templates, eq(generated_templates.template_id, templates.id))
    .where(eq(templates.email, email));

  // Group Usage By Period
  const { dailyMap, weeklyMap, monthlyMap } = groupUsageByPeriod(records);

  // Format usage data
  const { dailyUsageData, weeklyUsageData, monthlyUsageData } = FormatUsageData(dailyMap, weeklyMap, monthlyMap);

  // Get last credit transaction
  const lastTransaction = await db.query.creditTransactions.findFirst({
    where: eq(creditTransactions.clientId, user.clientId),
    orderBy: desc(creditTransactions.creditedAt),
  });

  return {
    // Usage
    dailyUsageData,
    weeklyUsageData,
    monthlyUsageData,

    // Credit Info
    remainingBalance: user.remainingBalance,
    lastCredited: lastTransaction?.credits ?? 0,
    lastCreditedAt: lastTransaction?.creditedAt ?? null,
  };
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
