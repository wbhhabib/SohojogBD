import { PrismaClient, Role, CampaignStatus, DonationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding started...\n');


  console.log('Seeding users...');
  const hashedPassword = await bcrypt.hash('Password123!', SALT_ROUNDS);

  const rahim = await prisma.user.upsert({
    where: { email: 'rahim@example.com' },
    update: {},
    create: {
      name: 'Rahim Uddin Ahmed',
      email: 'rahim@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  const fatema = await prisma.user.upsert({
    where: { email: 'fatema@example.com' },
    update: {},
    create: {
      name: 'Fatema Begum',
      email: 'fatema@example.com',
      password: hashedPassword,
      role: Role.CREATOR,
      isVerified: true,
    },
  });

  const karim = await prisma.user.upsert({
    where: { email: 'karim@example.com' },
    update: {},
    create: {
      name: 'Karim Hossain',
      email: 'karim@example.com',
      password: hashedPassword,
      role: Role.CREATOR,
      isVerified: true,
    },
  });

  const nusrat = await prisma.user.upsert({
    where: { email: 'nusrat@example.com' },
    update: {},
    create: {
      name: 'Nusrat Jahan',
      email: 'nusrat@example.com',
      password: hashedPassword,
      role: Role.DONOR,
      isVerified: true,
    },
  });

  const sabbir = await prisma.user.upsert({
    where: { email: 'sabbir@example.com' },
    update: {},
    create: {
      name: 'Sabbir Rahman',
      email: 'sabbir@example.com',
      password: hashedPassword,
      role: Role.DONOR,
      isVerified: false,
    },
  });

  console.log('✓ Users seeded (5)\n');


  console.log('Seeding campaigns...');

  const now = new Date();

  const campaignData = [
    {
      title: 'Flood Relief for Sylhet',
      description: 'Emergency flood relief for thousands of displaced families in Sylhet division.',
      story: `The devastating floods in Sylhet have left thousands of families homeless and without food.
Rivers have overflowed their banks, submerging entire villages under water. Children, elderly, and
pregnant women are among the most vulnerable. Your donation will provide emergency food kits,
clean drinking water, temporary shelter, and medicine to affected families. Every taka counts
in this critical time of need.`,
      goalAmount: 500000,
      category: 'Disaster Relief',
      status: CampaignStatus.ACTIVE,
      beneficiaryName: 'Sylhet Flood Victims',
      beneficiaryInfo: 'Approximately 5,000 families across 12 unions in Sylhet division',
      deadline: new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()),
      creatorId: fatema.id,
      images: [],
    },
    {
      title: 'Build a School in Char Fasson',
      description: 'Help us build a primary school for 300+ children in the remote char of Bhola.',
      story: `Children in Char Fasson walk 10 kilometers daily just to reach the nearest school —
if they go at all. Many drop out before completing primary education due to distance, poverty,
and lack of infrastructure. We are building a 6-room primary school with proper sanitation,
electricity, and a library. This school will serve over 300 children from 5 surrounding villages
and transform the future of an entire community.`,
      goalAmount: 800000,
      category: 'Education',
      status: CampaignStatus.ACTIVE,
      beneficiaryName: 'Children of Char Fasson',
      beneficiaryInfo: '300+ children aged 5-12 from 5 villages in Char Fasson, Bhola',
      deadline: new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()),
      creatorId: karim.id,
      images: [],
    },
    {
      title: 'Cancer Treatment for Roksana',
      description: 'Roksana Akter, a 34-year-old mother of two, needs urgent cancer treatment.',
      story: `Roksana Akter was diagnosed with stage 3 breast cancer three months ago. A garment
worker from Mirpur, she is the sole earner for her two young children aged 6 and 9. The total
treatment cost including surgery, chemotherapy, and follow-up care is approximately 4.5 lakh taka.
Her family has already sold everything they own. With your support, Roksana can fight this
battle and return to her children. Every donation directly funds her medical bills at DMCH.`,
      goalAmount: 450000,
      category: 'Medical',
      status: CampaignStatus.ACTIVE,
      beneficiaryName: 'Roksana Akter',
      beneficiaryInfo: '34-year-old garment worker, mother of two, Mirpur, Dhaka',
      deadline: new Date(now.getFullYear(), now.getMonth() + 4, now.getDate()),
      creatorId: fatema.id,
      images: [],
    },
    {
      title: 'Plant Trees in Sundarbans',
      description: 'Restore mangrove forests in the Sundarbans to protect Bangladesh\'s coastline.',
      story: `The Sundarbans mangrove forest — the world's largest — is shrinking at an alarming rate
due to climate change, illegal logging, and rising sea levels. We successfully planted 50,000
mangrove saplings across 200 acres of degraded coastal land. This campaign has been completed
thanks to the generosity of donors like you. The saplings are now growing strong and will protect
coastal communities from cyclones and tidal surges for generations to come. Thank you Bangladesh!`,
      goalAmount: 200000,
      raisedAmount: 213500,
      donorCount: 87,
      category: 'Environment',
      status: CampaignStatus.COMPLETED,
      beneficiaryName: 'Coastal Communities of Khulna',
      beneficiaryInfo: 'Approximately 15 villages across the Sundarbans buffer zone',
      deadline: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      creatorId: karim.id,
      images: [],
    },
    {
      title: 'Street Dogs Rescue Dhaka',
      description: 'Rescue, treat, and rehome injured and sick street dogs across Dhaka city.',
      story: `Over 100,000 stray dogs roam the streets of Dhaka, many suffering from mange,
distemper, injuries from traffic accidents, and abuse. Our small team of veterinarians and
volunteers rescues the most critical cases, provides medical treatment, and finds loving homes
for those who recover. Your donation funds medicine, surgical equipment, food, and temporary
shelter for rescued animals. Together we can make Dhaka more humane for all its inhabitants.`,
      goalAmount: 150000,
      category: 'Animal Welfare',
      status: CampaignStatus.ACTIVE,
      beneficiaryName: 'Stray Dogs of Dhaka',
      beneficiaryInfo: 'Street dogs across Mirpur, Mohammadpur, Uttara, and Old Dhaka',
      deadline: new Date(now.getFullYear(), now.getMonth() + 5, now.getDate()),
      creatorId: fatema.id,
      images: [],
    },
  ];

  const campaigns = [];

  for (const data of campaignData) {
    const slug = slugify(data.title, { lower: true, strict: true });
    const campaign = await prisma.campaign.upsert({
      where: { slug },
      update: {},
      create: {
        ...data,
        slug,
      },
    });
    campaigns.push(campaign);
  }

  console.log('✓ Campaigns seeded (5)\n');


  console.log('Seeding donations...');

  const donationData = [
    { amount: 5000, donorId: nusrat.id, campaignId: campaigns[0].id, message: 'Stay strong Sylhet!' },
    { amount: 2500, donorId: sabbir.id, campaignId: campaigns[0].id, message: 'Prayers for the victims.' },
    { amount: 10000, donorId: nusrat.id, campaignId: campaigns[1].id, message: 'Education is the future.' },
    { amount: 3000, donorId: sabbir.id, campaignId: campaigns[1].id, message: 'Every child deserves a school.' },
    { amount: 7500, donorId: nusrat.id, campaignId: campaigns[2].id, message: 'Get well soon Roksana Apa.' },
    { amount: 1500, donorId: sabbir.id, campaignId: campaigns[2].id, message: 'Wishing you a full recovery.' },
    { amount: 500,  donorId: nusrat.id, campaignId: campaigns[3].id, message: 'Green Bangladesh forever.' },
    { amount: 8000, donorId: sabbir.id, campaignId: campaigns[3].id, message: 'Save our Sundarbans!' },
    { amount: 2000, donorId: nusrat.id, campaignId: campaigns[4].id, message: 'Be kind to animals.' },
    { amount: 4500, donorId: sabbir.id, campaignId: campaigns[4].id, message: 'Love these rescue efforts.' },
  ];

  for (const data of donationData) {

    const existing = await prisma.donation.findFirst({
      where: {
        donorId: data.donorId,
        campaignId: data.campaignId,
        amount: data.amount,
      },
    });

    if (!existing) {
      await prisma.donation.create({
        data: {
          ...data,
          status: DonationStatus.COMPLETED,
        },
      });
    }
  }


  for (const campaign of campaigns) {
    if (campaign.status === CampaignStatus.COMPLETED) continue;

    const result = await prisma.donation.aggregate({
      where: { campaignId: campaign.id, status: DonationStatus.COMPLETED },
      _sum: { amount: true },
      _count: { id: true },
    });

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        raisedAmount: result._sum.amount ?? 0,
        donorCount: result._count.id,
      },
    });
  }

  console.log('✓ Donations seeded (10)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seeding complete ✓');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Users:     5`);
  console.log(`   Campaigns: 5`);
  console.log(`   Donations: 10`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });