

export interface User {
  id: string
  name: string
  email: string
  role: 'donor' | 'creator' | 'admin'
  avatar?: string
  createdAt: string
  isVerified: boolean
  isBanned: boolean
}

export interface Campaign {
  id: string
  title: string
  slug: string
  description: string
  story: string
  goalAmount: number
  raisedAmount: number
  donorCount: number
  category: string
  status: 'ACTIVE' | 'DRAFT' | 'PENDING' | 'COMPLETED' | 'REJECTED' | 'PAUSED' | 'SUSPENDED'
  images: string[]
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  beneficiaryName: string
  beneficiaryInfo: string
  deadline: string
  createdAt: string
}

export interface Donation {
  id: string
  donorId: string
  donorName: string
  campaignId: string
  campaignTitle: string
  amount: number
  message?: string
  isAnonymous: boolean
  createdAt: string
  status: 'pending' | 'completed' | 'refunded'
}

export interface Notification {
  id: string
  userId: string
  type: 'donation' | 'milestone' | 'comment' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  campaignId: string
  content: string
  createdAt: string
}

export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'Rahim Uddin Ahmed',
    email: 'rahim@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahim',
    createdAt: '2023-01-10T08:00:00Z',
    isVerified: true,
    isBanned: false,
  },
  {
    id: 'user-002',
    name: 'Fatema Begum',
    email: 'fatema@example.com',
    role: 'creator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatema',
    createdAt: '2023-03-15T09:30:00Z',
    isVerified: true,
    isBanned: false,
  },
  {
    id: 'user-003',
    name: 'Karim Hossain',
    email: 'karim@example.com',
    role: 'creator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
    createdAt: '2023-05-20T11:00:00Z',
    isVerified: true,
    isBanned: false,
  },
  {
    id: 'user-004',
    name: 'Nusrat Jahan',
    email: 'nusrat@example.com',
    role: 'donor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
    createdAt: '2023-06-01T10:00:00Z',
    isVerified: true,
    isBanned: false,
  },
  {
    id: 'user-005',
    name: 'Sabbir Rahman',
    email: 'sabbir@example.com',
    role: 'donor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sabbir',
    createdAt: '2023-08-12T14:00:00Z',
    isVerified: false,
    isBanned: false,
  },
]

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    title: 'Flood Relief for Sylhet',
    slug: 'flood-relief-sylhet',
    description: 'Helping flood-affected families in Sylhet with food, shelter, and medical aid.',
    story: 'The devastating floods in Sylhet have left thousands of families homeless and without food. Your donation will directly provide relief materials including food packages, clean water, temporary shelter, and basic medical supplies to those in urgent need.',
    goalAmount: 500000,
    raisedAmount: 347800,
    donorCount: 214,
    category: 'Disaster Relief',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
      'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?w=800',
    ],
    creatorId: 'user-002',
    creatorName: 'Fatema Begum',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatema',
    beneficiaryName: 'Flood Victims of Sylhet',
    beneficiaryInfo: 'Over 5,000 families affected by the 2024 Sylhet floods',
    deadline: '2025-07-30T23:59:59Z',
    createdAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'camp-002',
    title: 'Build a School in Char Fasson',
    slug: 'school-char-fasson',
    description: 'Constructing a primary school for underprivileged children in Char Fasson, Bhola.',
    story: 'Children in Char Fasson travel miles to attend school, often dropping out due to the difficulty. This campaign aims to build a fully equipped primary school that will serve over 300 children and ensure quality education close to home.',
    goalAmount: 800000,
    raisedAmount: 612000,
    donorCount: 389,
    category: 'Education',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    ],
    creatorId: 'user-002',
    creatorName: 'Fatema Begum',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatema',
    beneficiaryName: 'Children of Char Fasson',
    beneficiaryInfo: 'Over 300 children aged 5–12 in Char Fasson, Bhola district',
    deadline: '2025-09-15T23:59:59Z',
    createdAt: '2024-04-10T09:00:00Z',
  },
  {
    id: 'camp-003',
    title: 'Cancer Treatment for Roksana Khatun',
    slug: 'cancer-treatment-roksana',
    description: 'Supporting Roksana Khatun, a mother of three, with her cancer treatment costs.',
    story: 'Roksana Khatun, 38, was diagnosed with breast cancer earlier this year. A daily wage worker, her family cannot afford the chemotherapy and surgery costs. Every donation brings her closer to recovery and her children closer to their mother.',
    goalAmount: 450000,
    raisedAmount: 278500,
    donorCount: 176,
    category: 'Medical',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    ],
    creatorId: 'user-003',
    creatorName: 'Karim Hossain',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
    beneficiaryName: 'Roksana Khatun',
    beneficiaryInfo: '38-year-old mother of three, diagnosed with breast cancer',
    deadline: '2025-08-01T23:59:59Z',
    createdAt: '2024-05-18T10:00:00Z',
  },
  {
    id: 'camp-004',
    title: 'Plant 10000 Trees in Sundarbans',
    slug: 'plant-trees-sundarbans',
    description: 'A reforestation campaign to restore the mangrove ecosystem of the Sundarbans.',
    story: 'The Sundarbans mangrove forest is shrinking due to climate change and illegal logging. This campaign successfully planted 10,000 trees to restore the habitat and protect coastal communities from cyclones. Thank you to all who contributed!',
    goalAmount: 300000,
    raisedAmount: 300000,
    donorCount: 542,
    category: 'Environment',
    status: 'COMPLETED',
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    ],
    creatorId: 'user-003',
    creatorName: 'Karim Hossain',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
    beneficiaryName: 'Sundarbans Ecosystem',
    beneficiaryInfo: 'The Sundarbans, the world\'s largest mangrove forest',
    deadline: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-05T07:00:00Z',
  },
  {
    id: 'camp-005',
    title: 'Street Dogs Rescue Dhaka',
    slug: 'street-dogs-rescue-dhaka',
    description: 'Rescuing, vaccinating, and rehoming street dogs in Dhaka city.',
    story: 'Thousands of stray dogs in Dhaka suffer from disease, injuries, and neglect. This campaign funds our rescue team to provide veterinary care, vaccinations, neutering, and adoption services. Help us give these animals a better life.',
    goalAmount: 200000,
    raisedAmount: 87400,
    donorCount: 93,
    category: 'Animal Welfare',
    status: 'ACTIVE',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ],
    creatorId: 'user-002',
    creatorName: 'Fatema Begum',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatema',
    beneficiaryName: 'Street Dogs of Dhaka',
    beneficiaryInfo: 'Estimated 50,000+ stray dogs in Dhaka metropolitan area',
    deadline: '2025-10-31T23:59:59Z',
    createdAt: '2024-07-01T11:00:00Z',
  },
  {
    id: 'camp-006',
    title: 'Community Library Rajshahi',
    slug: 'community-library-rajshahi',
    description: 'Setting up a free community library with books, internet access, and study spaces in Rajshahi.',
    story: 'Rajshahi\'s underprivileged youth lack access to books and educational resources. This library will stock 5,000 books, offer free internet, and provide a quiet study environment for students preparing for exams.',
    goalAmount: 150000,
    raisedAmount: 42000,
    donorCount: 38,
    category: 'Community',
    status: 'DRAFT',
    images: [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
    ],
    creatorId: 'user-002',
    creatorName: 'Fatema Begum',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatema',
    beneficiaryName: 'Youth of Rajshahi',
    beneficiaryInfo: 'Students and young adults in Rajshahi city',
    deadline: '2025-12-01T23:59:59Z',
    createdAt: '2024-08-20T13:00:00Z',
  },
]

