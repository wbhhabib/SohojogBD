import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import {
  getPlatformStatsController,
  getAdminDonationTrendController,
  getCreatorStatsController,
  getCreatorDonationTrendController,
  getDonorStatsController,
  getCampaignLiveStatsController,
} from './analytics.controller';

const router = Router();

router.use(authenticate);

router.get('/platform/trend', authorize('ADMIN'), getAdminDonationTrendController);
router.get('/platform', authorize('ADMIN'), getPlatformStatsController);

router.get('/creator/trend', authorize('CREATOR'), getCreatorDonationTrendController);
router.get('/creator', authorize('CREATOR'), getCreatorStatsController);

router.get('/donor', authorize('DONOR'), getDonorStatsController);

router.get('/campaign/:id', authenticate, getCampaignLiveStatsController);

export default router;