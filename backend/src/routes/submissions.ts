import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../db';
import { submissionLimiter } from '../middleware/rateLimit';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { evaluateSubmissionSafety, MODERATION_GUIDELINES } from '../services/moderation';
import { buildInstagramPostData } from '../services/postTemplate';
import { instagramService } from '../services/instagram';

const router = Router();

const participantSchema = z
  .object({
    name: z.string().max(100, 'Name is too long').optional().default(''),
    class: z.string().max(100, 'Class/Year is too long').optional().default(''),
    department: z.string().max(100, 'Department is too long').optional().default(''),
  })
  .optional()
  .default({});

const createSubmissionSchema = z.object({
  from: participantSchema,
  to: participantSchema,
  message: z
    .string()
    .min(1, 'Please write your message before submitting.')
    .max(1500, 'Message cannot exceed 1500 characters.')
    .trim(),
});

function generatePublicId(): string {
  const hex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `MC-${hex}`;
}

// --------------------------------------------------------------------------
// PUBLIC ROUTE (No Auth, Strict Anonymity, Rate Limited)
// --------------------------------------------------------------------------

// POST /api/submissions - Public Anonymous Confession Submission
router.post('/', submissionLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createSubmissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid confession format.',
      });
      return;
    }

    const { from, to, message } = parseResult.data;

    // Generate unique public reference ID
    let publicId = generatePublicId();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await prisma.submission.findUnique({
        where: { publicId },
      });
      if (!existing) {
        isUnique = true;
      } else {
        publicId = generatePublicId();
        attempts++;
      }
    }

    // Save to database with default PENDING status
    // IP addresses and device fingerprints are deliberately NOT stored to preserve strict anonymity
    await prisma.submission.create({
      data: {
        publicId,
        fromName: from?.name?.trim() || null,
        fromClass: from?.class?.trim() || null,
        fromDepartment: from?.department?.trim() || null,
        toName: to?.name?.trim() || null,
        toClass: to?.class?.trim() || null,
        toDepartment: to?.department?.trim() || null,
        message,
        status: 'PENDING',
      },
    });

    // Student response MUST be generic without leaking moderation status
    res.status(201).json({
      received: true,
      reference: publicId,
    });
  } catch (error) {
    console.error('Submission creation error:', error);
    res.status(500).json({
      error: 'Unable to deliver your confession at this moment. Please try again.',
    });
  }
});

// --------------------------------------------------------------------------
// PROTECTED ADMIN ROUTES (Require Valid Admin Session)
// --------------------------------------------------------------------------

// Helper to calculate status counts
async function getSubmissionCounts() {
  return {
    total: await prisma.submission.count(),
    pending: await prisma.submission.count({
      where: {
        status: { in: ['PENDING', 'GENERATED'] },
      },
    }),
    published: await prisma.submission.count({
      where: {
        status: { in: ['PUBLISHED', 'APPROVED'] },
      },
    }),
    rejected: await prisma.submission.count({
      where: { status: 'REJECTED' },
    }),
  };
}

// GET /api/submissions/admin/pending - Get pending submissions for review
router.get('/admin/pending', requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        status: { in: ['PENDING', 'GENERATED'] },
      },
      include: { instagramPost: true },
      orderBy: { createdAt: 'desc' },
    });

    const enhanced = submissions.map((sub) => {
      const safety = evaluateSubmissionSafety(sub.message);
      return {
        ...sub,
        safetyFlags: safety.flags,
        isCaution: safety.isCaution,
      };
    });

    const counts = await getSubmissionCounts();

    res.json({
      submissions: enhanced,
      counts,
      guidelines: MODERATION_GUIDELINES,
    });
  } catch (error) {
    console.error('Fetch pending error:', error);
    res.status(500).json({ error: 'Failed to retrieve pending submissions.' });
  }
});

// GET /api/submissions/admin/all - Get all submissions with status filter and search
router.get('/admin/all', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = (req.query.status as string | undefined)?.toUpperCase();
    const search = req.query.search as string | undefined;

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        whereClause.status = { in: ['PENDING', 'GENERATED'] };
      } else if (status === 'PUBLISHED' || status === 'APPROVED') {
        whereClause.status = { in: ['PUBLISHED', 'APPROVED'] };
      } else if (status === 'REJECTED') {
        whereClause.status = 'REJECTED';
      } else {
        whereClause.status = status;
      }
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
      include: { instagramPost: true },
      orderBy: { createdAt: 'desc' },
    });

    const enhanced = submissions.map((sub) => {
      const safety = evaluateSubmissionSafety(sub.message);
      return {
        ...sub,
        safetyFlags: safety.flags,
        isCaution: safety.isCaution,
      };
    });

    const counts = await getSubmissionCounts();

    res.json({
      submissions: enhanced,
      counts,
      guidelines: MODERATION_GUIDELINES,
    });
  } catch (error) {
    console.error('Fetch all submissions error:', error);
    res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
});

const rejectSchema = z.object({
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
});

