import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Example schema - customize according to your needs
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add more tables as needed for your job scheduler
