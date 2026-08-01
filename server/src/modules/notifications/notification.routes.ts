
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import {
  getUserNotificationsController,
  getUnreadCountController,
  markAllAsReadController,
  markAsReadController,
} from './notification.controller';

const router = Router();


router.use(authenticate);






router.get('/', getUserNotificationsController);


router.get('/unread-count', getUnreadCountController);


router.patch('/read-all', markAllAsReadController);


router.patch('/:id/read', markAsReadController);

export default router;