import { relations } from 'drizzle-orm';
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

const templateTypeEnum = pgEnum('template_type', ['html-builder', 'handlebars-template']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
});

// Templates Table
export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(), // UUID with default value
  description: varchar('description', { length: 255 }).notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  templateContent: text('template_content').notNull(), // Template content in string
  templateSampleData: jsonb('template_sample_data').notNull(), // JSON format for sample data
  templateStyle: text('template_style').notNull(), // Style in string format
  assets: jsonb('assets'),
  templateType: templateTypeEnum('template_type').notNull(), // Add template_type column
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
}));
