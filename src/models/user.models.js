import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password', { length: 255 }).notNull(),
  role: text('role', { length: 50 }).notNull().default('user'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow()
});

// export const postsTable = pgTable('posts_table', {
//   id: serial('id').primaryKey(),
//   title: text('title').notNull(),
//   content: text('content').notNull(),
//   userId: integer('user_id')
//     .notNull()
//     .references(() => usersTable.id, { onDelete: 'cascade' }),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at')
//     .notNull()
//     .$onUpdate(() => new Date()),
// });

// export type InsertUser = typeof usersTable.$inferInsert;
// export type SelectUser = typeof usersTable.$inferSelect;

// export type InsertPost = typeof postsTable.$inferInsert;
// export type SelectPost = typeof postsTable.$inferSelect;
