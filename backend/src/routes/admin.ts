import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { evaluateSubmissionSafety, MODERATION_GUIDELINES } from '../services/moderation';
import { buildInstagramPostData } from '../services/postTemplate';

const router = Router();

// Apply auth middleware to all admin routes
router.use(requireAdmin);

// GET /api/admin/guidelines - List moderation guidelines
router.get('/guidelines', (_req: AuthenticatedRequest, res: Response): void => {
  res.json({ guidelines: MODERATION_GUIDELINES });
});

// GET /api/admin/submissions - List submissions with filtering
router.get('/submissions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status.toUpperCase();
    }

    if (search && search.trim() !== '') {
      whereClause.OR = [
        { publicId: { contains: search } },
        { message: { contains: search } },
        { toName: { contains: search } },
        { fromName: { contains: search } },
      ];
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        instagramPost: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enhance each submission with safety flags for admin awareness
    const enhancedSubmissions = submissions.map((sub) => {
      const safety = evaluateSubmissionSafety(sub.message);
      return {
        ...sub,
        safetyFlags: safety.flags,
        isCaution: safety.isCaution,
      };
    });

    // Also return counts for tabs
    const counts = {
      total: await prisma.submission.count(),
      pending: await prisma.submission.count({ where: { status: 'PENDING' } }),
      approved: await prisma.submission.count({ where: { status: 'APPROVED' } }),
      archived: await prisma.submission.count({ where: { status: 'ARCHIVED' } }),
    };

    res.json({
      submissions: enhancedSubmissions,
      counts,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
});

// GET /api/admin/submissions/:id
router.get('/submissions/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { instagramPost: true },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    const safety = evaluateSubmissionSafety(submission.message);
    const postData = buildInstagramPostData(submission);

    res.json({
      submission: {
        ...submission,
        safetyFlags: safety.flags,
        isCaution: safety.isCaution,
      },
      instagramData: postData,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission details.' });
  }
});

const statusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'ARCHIVED']),
});

// PATCH /api/admin/submissions/:id/status
router.patch('/submissions/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = statusSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid status update.' });
      return;
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: { status: parseResult.data.status },
      include: { instagramPost: true },
    });

    res.json({ submission: updated });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update submission status.' });
  }
});

// POST /api/admin/submissions/:id/generate-post
router.post('/submissions/:id/generate-post', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { instagramPost: true },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    // Auto-approve if generating post from pending state
    if (submission.status === 'PENDING') {
      await prisma.submission.update({
        where: { id },
        data: { status: 'APPROVED' },
      });
    }

    // Upsert InstagramPost record
    const igPost = await prisma.instagramPost.upsert({
      where: { submissionId: id },
      update: {
        template: req.body.template || 'editorial-classic',
      },
      create: {
        submissionId: id,
        template: req.body.template || 'editorial-classic',
        status: 'GENERATED',
      },
    });

    const postData = buildInstagramPostData(submission);

    res.json({
      success: true,
      instagramPost: igPost,
      postData,
    });
  } catch (error) {
    console.error('Post generation error:', error);
    res.status(500).json({ error: 'Failed to generate Instagram post data.' });
  }
});

// POST /api/admin/submissions/:id/mark-posted
router.post('/submissions/:id/mark-posted', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const igPost = await prisma.instagramPost.upsert({
      where: { submissionId: id },
      update: {
        status: 'POSTED',
        publishedAt: new Date(),
      },
      create: {
        submissionId: id,
        template: 'editorial-classic',
        status: 'POSTED',
        publishedAt: new Date(),
      },
    });

    res.json({ success: true, instagramPost: igPost });
  } catch (error) {
    console.error('Mark posted error:', error);
    res.status(500).json({ error: 'Failed to update posted status.' });
  }
});

// DELETE /api/admin/submissions/:id
router.delete('/submissions/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.submission.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Submission removed.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete submission.' });
  }
});

export default router;
