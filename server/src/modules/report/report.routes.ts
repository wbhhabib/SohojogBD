
import { Router } from 'express';
import { Role } from '../../types/prisma-enums';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import {
  createReportController,
  getAdminReportsController,
  updateReportController,
} from './report.controller';

const router = Router();


router.post('/', authenticate, createReportController);


router.get('/admin', authenticate, authorize(Role.ADMIN), getAdminReportsController);


router.patch('/:id', authenticate, authorize(Role.ADMIN), updateReportController);

export default router;