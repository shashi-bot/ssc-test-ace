import { pgTable, text, serial, integer, boolean, uuid, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create enums
export const examType = pgEnum('exam_type', ['SSC_CGL', 'SSC_CHSL', 'SSC_MTS']);
export const testType = pgEnum('test_type', ['FULL_LENGTH', 'SECTIONAL', 'CHAPTER_WISE', 'PREVIOUS_YEAR', 'MINI_QUIZ']);
export const sectionType = pgEnum('section_type', ['QUANTITATIVE_APTITUDE', 'REASONING', 'GENERAL_AWARENESS', 'ENGLISH']);
export const difficultyLevel = pgEnum('difficulty_level', ['EASY', 'MEDIUM', 'HARD']);
export const questionType = pgEnum('question_type', ['MCQ_SINGLE', 'MCQ_MULTI', 'NUMERICAL']);
export const languagePreference = pgEnum('language_preference', ['ENGLISH', 'HINDI']);
export const attemptStatus = pgEnum('attempt_status', ['NOT_ATTEMPTED', 'ANSWERED', 'MARKED_FOR_REVIEW', 'ANSWERED_AND_MARKED']);

// Original users table (keeping for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Profiles table for exam app
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  examPreference: examType('exam_preference').default('SSC_CGL'),
  languagePreference: languagePreference('language_preference').default('ENGLISH'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Topics table
export const topics = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  section: sectionType('section').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Tests table
export const tests = pgTable('tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  testType: testType('test_type').notNull(),
  examType: examType('exam_type').notNull(),
  section: sectionType('section'),
  topicId: uuid('topic_id').references(() => topics.id),
  durationMinutes: integer('duration_minutes').notNull(),
  totalMarks: integer('total_marks').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Questions table
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionTextEnglish: text('question_text_english').notNull(),
  questionTextHindi: text('question_text_hindi'),
  questionType: questionType('question_type').default('MCQ_SINGLE'),
  optionAEnglish: text('option_a_english'),
  optionAHindi: text('option_a_hindi'),
  optionBEnglish: text('option_b_english'),
  optionBHindi: text('option_b_hindi'),
  optionCEnglish: text('option_c_english'),
  optionCHindi: text('option_c_hindi'),
  optionDEnglish: text('option_d_english'),
  optionDHindi: text('option_d_hindi'),
  correctAnswer: text('correct_answer').notNull(),
  explanationEnglish: text('explanation_english'),
  explanationHindi: text('explanation_hindi'),
  section: sectionType('section').notNull(),
  topicId: uuid('topic_id').references(() => topics.id),
  difficulty: difficultyLevel('difficulty').default('MEDIUM'),
  marks: integer('marks').default(1),
  negativeMarks: decimal('negative_marks').default('0.25'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Test Questions junction table
export const testQuestions = pgTable('test_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  testId: uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  questionOrder: integer('question_order').notNull()
});

// Test Attempts table
export const testAttempts = pgTable('test_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  testId: uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow(),
  submittedAt: timestamp('submitted_at'),
  durationTaken: integer('duration_taken'),
  totalScore: decimal('total_score').default('0'),
  percentage: decimal('percentage').default('0'),
  percentile: decimal('percentile'),
  isCompleted: boolean('is_completed').default(false),
  languageUsed: languagePreference('language_used').default('ENGLISH')
});

// Question Attempts table
export const questionAttempts = pgTable('question_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  testAttemptId: uuid('test_attempt_id').notNull().references(() => testAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  selectedAnswer: text('selected_answer'),
  attemptStatus: attemptStatus('attempt_status').default('NOT_ATTEMPTED'),
  isCorrect: boolean('is_correct'),
  marksAwarded: decimal('marks_awarded').default('0'),
  timeSpent: integer('time_spent').default(0)
});

// Create schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles);
export const insertTestSchema = createInsertSchema(tests);
export const insertQuestionSchema = createInsertSchema(questions);
export const insertTestAttemptSchema = createInsertSchema(testAttempts);
export const insertQuestionAttemptSchema = createInsertSchema(questionAttempts);

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type Test = typeof tests.$inferSelect;
export type InsertTest = typeof tests.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;
export type TestAttempt = typeof testAttempts.$inferSelect;
export type InsertTestAttempt = typeof testAttempts.$inferInsert;
export type QuestionAttempt = typeof questionAttempts.$inferSelect;
export type InsertQuestionAttempt = typeof questionAttempts.$inferInsert;
