import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
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

const creationMethodEnum = pgEnum('creation_method', ['EXTRACT_FROM_PDF', 'TEMPLATE_GALLERY', 'NEW_TEMPLATE']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  clientId: varchar('client_id', { length: 255 }).notNull().unique(), // Clerk user_id
  remainingBalance: integer('remaining_balance').default(0).notNull(),
});

export const creditTransactions = pgTable('credit_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: varchar('client_id', { length: 255 })
    .notNull()
    .references(() => users.clientId, { onDelete: 'cascade' }),
  credits: integer('credits').notNull(),
  creditedAt: timestamp('credited_at', { mode: 'date' }).defaultNow().notNull(),
  paymentId: varchar('payment_id', { length: 255 }), // Optional, only for paid credits
}, table => ({
  clientIdIndex: index('creditTransactions_clientId_idx').on(table.clientId),
}));

export const templateGallery = pgTable('template_gallery', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 255 }),
  color: varchar('color', { length: 255 }),
  category: varchar('category', { length: 255 }),
  htmlContent: text('html_content').notNull(),
  handlebarContent: text('handlebar_content'),
  sampleData: jsonb('sample_data'),
  style: text('style'),
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
  creationMethod: creationMethodEnum('creation_method').notNull(),
  templateGeneratedFrom: uuid('template_generated_from').references(() => templateGallery.id),
  previewURL: text('preview_url'),
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
  emailEnvIndex: index('template_email_env_created_idx').on(
    table.email,
    table.environment,
  ),
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

export const webhook_endpoints = pgTable('webhook_endpoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: varchar('client_id')
    .notNull()
    .references(() => users.clientId, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  encryptedSecret: varchar('client_secret', { length: 255 }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates), // One-to-many relation with templates
  apikeys: many(apikeys), // One-to-many relation with apikeys
  webhook_endpoints: many(webhook_endpoints),
  creditTransactions: many(creditTransactions),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.clientId],
    references: [users.clientId],
  }),
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
  generatedFrom: one(templateGallery, {
    fields: [templates.templateGeneratedFrom],
    references: [templateGallery.id],
  }),
}));

export const templateGalleryRelations = relations(templateGallery, ({ many }) => ({
  templates: many(templates),
}));

export const apikeysRelations = relations(apikeys, ({ one }) => ({
  user: one(users, {
    fields: [apikeys.clientId],
    references: [users.clientId],
  }),
}));

export const webhookEndpointsRelations = relations(webhook_endpoints, ({ one }) => ({
  user: one(users, {
    fields: [webhook_endpoints.clientId],
    references: [users.clientId],
  }),
}));
