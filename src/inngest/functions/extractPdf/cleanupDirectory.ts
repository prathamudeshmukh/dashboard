import fs from 'node:fs';

type CleanupDirectoryOptions = {
  directory: string;
  logger: any;
};

export const cleanupDirectory = ({ directory, logger }: CleanupDirectoryOptions): void => {
  try {
    if (fs.existsSync(directory)) {
      fs.rmSync(directory, { recursive: true, force: true });
      logger.info(`✅ Successfully cleaned up directory: ${directory}`);
    }
  } catch (error) {
    // Log error but don't throw to avoid breaking the main flow
    console.warn(`Failed to cleanup directory ${directory}:`, error);
  }
};
