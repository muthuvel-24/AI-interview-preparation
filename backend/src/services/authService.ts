import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';
import { AppError } from '../middleware/errorHandler.js';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_key_12345';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const generateToken = (user: {
  id: string;
  email: string;
  name: string;
  role: string;
  streakCount: number;
  lastActiveDate?: Date | string | null;
  badges: string[];
}) => {
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      streakCount: user.streakCount,
      lastActiveDate: user.lastActiveDate,
      badges: user.badges,
    },
    JWT_SECRET,
    options
  );
};

export const parseBadges = (badgesString?: string | null): string[] => {
  if (!badgesString) return ['Welcome Rookie'];
  try {
    const parsed = JSON.parse(badgesString);
    return Array.isArray(parsed) ? parsed : ['Welcome Rookie'];
  } catch {
    return ['Welcome Rookie'];
  }
};

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const now = new Date();

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      provider: 'email',
      role: input.role || 'STUDENT',
      streakCount: 1,
      lastActiveDate: now,
      badges: JSON.stringify(['Welcome Rookie']),
    },
  });

  // Create initial leaderboard entry
  await prisma.leaderboardEntry.create({
    data: {
      userId: user.id,
      overallScore: 0,
      mcqScore: 0,
      codingScore: 0,
      interviewScore: 0,
      resumeScore: 0,
    },
  });

  const parsed = parseBadges(user.badges);

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    streakCount: user.streakCount,
    lastActiveDate: user.lastActiveDate,
    badges: parsed,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      streakCount: user.streakCount,
      lastActiveDate: user.lastActiveDate,
      badges: parsed,
    },
    token,
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user || !user.password) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const now = new Date();
  let newStreak = user.streakCount || 1;

  if (user.lastActiveDate) {
    const lastDate = new Date(user.lastActiveDate);
    const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 3600);

    if (diffHours >= 24 && diffHours < 48) {
      newStreak += 1;
    } else if (diffHours >= 48) {
      newStreak = 1;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      streakCount: newStreak,
      lastActiveDate: now,
      badges: user.badges || JSON.stringify(['Welcome Rookie']),
    },
  });

  const parsedBadges = parseBadges(updatedUser.badges);

  const token = generateToken({
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    streakCount: updatedUser.streakCount,
    lastActiveDate: updatedUser.lastActiveDate,
    badges: parsedBadges,
  });

  return {
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      streakCount: updatedUser.streakCount,
      lastActiveDate: updatedUser.lastActiveDate,
      badges: parsedBadges,
    },
    token,
  };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      provider: true,
      streakCount: true,
      lastActiveDate: true,
      badges: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    ...user,
    badges: parseBadges(user.badges),
  };
};