// POST /api/submissions/admin/:id/reject - Reject a confession
router.post('/admin/:id/reject', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = rejectSchema.safeParse(req.body);
    const reason = parseResult.success ? parseResult.data.reason : undefined;

    const existing = await prisma.submission.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    if (existing.status === 'PUBLISHED' || existing.status === 'APPROVED') {
      res.status(400).json({ error: 'Cannot reject an already published confession.' });
      return;
    }

    const adminIdentity = req.admin?.email || req.admin?.id || 'Admin';

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason?.trim() || null,
        rejectedAt: new Date(),
        rejectedBy: adminIdentity,
      },
      include: { instagramPost: true },
    });

    res.json({ success: true, submission: updated });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: 'Failed to reject submission.' });
  }
});

// POST /api/submissions/admin/:id/generate - Generate Instagram post data (Does NOT approve!)
router.post('/admin/:id/generate', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    if (submission.status === 'REJECTED') {
      res.status(400).json({ error: 'Cannot generate Instagram post for a rejected confession.' });
      return;
    }

    // If pending, mark as GENERATED in workflow (still NOT published/approved)
    let updatedSubmission = submission;
    if (submission.status === 'PENDING') {
      updatedSubmission = await prisma.submission.update({
        where: { id },
        data: { status: 'GENERATED' },
        include: { instagramPost: true },
      });
    }

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

    const postData = buildInstagramPostData(updatedSubmission);

    res.json({
      success: true,
      submission: updatedSubmission,
      instagramPost: igPost,
      postData,
    });
  } catch (error) {
    console.error('Generate post error:', error);
    res.status(500).json({ error: 'Failed to generate post data.' });
  }
});

// POST /api/submissions/admin/:id/confirm-posted - Explicit admin confirmation of Instagram post
router.post('/admin/:id/confirm-posted', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    if (submission.status === 'REJECTED') {
      res.status(400).json({ error: 'Cannot publish a rejected confession.' });
      return;
    }

    if (submission.status === 'PUBLISHED') {
      res.status(400).json({ error: 'This confession has already been published.' });
      return;
    }

    const adminIdentity = req.admin?.email || req.admin?.id || 'Admin';
    const now = new Date();

    const [updatedSubmission, igPost] = await prisma.$transaction([
      prisma.submission.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          postedAt: now,
          postedBy: adminIdentity,
        },
      }),
      prisma.instagramPost.upsert({
        where: { submissionId: id },
        update: {
          status: 'PUBLISHED',
          publishedAt: now,
        },
        create: {
          submissionId: id,
          template: 'editorial-classic',
          status: 'PUBLISHED',
          publishedAt: now,
        },
      }),
    ]);

    res.json({
      success: true,
      submission: updatedSubmission,
      instagramPost: igPost,
      message: 'Confession confirmed and published successfully.',
    });
  } catch (error) {
    console.error('Confirm posted error:', error);
    res.status(500).json({ error: 'Failed to confirm published status.' });
  }
});

// POST /api/submissions/admin/:id/publish-instagram (Direct Meta Graph or Alias for confirm-posted)
router.post('/admin/:id/publish-instagram', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageUrl, caption } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    if (submission.status === 'REJECTED') {
      res.status(400).json({ error: 'Cannot publish a rejected confession.' });
      return;
    }

    if (submission.status === 'PUBLISHED') {
      res.status(400).json({ error: 'This confession has already been published.' });
      return;
    }

    const adminIdentity = req.admin?.email || req.admin?.id || 'Admin';
    const now = new Date();

    // Direct Graph API if configured
    if (imageUrl && instagramService.isDirectPublishingConfigured()) {
      const publishRes = await instagramService.publishPost({ imageUrl, caption });
      if (publishRes.success) {
        const [updatedSubmission, igPost] = await prisma.$transaction([
          prisma.submission.update({
            where: { id },
            data: {
              status: 'PUBLISHED',
              postedAt: now,
              postedBy: adminIdentity,
            },
          }),
          prisma.instagramPost.upsert({
            where: { submissionId: id },
            update: {
              status: 'PUBLISHED',
              instagramId: publishRes.instagramMediaId,
              publishedAt: now,
            },
            create: {
              submissionId: id,
              status: 'PUBLISHED',
              instagramId: publishRes.instagramMediaId,
              publishedAt: now,
            },
          }),
        ]);
        res.json({ success: true, directPublished: true, submission: updatedSubmission, instagramPost: igPost });
        return;
      }
    }

    // Manual flow publication
    const [updatedSubmission, igPost] = await prisma.$transaction([
      prisma.submission.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          postedAt: now,
          postedBy: adminIdentity,
        },
      }),
      prisma.instagramPost.upsert({
        where: { submissionId: id },
        update: {
          status: 'PUBLISHED',
          publishedAt: now,
        },
        create: {
          submissionId: id,
          template: 'editorial-classic',
          status: 'PUBLISHED',
          publishedAt: now,
        },
      }),
    ]);

    res.json({
      success: true,
      directPublished: false,
      submission: updatedSubmission,
      instagramPost: igPost,
      message: 'Confession confirmed and published successfully.',
    });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ error: 'Failed to update publishing state.' });
  }
});

// DELETE /api/submissions/admin/:id - Delete submission
router.delete('/admin/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.submission.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Submission permanently removed.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete submission.' });
  }
});

export default router;
