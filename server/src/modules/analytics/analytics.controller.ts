import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/async.middleware';
import { sendSuccess } from '@/utils/response';
import {
  getPlatformStats,
  getAdminDonationTrend,
  getCreatorStats,
  getCreatorDonationTrend,
  getDonorStats,
  getCampaignLiveStats,
} from './analytics.service';


export const getPlatformStatsController = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const data = await getPlatformStats();
    sendSuccess(res, data, 'Platform stats fetched successfully');
  }
);


export const getAdminDonationTrendController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await getAdminDonationTrend(
      req.query as { days?: string }
    );
    sendSuccess(res, data, 'Donation trend fetched successfully');
  }
);


export const getCreatorStatsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const creatorId = req.user!.id;
    const data = await getCreatorStats(creatorId);
    sendSuccess(res, data, 'Creator stats fetched successfully');
  }
);


export const getCreatorDonationTrendController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const creatorId = req.user!.id;
    const data = await getCreatorDonationTrend(creatorId);
    sendSuccess(res, data, 'Creator donation trend fetched successfully');
  }
);


export const getDonorStatsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const donorId = req.user!.id;
    const data = await getDonorStats(donorId);
    sendSuccess(res, data, 'Donor stats fetched successfully');
  }
);


export const getCampaignLiveStatsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = await getCampaignLiveStats(id);
    sendSuccess(res, data, 'Campaign live stats fetched successfully');
  }
);