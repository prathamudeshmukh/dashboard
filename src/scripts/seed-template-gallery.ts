import 'dotenv/config';

import fs from 'node:fs/promises';
import path from 'node:path';

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import { seedTemplates } from '@/data/template-definitions';
import { templateGallery } from '@/models/Schema';

export { seedTemplates };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL as string,
  ssl: {
    rejectUnauthorized: false,
  },
});

const db = drizzle(pool);

export async function seedTemplateGallery() {
  try {
    // Test database connection
    await db.select().from(templateGallery).limit(1);

    for (const template of seedTemplates) {
      const baseFolderPath = path.join(process.cwd(), 'src', 'data');

      try {
        const htmlContent = await fs.readFile(
          path.join(baseFolderPath, 'html', `${template.fileName}.html`),
          'utf8',
        );

        const handlebarContent = await fs.readFile(
          path.join(baseFolderPath, 'handlebar', `${template.fileName}.hbs`),
          'utf8',
        );

        let sampleData: any = null;
        const sampleDataPath = path.join(
          process.cwd(),
          'src',
          'data',
          'sampledata',
          `${template.fileName}-sample.json`,
        );

        try {
          const rawSample = await fs.readFile(sampleDataPath, 'utf8');
          sampleData = JSON.parse(rawSample);
        } catch (err) {
          console.warn(`No sample data found for: ${template.fileName}, Error: ${err}`);
        }

        let previewHtmlContent: string | null = null;
        try {
          previewHtmlContent = await fs.readFile(
            path.join(baseFolderPath, 'preview', `${template.fileName}-preview.html`),
            'utf8',
          );
        } catch {
          console.warn(`No preview HTML found for: ${template.fileName}`);
        }

        await db.insert(templateGallery).values({
          title: template.title,
          description: template.description,
          icon: template.icon,
          color: template.color,
          category: template.category,
          htmlContent,
          handlebarContent,
          sampleData,
          previewHtmlContent,
          typeKey: template.typeKey,
          variantName: template.variantName,
        }).onConflictDoUpdate({
          target: templateGallery.typeKey,
          set: {
            title: template.title,
            description: template.description,
            icon: template.icon,
            color: template.color,
            category: template.category,
            htmlContent,
            handlebarContent,
            sampleData,
            previewHtmlContent,
            variantName: template.variantName,
          },
        });
      } catch (err) {
        console.error(`Error seeding template ${template.title}:`, err);
      }
    }
  } catch (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
}

seedTemplateGallery().catch((err) => {
  console.error('Error seeding template gallery:', err);
  process.exit(1);
});
