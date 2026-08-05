import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService.js';
import { AuthRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        message: 'Validation Error',
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);
    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        message: 'Validation Error',
        errors: error.errors,
      });
      return;
    }
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }
    const user = await authService.getUserById(req.user.id);
    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth demo/mock callback handler for dev / testing
export const googleCallbackMock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      res.status(400).json({ status: 'error', message: 'Email and name required' });
      return;
    }
    // Check or create user
    const existing = await authService.registerUser({ name, email, password: 'google_oauth_user_secret_' + Math.random() }).catch(async () => {
      return await authService.loginUser({ email, password: '' }).catch(async () => {
        // If login without pass fails, get user directly
        const u = await authService.getUserById(email);
        return { user: u, token: authService.generateToken(u as any) };
      });
    });
    res.json({ status: 'success', data: existing });
  } catch (error) {
    next(error);
  }
};