export const mockDonations: Donation[] = [
  {
    id: 'don-001',
    donorId: 'user-004',
    donorName: 'Nusrat Jahan',
    campaignId: 'camp-001',
    campaignTitle: 'Flood Relief for Sylhet',
    amount: 5000,
    message: 'Stay strong, praying for everyone affected.',
    isAnonymous: false,
    createdAt: '2024-06-05T10:30:00Z',
    status: 'completed',
  },
  {
    id: 'don-002',
    donorId: 'user-004',
    donorName: 'Nusrat Jahan',
    campaignId: 'camp-002',
    campaignTitle: 'Build a School in Char Fasson',
    amount: 10000,
    message: 'Education is the best investment.',
    isAnonymous: false,
    createdAt: '2024-06-10T14:00:00Z',
    status: 'completed',
  },
  {
    id: 'don-003',
    donorId: 'user-005',
    donorName: 'Sabbir Rahman',
    campaignId: 'camp-001',
    campaignTitle: 'Flood Relief for Sylhet',
    amount: 1000,
    isAnonymous: true,
    createdAt: '2024-06-07T09:00:00Z',
    status: 'completed',
  },
  {
    id: 'don-004',
    donorId: 'user-004',
    donorName: 'Nusrat Jahan',
    campaignId: 'camp-003',
    campaignTitle: 'Cancer Treatment for Roksana Khatun',
    amount: 2000,
    message: 'Wishing you a speedy recovery.',
    isAnonymous: false,
    createdAt: '2024-06-15T11:00:00Z',
    status: 'completed',
  },
  {
    id: 'don-005',
    donorId: 'user-005',
    donorName: 'Sabbir Rahman',
    campaignId: 'camp-004',
    campaignTitle: 'Plant 10000 Trees in Sundarbans',
    amount: 500,
    isAnonymous: false,
    createdAt: '2024-03-20T08:00:00Z',
    status: 'completed',
  },
  {
    id: 'don-006',
    donorId: 'user-004',
    donorName: 'Nusrat Jahan',
    campaignId: 'camp-005',
    campaignTitle: 'Street Dogs Rescue Dhaka',
    amount: 1500,
    message: 'Love for all animals!',
    isAnonymous: false,
    createdAt: '2024-07-05T16:00:00Z',
    status: 'pending',
  },
  {
    id: 'don-007',
    donorId: 'user-005',
    donorName: 'Sabbir Rahman',
    campaignId: 'camp-002',
    campaignTitle: 'Build a School in Char Fasson',
    amount: 3000,
    isAnonymous: true,
    createdAt: '2024-05-22T13:00:00Z',
    status: 'completed',
  },
  {
    id: 'don-008',
    donorId: 'user-004',
    donorName: 'Nusrat Jahan',
    campaignId: 'camp-004',
    campaignTitle: 'Plant 10000 Trees in Sundarbans',
    amount: 2500,
    message: 'Protect the Sundarbans!',
    isAnonymous: false,
    createdAt: '2024-02-14T10:00:00Z',
    status: 'refunded',
  },
  {
    id: 'don-009',
    donorId: 'user-005',
    donorName: 'Sabbir Rahman',
    campaignId: 'camp-003',
    campaignTitle: 'Cancer Treatment for Roksana Khatun',
    amount: 700,
    isAnonymous: false,
    createdAt: '2024-06-20T15:00:00Z',
    status: 'completed',
  },
  {
    id: 'don-010',
    donorId: 'user-004',
    donorName: 'Nusrat Jahan',
    campaignId: 'camp-006',
    campaignTitle: 'Community Library Rajshahi',
    amount: 8000,
    message: 'Books change lives!',
    isAnonymous: false,
    createdAt: '2024-08-25T12:00:00Z',
    status: 'pending',
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-002',
    type: 'donation',
    title: 'New Donation Received',
    message: 'Nusrat Jahan donated ৳5,000 to your campaign "Flood Relief for Sylhet".',
    isRead: false,
    createdAt: '2024-06-05T10:35:00Z',
  },
  {
    id: 'notif-002',
    userId: 'user-002',
    type: 'milestone',
    title: 'Campaign Milestone Reached!',
    message: '"Build a School in Char Fasson" has reached 75% of its goal. Keep going!',
    isRead: true,
    createdAt: '2024-06-12T08:00:00Z',
  },
  {
    id: 'notif-003',
    userId: 'user-004',
    type: 'system',
    title: 'Payment Confirmed',
    message: 'Your donation of ৳10,000 to "Build a School in Char Fasson" has been confirmed.',
    isRead: false,
    createdAt: '2024-06-10T14:05:00Z',
  },
  {
    id: 'notif-004',
    userId: 'user-003',
    type: 'comment',
    title: 'New Comment on Your Campaign',
    message: 'Someone left a comment on "Cancer Treatment for Roksana Khatun".',
    isRead: true,
    createdAt: '2024-06-18T09:20:00Z',
  },
  {
    id: 'notif-005',
    userId: 'user-001',
    type: 'system',
    title: 'New Campaign Submitted for Review',
    message: 'A new campaign "Community Library Rajshahi" has been submitted and needs admin review.',
    isRead: false,
    createdAt: '2024-08-20T13:05:00Z',
  },
]

