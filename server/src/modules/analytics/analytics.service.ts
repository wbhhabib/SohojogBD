
import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';



function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function subtractMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - months, 1);
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayLabel(date: Date): string {
  return date.toISOString().slice(0, 10);
}



export const getPlatformStats = async (): Promise<unknown> => {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [
    totalUsers,
    totalCreators,
    totalDonors,
    totalCampaigns,
    activeCampaigns,
    completedCampaigns,
    donationAgg,
    thisMonthAgg,
    topCategories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CREATOR' } }),
    prisma.user.count({ where: { role: 'DONOR' } }),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.campaign.count({ where: { status: 'COMPLETED' } }),
    prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.campaign.groupBy({
      by: ['category'],
      _sum: { raisedAmount: true },
      orderBy: { _sum: { raisedAmount: 'desc' } },
      take: 5,
    }),
  ]);

  return {
    users: { total: totalUsers, creators: totalCreators, donors: totalDonors },
    campaigns: {
      total: totalCampaigns,
      active: activeCampaigns,
      completed: completedCampaigns,
    },
    donations: {
      total: donationAgg._count.id,
      totalAmountRaised: donationAgg._sum.amount ?? 0,
      thisMonth: {
        count: thisMonthAgg._count.id,
        amount: thisMonthAgg._sum.amount ?? 0,
      },
    },
    topCategories: topCategories.map((c: { category: string; _sum: { raisedAmount: number | null } }) => ({
      category: c.category,
      totalRaised: c._sum.raisedAmount ?? 0,
    })),
  };
};



interface TrendPoint {
  label: string;
  donations: number;
  amount: number;
}

export const getAdminDonationTrend = async (query: {
  days?: string;
}): Promise<TrendPoint[]> => {
  const days = query.days ? parseInt(query.days, 10) : undefined;
  const now = new Date();

  if (days === 30 || days === 90) {
    const promises = Array.from({ length: days }, (_, i) => {
      const dayStart = subtractDays(now, days - 1 - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      return prisma.donation
        .aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: dayStart, lt: dayEnd },
          },
          _count: { id: true },
          _sum: { amount: true },
        })
        .then((agg: { _count: { id: number }; _sum: { amount: number | null } }) => ({
          label: dayLabel(dayStart),
          donations: agg._count.id,
          amount: agg._sum.amount ?? 0,
        }));
    });

    return Promise.all(promises);
  }

  const months = 12;
  const promises = Array.from({ length: months }, (_, i) => {
    const monthStart = subtractMonths(now, months - 1 - i);
    const monthEnd = subtractMonths(now, months - 2 - i);

    return prisma.donation
      .aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: monthStart, lt: monthEnd },
        },
        _count: { id: true },
        _sum: { amount: true },
      })
      .then((agg: { _count: { id: number }; _sum: { amount: number | null } }) => ({
        label: monthLabel(monthStart),
        donations: agg._count.id,
        amount: agg._sum.amount ?? 0,
      }));
  });

  return Promise.all(promises);
};



export const getCreatorStats = async (creatorId: string): Promise<unknown> => {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [
    totalCampaigns,
    activeCampaigns,
    raisedAgg,
    thisMonthAgg,
    uniqueDonors,
    topCampaign,
  ] = await Promise.all([
    prisma.campaign.count({ where: { creatorId } }),
    prisma.campaign.count({ where: { creatorId, status: 'ACTIVE' } }),
    prisma.donation.aggregate({
      where: { campaign: { creatorId }, status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: {
        campaign: { creatorId },
        status: 'COMPLETED',
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.donation.findMany({
      where: { campaign: { creatorId }, status: 'COMPLETED' },
      distinct: ['donorId'],
      select: { donorId: true },
    }),
    prisma.campaign.findFirst({
      where: { creatorId },
      orderBy: { raisedAmount: 'desc' },
      select: { id: true, title: true, slug: true, raisedAmount: true, goalAmount: true },
    }),
  ]);

  return {
    campaigns: { total: totalCampaigns, active: activeCampaigns },
    activeCampaigns,
    totalRaised: raisedAgg._sum.amount ?? 0,
    thisMonthRaised: thisMonthAgg._sum.amount ?? 0,
    totalDonors: uniqueDonors.length,
    topCampaign: topCampaign ?? null,
  };
};



export const getCreatorDonationTrend = async (
  creatorId: string
): Promise<TrendPoint[]> => {
  const now = new Date();
  const months = 6;

  const promises = Array.from({ length: months }, (_, i) => {
    const monthStart = subtractMonths(now, months - 1 - i);
    const monthEnd = subtractMonths(now, months - 2 - i);

    return prisma.donation
      .aggregate({
        where: {
          campaign: { creatorId },
          status: 'COMPLETED',
          createdAt: { gte: monthStart, lt: monthEnd },
        },
        _count: { id: true },
        _sum: { amount: true },
      })
      .then((agg: { _count: { id: number }; _sum: { amount: number | null } }) => ({
        label: monthLabel(monthStart),
        donations: agg._count.id,
        amount: agg._sum.amount ?? 0,
      }));
  });

  return Promise.all(promises);
};



export const getDonorStats = async (donorId: string): Promise<unknown> => {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [totalAgg, thisMonthAgg, campaignsSupported, categoryGroups] =
    await Promise.all([
      prisma.donation.aggregate({
        where: { donorId, status: 'COMPLETED' },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: {
          donorId,
          status: 'COMPLETED',
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      prisma.donation.findMany({
        where: { donorId, status: 'COMPLETED' },
        distinct: ['campaignId'],
        select: { campaignId: true },
      }),
      prisma.donation.groupBy({
        by: ['campaignId'],
        where: { donorId, status: 'COMPLETED' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 1,
      }),
    ]);

  let topCategory: string | null = null;
  if (categoryGroups.length > 0) {
    const topCampaign = await prisma.campaign.findUnique({
      where: { id: categoryGroups[0].campaignId },
      select: { category: true },
    });
    topCategory = topCampaign?.category ?? null;
  }

  return {
    totalDonated: totalAgg._sum.amount ?? 0,
    donationCount: totalAgg._count.id,
    campaignsSupported: campaignsSupported.length,
    thisMonthDonated: thisMonthAgg._sum.amount ?? 0,
    topCategory,
  };
};




export const getCampaignLiveStats = async (
  campaignId: string
): Promise<{ donorsToday: number; raisedToday: number }> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const todayAgg = await prisma.donation.aggregate({
    where: {
      campaignId,
      status: 'COMPLETED',
      createdAt: { gte: todayStart, lt: tomorrowStart },
    },
    _count: { id: true },
    _sum: { amount: true },
  });

  return {
    donorsToday: todayAgg._count.id,
    raisedToday: todayAgg._sum.amount ?? 0,
  };
};