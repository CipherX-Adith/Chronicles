import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db';
import { authLimiter } from '../middleware/rateLimit';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(4, 'Password is required'),
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;

    // Search by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'mace_confessions_jwt_secret_super_secure_key_2026';
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!admin) {
      res.status(404).json({ error: 'Admin account not found' });
      return;
    }

    res.json({ admin });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
