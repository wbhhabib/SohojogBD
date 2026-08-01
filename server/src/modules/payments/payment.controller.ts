import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/middlewares/async.middleware';
import { sendSuccess } from '@/utils/response';
import {
  initiatePayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIPN,
} from './payment.service';

export const initiatePaymentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const donorId = req.user!.id;
    const { donationId } = req.body as { donationId: string };

    const data = await initiatePayment(donorId, donationId);

    sendSuccess(res, data, 'Payment initiated successfully');
  }
);

export const handleSuccessController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const redirectUrl = await handleSuccess(req.body as Record<string, string>);
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

export const handleFailController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const redirectUrl = await handleFail(req.body as Record<string, string>);
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

export const handleCancelController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const redirectUrl = await handleCancel(req.body as Record<string, string>);
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

export const handleIPNController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await handleIPN(req.body as Record<string, string>);
    sendSuccess(res, null, 'IPN received');
  }
);