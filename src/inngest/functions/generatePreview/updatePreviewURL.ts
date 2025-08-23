import { updateTemplatePreviewURL } from '../../../service/templateService';

export async function updatePreviewURL(templateId: string, previewURL: string, logger: any) {
  logger.info('Updating database with preview URL', { templateId });

  try {
    const result = await updateTemplatePreviewURL({
      templateId,
      previewURL,
    });

    logger.info('Database updated successfully', {
      templateId,
      previewURL,
    });

    return result;
  } catch (error) {
    logger.error('Failed to update database', { templateId, error });
    throw new Error(`Database update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
