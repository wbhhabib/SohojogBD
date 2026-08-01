import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import path from 'path';

import { env } from '@/config/env';
import { corsOptions } from '@/config/cors';
import { prisma } from '@/config/database';
import { errorMiddleware } from '@/middlewares/error.middleware';


import '@/modules/auth/google.strategy';


import authRoutes         from '@/modules/auth/auth.routes';
import userRoutes         from '@/modules/users/user.routes';
import campaignRoutes     from '@/modules/campaigns/campaign.routes';
import donationRoutes     from '@/modules/donations/donation.routes';
import paymentRoutes      from '@/modules/payments/payment.routes';
import commentRoutes      from '@/modules/comments/comment.routes';
import notificationRoutes from '@/modules/notifications/notification.routes';
import analyticsRoutes    from '@/modules/analytics/analytics.routes';
import reportRoutes    from '@/modules/report/report.routes';
import settingsRoutes       from '@/modules/settings/settings.routes';
import { maintenanceMiddleware } from '@/middlewares/maintenance.middleware';


const app = express();


const isDev = env.NODE_ENV === 'development';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10_000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10_000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again after 15 minutes.',
  },
});


app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (isDev) {
  app.use(morgan('dev'));
}


app.use(passport.initialize());

app.use(generalLimiter);

// ── Maintenance mode — blocks all non-essential traffic when active ──────
app.use(maintenanceMiddleware);


app.use(
  '/uploads',
  express.static(path.join(process.cwd(), env.UPLOAD_DIR))
);

app.use('/api/v1/reports',   reportRoutes);
app.use('/api/v1/settings',  settingsRoutes);


app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});


app.use('/api/v1/auth',          authLimiter, authRoutes);
app.use('/api/v1/users',         userRoutes);
app.use('/api/v1/campaigns',     campaignRoutes);
app.use('/api/v1/donations',     donationRoutes);
app.use('/api/v1/payments',      paymentRoutes);
app.use('/api/v1/comments',      commentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics',     analyticsRoutes);


app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});


app.use(errorMiddleware);


const PORT = env.PORT ?? 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   Rate limit  : ${isDev ? 'disabled (dev mode)' : 'enabled (production)'}`);
  console.log(`   DB          : connected via Prisma`);
  console.log(`   Google OAuth: ${env.GOOGLE_CLIENT_ID ? 'configured ✓' : 'not configured (add GOOGLE_CLIENT_ID/SECRET to .env)'}`);
});


const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received — shutting down gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected. Goodbye.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT',  () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  void shutdown('unhandledRejection');
});

export default app;