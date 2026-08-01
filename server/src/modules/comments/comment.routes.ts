import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  getCampaignCommentsController,
  addCommentController,
  deleteCommentController,
} from './comment.controller';

const router = Router();

const addCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Content must be at least 1 character')
    .max(500, 'Content must be at most 500 characters'),
});


router.get('/campaign/:id', getCampaignCommentsController);


router.post(
  '/campaign/:id',
  authenticate,
  validate(addCommentSchema),
  addCommentController
);


router.delete('/:id', authenticate, deleteCommentController);

export default router;