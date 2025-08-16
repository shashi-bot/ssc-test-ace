import { eq, and, desc, sql } from "drizzle-orm";
import { db, profiles, tests, questions, testQuestions, testAttempts, questionAttempts, topics } from "./database";
import type { Profile, InsertProfile, Test, TestAttempt, InsertTestAttempt, QuestionAttempt, InsertQuestionAttempt } from "@shared/schema";

export class DatabaseStorage {
  // User/Profile management
  async createProfile(profileData: InsertProfile & { password: string }): Promise<Profile> {
    // Note: In production, password should be hashed
    const [profile] = await db.insert(profiles).values({
      ...profileData,
    }).returning();
    return profile;
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.email, email));
    return profile;
  }

  async getProfileById(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async verifyPassword(email: string, password: string): Promise<Profile | null> {
    const profile = await this.getProfileByEmail(email);
    if (!profile) return null;
    
    // Simple password check (in production, use bcrypt)
    if (profile.password !== password) return null;
    
    return profile;
  }

  // Test management
  async getActiveTests(): Promise<Test[]> {
    return await db.select().from(tests).where(eq(tests.isActive, true)).orderBy(desc(tests.createdAt));
  }

  async getTestById(testId: string): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, testId));
    return test;
  }

  // Test attempt management
  async createTestAttempt(attemptData: InsertTestAttempt): Promise<TestAttempt> {
    const [attempt] = await db.insert(testAttempts).values(attemptData).returning();
    return attempt;
  }

  async getTestAttemptById(attemptId: string): Promise<TestAttempt | undefined> {
    const [attempt] = await db.select().from(testAttempts).where(eq(testAttempts.id, attemptId));
    return attempt;
  }

  async getUserTestAttempts(userId: string): Promise<TestAttempt[]> {
    return await db.select().from(testAttempts)
      .where(eq(testAttempts.userId, userId))
      .orderBy(desc(testAttempts.startedAt));
  }

  async getCompletedTestAttempts(userId: string): Promise<TestAttempt[]> {
    return await db.select().from(testAttempts)
      .where(and(eq(testAttempts.userId, userId), eq(testAttempts.isCompleted, true)))
      .orderBy(desc(testAttempts.submittedAt));
  }

  async updateTestAttempt(attemptId: string, updates: Partial<TestAttempt>): Promise<TestAttempt> {
    const [updated] = await db.update(testAttempts)
      .set(updates)
      .where(eq(testAttempts.id, attemptId))
      .returning();
    return updated;
  }

  // Question management
  async getTestQuestions(testId: string): Promise<any[]> {
    return await db.select({
      id: questions.id,
      questionTextEnglish: questions.questionTextEnglish,
      questionTextHindi: questions.questionTextHindi,
      optionAEnglish: questions.optionAEnglish,
      optionAHindi: questions.optionAHindi,
      optionBEnglish: questions.optionBEnglish,
      optionBHindi: questions.optionBHindi,
      optionCEnglish: questions.optionCEnglish,
      optionCHindi: questions.optionCHindi,
      optionDEnglish: questions.optionDEnglish,
      optionDHindi: questions.optionDHindi,
      imageUrl: questions.imageUrl,
      questionType: questions.questionType,
      section: questions.section,
      topicId: questions.topicId,
      difficulty: questions.difficulty,
      marks: questions.marks,
      negativeMarks: questions.negativeMarks,
      questionOrder: testQuestions.questionOrder
    })
    .from(questions)
    .innerJoin(testQuestions, eq(questions.id, testQuestions.questionId))
    .where(eq(testQuestions.testId, testId))
    .orderBy(testQuestions.questionOrder);
  }

  // Question attempt management
  async createQuestionAttempt(attemptData: InsertQuestionAttempt): Promise<QuestionAttempt> {
    const [attempt] = await db.insert(questionAttempts).values(attemptData).returning();
    return attempt;
  }

  async updateQuestionAttempt(attemptId: string, questionId: string, updates: Partial<QuestionAttempt>): Promise<QuestionAttempt> {
    const [updated] = await db.update(questionAttempts)
      .set(updates)
      .where(and(
        eq(questionAttempts.testAttemptId, attemptId),
        eq(questionAttempts.questionId, questionId)
      ))
      .returning();
    return updated;
  }

  async getQuestionAttempts(attemptId: string): Promise<QuestionAttempt[]> {
    return await db.select().from(questionAttempts)
      .where(eq(questionAttempts.testAttemptId, attemptId));
  }

  // Analytics queries
  async getUserAnalytics(userId: string): Promise<any> {
    const attempts = await this.getCompletedTestAttempts(userId);
    
    return {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0 
        ? attempts.reduce((sum, attempt) => sum + Number(attempt.percentage), 0) / attempts.length
        : 0,
      bestScore: attempts.length > 0
        ? Math.max(...attempts.map(attempt => Number(attempt.percentage)))
        : 0,
      totalTimeSpent: attempts.reduce((sum, attempt) => sum + (attempt.durationTaken || 0), 0)
    };
  }
}

export const storage = new DatabaseStorage();