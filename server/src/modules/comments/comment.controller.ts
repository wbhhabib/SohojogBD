import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async.middleware';
import { sendSuccess, sendPaginated } from '@/utils/response';
import {
  getCampaignComments,
  addComment,
  deleteComment,
} from './comment.service';

export const getCampaignCommentsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id: campaignId } = req.params as { id: string };
    const { comments, meta } = await getCampaignComments(campaignId, req.query as Record<string, string>);

    sendPaginated(res, comments, meta, 'Comments fetched successfully');
  }
);

export const addCommentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id: campaignId } = req.params as { id: string };
    const userId = req.user!.id;
    const { content } = req.body as { content: string };

    const comment = await addComment(userId, campaignId, content);

    sendSuccess(res, comment, 'Comment added successfully', 201);
  }
);

export const deleteCommentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const userId = req.user!.id;
    const role = req.user!.role;

    await deleteComment(id, userId, role);

    sendSuccess(res, null, 'Comment deleted successfully');
  }
);