export const mockComments: Comment[] = [
  {
    id: 'comment-001',
    userId: 'user-004',
    userName: 'Nusrat Jahan',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
    campaignId: 'camp-001',
    content: 'This is such an important cause. Praying for all the families affected by the floods.',
    createdAt: '2024-06-06T11:00:00Z',
  },
  {
    id: 'comment-002',
    userId: 'user-005',
    userName: 'Sabbir Rahman',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sabbir',
    campaignId: 'camp-001',
    content: 'Donated a small amount. Hope it helps!',
    createdAt: '2024-06-07T09:10:00Z',
  },
  {
    id: 'comment-003',
    userId: 'user-004',
    userName: 'Nusrat Jahan',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
    campaignId: 'camp-002',
    content: 'Education is so important. Every child deserves to learn. Thank you for doing this!',
    createdAt: '2024-06-11T15:30:00Z',
  },
  {
    id: 'comment-004',
    userId: 'user-005',
    userName: 'Sabbir Rahman',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sabbir',
    campaignId: 'camp-003',
    content: 'Wishing Roksana apa a full recovery. Stay strong!',
    createdAt: '2024-06-21T10:00:00Z',
  },
  {
    id: 'comment-005',
    userId: 'user-004',
    userName: 'Nusrat Jahan',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
    campaignId: 'camp-004',
    content: 'So proud to have contributed to this. The Sundarbans must be protected at all costs!',
    createdAt: '2024-02-16T08:45:00Z',
  },
  {
    id: 'comment-006',
    userId: 'user-005',
    userName: 'Sabbir Rahman',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sabbir',
    campaignId: 'camp-005',
    content: 'Thank you for caring for the street animals. They deserve love too.',
    createdAt: '2024-07-08T12:30:00Z',
  },
]