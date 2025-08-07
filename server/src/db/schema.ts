
import { serial, text, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

// Export all tables for proper query building
export const tables = { users: usersTable };
