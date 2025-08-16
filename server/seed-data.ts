import { db, topics, tests, questions, testQuestions } from "./database";
import { v4 as uuidv4 } from "uuid";

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Insert topics
    const topicData = [
      { name: 'Percentages', section: 'QUANTITATIVE_APTITUDE' as const },
      { name: 'Profit and Loss', section: 'QUANTITATIVE_APTITUDE' as const },
      { name: 'Simple Interest', section: 'QUANTITATIVE_APTITUDE' as const },
      { name: 'Compound Interest', section: 'QUANTITATIVE_APTITUDE' as const },
      { name: 'Time and Work', section: 'QUANTITATIVE_APTITUDE' as const },
      { name: 'Time and Distance', section: 'QUANTITATIVE_APTITUDE' as const },
      { name: 'Geometry', section: 'QUANTITATIVE_APTITUDE' as const },
      { name: 'Algebra', section: 'QUANTITATIVE_APTITUDE' as const },
      { name: 'Coding-Decoding', section: 'REASONING' as const },
      { name: 'Blood Relations', section: 'REASONING' as const },
      { name: 'Direction Sense', section: 'REASONING' as const },
      { name: 'Analogy', section: 'REASONING' as const },
      { name: 'Classification', section: 'REASONING' as const },
      { name: 'Series', section: 'REASONING' as const },
      { name: 'Logical Venn Diagrams', section: 'REASONING' as const },
      { name: 'Syllogism', section: 'REASONING' as const },
      { name: 'History', section: 'GENERAL_AWARENESS' as const },
      { name: 'Geography', section: 'GENERAL_AWARENESS' as const },
      { name: 'Politics', section: 'GENERAL_AWARENESS' as const },
      { name: 'Economics', section: 'GENERAL_AWARENESS' as const },
      { name: 'Science', section: 'GENERAL_AWARENESS' as const },
      { name: 'Current Affairs', section: 'GENERAL_AWARENESS' as const },
      { name: 'Grammar', section: 'ENGLISH' as const },
      { name: 'Vocabulary', section: 'ENGLISH' as const },
      { name: 'Reading Comprehension', section: 'ENGLISH' as const },
      { name: 'Sentence Improvement', section: 'ENGLISH' as const },
      { name: 'Error Detection', section: 'ENGLISH' as const },
      { name: 'Fill in the Blanks', section: 'ENGLISH' as const }
    ];

    const insertedTopics = await db.insert(topics).values(topicData).returning();
    console.log(`Inserted ${insertedTopics.length} topics`);

    // Insert sample tests
    const testData = [
      {
        title: 'SSC CGL Mock Test - 1',
        description: 'Full length mock test for SSC CGL preparation',
        testType: 'FULL_LENGTH' as const,
        examType: 'SSC_CGL' as const,
        durationMinutes: 120,
        totalMarks: 200,
        totalQuestions: 100,
        isActive: true
      },
      {
        title: 'Quantitative Aptitude - Sectional Test',
        description: 'Test your mathematical skills',
        testType: 'SECTIONAL' as const,
        examType: 'SSC_CGL' as const,
        section: 'QUANTITATIVE_APTITUDE' as const,
        durationMinutes: 60,
        totalMarks: 100,
        totalQuestions: 25,
        isActive: true
      },
      {
        title: 'Reasoning Ability - Sectional Test',
        description: 'Test your logical reasoning skills',
        testType: 'SECTIONAL' as const,
        examType: 'SSC_CGL' as const,
        section: 'REASONING' as const,
        durationMinutes: 60,
        totalMarks: 100,
        totalQuestions: 25,
        isActive: true
      },
      {
        title: 'General Awareness - Mini Quiz',
        description: 'Quick test on current affairs and general knowledge',
        testType: 'MINI_QUIZ' as const,
        examType: 'SSC_CGL' as const,
        section: 'GENERAL_AWARENESS' as const,
        durationMinutes: 30,
        totalMarks: 50,
        totalQuestions: 10,
        isActive: true
      },
      {
        title: 'English Comprehension - Practice Test',
        description: 'Improve your English language skills',
        testType: 'SECTIONAL' as const,
        examType: 'SSC_CGL' as const,
        section: 'ENGLISH' as const,
        durationMinutes: 45,
        totalMarks: 75,
        totalQuestions: 15,
        isActive: true
      }
    ];

    const insertedTests = await db.insert(tests).values(testData).returning();
    console.log(`Inserted ${insertedTests.length} tests`);

    // Insert sample questions for each test
    for (const test of insertedTests) {
      const sampleQuestions = [];
      const questionsCount = test.totalQuestions || 10;

      for (let i = 1; i <= questionsCount; i++) {
        const questionId = uuidv4();
        const section = test.section || 'QUANTITATIVE_APTITUDE';
        
        const questionData = {
          id: questionId,
          questionTextEnglish: `Sample question ${i} for ${test.title}. What is the correct answer?`,
          questionTextHindi: `हिंदी में प्रश्न ${i} ${test.title} के लिए। सही उत्तर क्या है?`,
          questionType: 'MCQ_SINGLE' as const,
          optionAEnglish: 'Option A',
          optionAHindi: 'विकल्प A',
          optionBEnglish: 'Option B',
          optionBHindi: 'विकल्प B',
          optionCEnglish: 'Option C',
          optionCHindi: 'विकल्प C',
          optionDEnglish: 'Option D',
          optionDHindi: 'विकल्प D',
          correctAnswer: String.fromCharCode(65 + (i % 4)), // A, B, C, or D
          explanationEnglish: `This is the explanation for question ${i}`,
          explanationHindi: `यह प्रश्न ${i} की व्याख्या है`,
          section: section,
          difficulty: 'MEDIUM' as const,
          marks: test.testType === 'MINI_QUIZ' ? 5 : 2,
          negativeMarks: '0.5'
        };

        sampleQuestions.push(questionData);
      }

      // Insert questions
      await db.insert(questions).values(sampleQuestions);

      // Create test-question associations
      const testQuestionData = sampleQuestions.map((question, index) => ({
        testId: test.id,
        questionId: question.id,
        questionOrder: index + 1
      }));

      await db.insert(testQuestions).values(testQuestionData);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}