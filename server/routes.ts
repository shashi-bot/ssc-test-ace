import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extend Express Request type
declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}

// Middleware to verify JWT tokens
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getProfileByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user profile
      const userId = uuidv4();
      const profile = await storage.createProfile({
        userId,
        email,
        displayName,
        password,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: profile.userId, email: profile.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: {
          id: profile.userId,
          email: profile.email,
          user_metadata: { display_name: profile.displayName }
        },
        session: { access_token: token }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verify user credentials
      const profile = await storage.verifyPassword(email, password);
      if (!profile) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: profile.userId, email: profile.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        user: {
          id: profile.userId,
          email: profile.email,
          user_metadata: { display_name: profile.displayName }
        },
        session: { access_token: token }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Test routes
  app.get('/api/tests', authenticateToken, async (req, res) => {
    try {
      const tests = await storage.getActiveTests();
      res.json(tests);
    } catch (error) {
      console.error('Get tests error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Test attempt routes
  app.post('/api/test-attempts', authenticateToken, async (req, res) => {
    try {
      const { testId } = req.body;
      const userId = (req as any).user.userId;

      const attempt = await storage.createTestAttempt({
        userId,
        testId,
        startedAt: new Date(),
        isCompleted: false
      });

      res.status(201).json(attempt);
    } catch (error) {
      console.error('Create test attempt error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/test-attempts/:attemptId', authenticateToken, async (req, res) => {
    try {
      const { attemptId } = req.params;
      const attempt = await storage.getTestAttemptById(attemptId);
      
      if (!attempt || attempt.userId !== (req as any).user.userId) {
        return res.status(404).json({ message: 'Test attempt not found' });
      }

      // Get test details
      const test = await storage.getTestById(attempt.testId);
      
      res.json({
        ...attempt,
        tests: test
      });
    } catch (error) {
      console.error('Get test attempt error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/user-attempts', authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const attempts = await storage.getUserTestAttempts(userId);
      
      // Get test details for each attempt
      const attemptsWithTests = await Promise.all(
        attempts.map(async (attempt) => {
          const test = await storage.getTestById(attempt.testId);
          return {
            ...attempt,
            tests: test
          };
        })
      );
      
      res.json(attemptsWithTests);
    } catch (error) {
      console.error('Get user attempts error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Question routes
  app.get('/api/test-questions/:testId', authenticateToken, async (req, res) => {
    try {
      const { testId } = req.params;
      const questions = await storage.getTestQuestions(testId);
      res.json(questions);
    } catch (error) {
      console.error('Get test questions error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Profile routes
  app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const profile = await storage.getProfileById(userId);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
