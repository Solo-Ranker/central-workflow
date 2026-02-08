import { pgTable, uuid, varchar, timestamp, text, jsonb } from 'drizzle-orm/pg-core';

export const workflowActions = pgTable('workflow_actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  payload: jsonb('payload').notNull(), 
  makerId: varchar('maker_id', { length: 255 }).notNull(),
  checkerId: varchar('checker_id', { length: 255 }), 
  reviewComment: text('review_comment'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type WorkflowAction = typeof workflowActions.$inferSelect;
export type NewWorkflowAction = typeof workflowActions.$inferInsert;
