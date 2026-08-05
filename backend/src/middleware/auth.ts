import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export type AuthRequest = Request;

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing or invalid token', 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_key_12345';

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      name: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Unauthorized: Invalid or expired token', 401));
    }
  }
};
