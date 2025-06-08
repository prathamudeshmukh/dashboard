import fs from 'node:fs';

type CleanupDirectoryOptions = {
  directory: string;
  force?: boolean;
};

export const cleanupDirectory = async ({ directory, force = true }: CleanupDirectoryOptions): Promise<void> => {
  try {
    if (fs.existsSync(directory)) {
      await fs.promises.rm(directory, { recursive: true, force });
    }
  } catch (error) {
    // Log error but don't throw to avoid breaking the main flow
    console.warn(`Failed to cleanup directory ${directory}:`, error);
  }
};
