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

// role-gate সরানো হয়েছে — controller নিজেই req.user.id দিয়ে scope করে,
// "creator"/"donor" এখন role না, শুধু কে কী করেছে তার ভিত্তিতে
router.get('/creator/trend', getCreatorDonationTrendController);
router.get('/creator', getCreatorStatsController);

router.get('/donor', getDonorStatsController);

router.get('/campaign/:id', authenticate, getCampaignLiveStatsController);

export default router;