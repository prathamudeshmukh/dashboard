import { relations } from 'drizzle-orm';
import {
  bigint,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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

export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

const templateTypeEnum = pgEnum('template_type', ['html-builder', 'handlebars-template']);

export const environmentEnum = pgEnum('environment', ['prod', 'dev']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  clientId: varchar('client_id', { length: 255 }).notNull().unique(), // Clerk user_id
});

// Templates Table
export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').defaultRandom(),
  description: varchar('description', { length: 255 }).notNull(),
  templateName: varchar('templateName', { length: 255 }).notNull(),
  email: varchar('email')
    .notNull()
    .references(() => users.email, { onDelete: 'cascade' }),
  templateContent: text('template_content').notNull(),
  templateSampleData: jsonb('template_sample_data'),
  templateStyle: text('template_style'),
  assets: jsonb('assets'),
  templateType: templateTypeEnum('template_type').notNull(),
  environment: environmentEnum('environment').notNull().default('dev'),
  createdAt: timestamp('created_at', { mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
}, table => ({
  templateEnvUnique: uniqueIndex('unique_template_id_environment').on(
    table.templateId,
    table.environment,
  ),
  emailIndex: index('template_email_idx').on(table.email),
}));

export const generated_templates = pgTable('generated_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  generated_date: timestamp('generated_date', { mode: 'date' }).defaultNow().notNull(),
  template_id: uuid('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  data_value: jsonb('data_value'),
}, table => ({
  dateIndex: index('generated_templates_generated_date_idx').on(table.generated_date),
  templateIdIndex: index('generated_templates_template_id_idx').on(table.template_id),
}));

// API Keys Table
export const apikeys = pgTable('apikeys', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: varchar('client_id', { length: 255 })
    .notNull()
    .references(() => users.clientId, { onDelete: 'cascade' }), // Foreign key to users.clientId
  clientSecret: varchar('client_secret', { length: 255 }).notNull(), // Hashed client secret
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates), // One-to-many relation with templates
  apikeys: many(apikeys), // One-to-many relation with apikeys
}));

export const generatedTemplatesRelations = relations(generated_templates, ({ one }) => ({
  template: one(templates, {
    fields: [generated_templates.template_id],
    references: [templates.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, {
    fields: [templates.email],
    references: [users.email],
  }),
  generated_templates: many(generated_templates),
}));

export const apikeysRelations = relations(apikeys, ({ one }) => ({
  user: one(users, {
    fields: [apikeys.clientId],
    references: [users.clientId],
  }),
}));
