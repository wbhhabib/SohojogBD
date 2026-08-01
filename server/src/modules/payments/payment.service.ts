
import { prisma } from '../../config/database';
import { env } from '@/config/env';
import { completeDonation } from '@/modules/donations/donation.service';
import SSLCommerzPaymentType from '@/types/sslcommerz';

const SSLCommerzPayment = require('sslcommerz-lts') as typeof SSLCommerzPaymentType;

const isLive = env.NODE_ENV === 'production';

export const initiatePayment = async (
  donorId: string,
  donationId: string
): Promise<{ gatewayUrl: string }> => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      donor: true,
      campaign: true,
    },
  });

  if (!donation) {
    const err = new Error('Donation not found') as Error & { statusCode: number };
    err.statusCode = 404;
    throw err;
  }

  if (donation.donorId !== donorId) {
    const err = new Error('Forbidden: You do not own this donation') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  if (donation.status !== 'PENDING') {
    const err = new Error('Donation is not in PENDING state') as Error & { statusCode: number };
    err.statusCode = 400;
    throw err;
  }

  const tran_id = `TXN-${donationId}-${Date.now()}`;

  await prisma.payment.create({
    data: {
      donationId,
      tranId: tran_id,
      amount: donation.amount,
      status: 'PENDING',
      donorId,
    },
  });

  const sslcz = new SSLCommerzPayment(env.SSLCOMMERZ_STORE_ID, env.SSLCOMMERZ_STORE_PASS, isLive);

  const payload = {
    total_amount: donation.amount,
    currency: 'BDT',
    tran_id,
    success_url: `${env.SERVER_URL}/api/v1/payments/success`,
    fail_url: `${env.SERVER_URL}/api/v1/payments/fail`,
    cancel_url: `${env.SERVER_URL}/api/v1/payments/cancel`,
    ipn_url: `${env.SERVER_URL}/api/v1/payments/ipn`,
    cus_name: donation.donor.name,
    cus_email: donation.donor.email,
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: '01700000000',
    product_name: donation.campaign.title,
    product_category: 'Donation',
    product_profile: 'general',
    shipping_method: 'NO',
    num_of_item: 1,
    weight_of_items: 0,
    order_id: tran_id,
    product_amount: donation.amount,
    vat: 0,
    discount_amount: 0,
    convenience_fee: 0,
  };

  const response = await sslcz.init(payload);

  if (response.status !== 'SUCCESS') {
    const err = new Error('Payment gateway initialization failed') as Error & { statusCode: number };
    err.statusCode = 502;
    throw err;
  }

  return { gatewayUrl: response.GatewayPageURL };
};

export const handleSuccess = async (body: Record<string, string>): Promise<string> => {
  const sslcz = new SSLCommerzPayment(env.SSLCOMMERZ_STORE_ID, env.SSLCOMMERZ_STORE_PASS, isLive);

  const validation = await sslcz.validate({ val_id: body.val_id });

  if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
    await prisma.payment.update({
      where: { tranId: body.tran_id },
      data: { status: 'VALID', valId: body.val_id },
    });

    const payment = await prisma.payment.findUnique({
      where: { tranId: body.tran_id },
    });

    if (payment) {
      await completeDonation(payment.donationId);
    }

    return `${env.CLIENT_URL}/payment/success`;
  }

  await prisma.payment.update({
    where: { tranId: body.tran_id },
    data: { status: 'FAILED' },
  });

  return `${env.CLIENT_URL}/payment/fail`;
};

export const handleFail = async (body: Record<string, string>): Promise<string> => {
  if (body.tran_id) {
    await prisma.payment.update({
      where: { tranId: body.tran_id },
      data: { status: 'FAILED' },
    });
  }

  return `${env.CLIENT_URL}/payment/fail`;
};

export const handleCancel = async (body: Record<string, string>): Promise<string> => {
  if (body.tran_id) {
    await prisma.payment.update({
      where: { tranId: body.tran_id },
      data: { status: 'CANCELLED' },
    });
  }

  return `${env.CLIENT_URL}/payment/cancel`;
};

export const handleIPN = async (body: Record<string, string>): Promise<void> => {
  const sslcz = new SSLCommerzPayment(env.SSLCOMMERZ_STORE_ID, env.SSLCOMMERZ_STORE_PASS, isLive);

  const validation = await sslcz.validate({ val_id: body.val_id });

  if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
    await prisma.payment.update({
      where: { tranId: body.tran_id },
      data: { status: 'VALID', valId: body.val_id },
    });

    const payment = await prisma.payment.findUnique({
      where: { tranId: body.tran_id },
    });

    if (payment) {
      await completeDonation(payment.donationId);
    }
  } else {
    await prisma.payment.update({
      where: { tranId: body.tran_id },
      data: { status: 'FAILED' },
    });
  }
};