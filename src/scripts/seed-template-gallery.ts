import 'dotenv/config';

import fs from 'node:fs/promises';
import path from 'node:path';

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import { templateGallery } from '@/models/Schema';

export const seedTemplates = [
  {
    fileName: 'invoice-template',
    title: 'Invoice Template',
    description: 'Professional invoice with itemized billing and payment details',
    icon: 'FileText',
    color: 'text-blue-600',
    category: 'Finance',
  },
  {
    fileName: 'report-template',
    title: 'Report Template',
    description: 'Structured report with sections for data, analysis, and conclusions',
    icon: 'FileSpreadsheet',
    color: 'text-green-600',
    category: 'Business',
  },
  {
    fileName: 'contract-template',
    title: 'Contract Template',
    description: 'Legal contract with terms, conditions, and signature fields',
    icon: 'FileCheck',
    color: 'text-amber-600',
    category: 'Legal',
  },
  {
    fileName: 'newsletter-template',
    title: 'Newsletter Template',
    description: 'Email newsletter with sections for articles, images, and call-to-actions',
    icon: 'Mail',
    color: 'text-purple-600',
    category: 'Marketing',
  },
  {
    fileName: 'receipt-template',
    title: 'Receipt Template',
    description: 'Simple receipt for transactions and purchases',
    icon: 'Receipt',
    color: 'text-slate-600',
    category: 'Finance',
  },
  {
    fileName: 'certificate-template',
    title: 'Certificate Template',
    description: 'Professional certificate of achievement or completion',
    icon: 'Award',
    color: 'text-yellow-600',
    category: 'Education',
  },
  {
    fileName: 'financial-report-template',
    title: 'Financial Report',
    description: 'Detailed financial report with charts and analysis',
    icon: 'FileBarChart',
    color: 'text-emerald-600',
    category: 'Finance',
  },
  {
    fileName: 'resume-template',
    title: 'Resume Template',
    description: 'Professional resume/CV for job applications',
    icon: 'Briefcase',
    color: 'text-indigo-600',
    category: 'Personal',
  },
  {
    fileName: 'business-proposal-template',
    title: 'Business Proposal',
    description: 'Professional business or project proposal',
    icon: 'Bookmark',
    color: 'text-sky-600',
    category: 'Business',
  },
  {
    fileName: 'brochure-template',
    title: 'Brochure Template',
    description: 'Marketing brochure for products or services',
    icon: 'FileImage',
    color: 'text-rose-600',
    category: 'Marketing',
  },
  {
    fileName: 'press-release-template',
    title: 'Press Release',
    description: 'Official press release for news and announcements',
    icon: 'Newspaper',
    color: 'text-blue-600',
    category: 'PR',
  },
];

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
      const baseFolderPath = path.join(__dirname, '../../', 'src', 'data');

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
          __dirname,
          '../../',
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

        await db.insert(templateGallery).values({
          title: template.title,
          description: template.description,
          icon: template.icon,
          color: template.color,
          category: template.category,
          htmlContent,
          handlebarContent,
          sampleData,
        }).onConflictDoUpdate({
          target: templateGallery.title,
          set: {
            description: template.description,
            icon: template.icon,
            color: template.color,
            category: template.category,
            htmlContent,
            handlebarContent,
            sampleData,
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
