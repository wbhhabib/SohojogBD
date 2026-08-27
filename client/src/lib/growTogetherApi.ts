// ─────────────────────────────────────────────────────────────────────────
// GrowTogether — Wholesale Pooling data layer
//
// Frontend-only phase: no backend module exists yet, so this file simulates
// one. Every export has the exact async shape (`Promise<{ success, data }>`)
// that campaignApi / plantApi already use in lib/api.ts. When the real
// `/grow-together` backend module ships, only the bodies of these functions
// need to change — every page importing from here stays untouched.
//
// Data is seeded once into localStorage, then read/written from there, so
// pools and interests created during this session survive a refresh.
// ─────────────────────────────────────────────────────────────────────────

export type PoolCategory =
    | 'Kirana / Grocery'
    | 'Garments & Fabric'
    | 'Electronics & Gadgets'
    | 'Cosmetics & Beauty'
    | 'Stationery & Office'
    | 'Hardware & Tools'
    | 'Food & Snacks'
    | 'Agriculture Inputs'
    | 'Footwear'
    | 'Other'

export const POOL_CATEGORIES: PoolCategory[] = [
    'Kirana / Grocery',
    'Garments & Fabric',
    'Electronics & Gadgets',
    'Cosmetics & Beauty',
    'Stationery & Office',
    'Hardware & Tools',
    'Food & Snacks',
    'Agriculture Inputs',
    'Footwear',
    'Other',
]

export const CATEGORY_EMOJI: Record<PoolCategory, string> = {
    'Kirana / Grocery': '🛒',
    'Garments & Fabric': '🧵',
    'Electronics & Gadgets': '🔌',
    'Cosmetics & Beauty': '💄',
    'Stationery & Office': '✏️',
    'Hardware & Tools': '🔧',
    'Food & Snacks': '🍪',
    'Agriculture Inputs': '🌾',
    'Footwear': '👟',
    'Other': '📦',
}

export type Division =
    | 'Dhaka' | 'Chattogram' | 'Rajshahi' | 'Khulna'
    | 'Barishal' | 'Sylhet' | 'Rangpur' | 'Mymensingh'

export const DIVISIONS: Division[] = [
    'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna',
    'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh',
]

export const UNITS = ['pcs', 'dozen', 'kg', 'bag', 'carton', 'box', 'liter', 'ream', 'gross', 'other']

export type PoolStatus = 'OPEN' | 'TARGET_REACHED' | 'CLOSED' | 'CANCELLED'

export interface PoolPerson {
    id: string
    name: string
    avatar?: string | null
}

export interface PoolParticipant {
    id: string
    participant: PoolPerson
    quantity: number
    note?: string
    createdAt: string
}

export interface WholesalePool {
    id: string
    slug: string
    title: string
    description: string
    category: PoolCategory
    unit: string
    targetQuantity: number
    minJoinQuantity: number
    pricePerUnit: number
    marketPricePerUnit?: number | null
    division: Division
    location: string
    contactPhone: string
    groupLink?: string | null
    images: string[]
    status: PoolStatus
    deadline: string
    ownerId: string
    owner: PoolPerson
    participants: PoolParticipant[]
    createdAt: string
}

export interface ApiResponse<T> {
    success: boolean
    message?: string
    data: T
}

// ── helpers ────────────────────────────────────────────────────────────

function slugify(title: string): string {
    return (
        title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 60) || 'pool'
    )
}

export function joinedQuantity(pool: WholesalePool): number {
    return pool.participants.reduce((sum, p) => sum + p.quantity, 0)
}

export function progressPct(pool: WholesalePool): number {
    if (pool.targetQuantity <= 0) return 0
    return Math.min(100, Math.round((joinedQuantity(pool) / pool.targetQuantity) * 100))
}

export function savingsPct(pool: WholesalePool): number | null {
    if (!pool.marketPricePerUnit || pool.marketPricePerUnit <= pool.pricePerUnit) return null
    return Math.round(((pool.marketPricePerUnit - pool.pricePerUnit) / pool.marketPricePerUnit) * 100)
}

export function daysLeft(deadline: string): number {
    const diff = new Date(deadline).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function delay<T>(value: T, ms = 250): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ── seed data ──────────────────────────────────────────────────────────

const SEED_POOLS: WholesalePool[] = [
    {
        id: 'pool-001',
        slug: 'winter-jacket-lot-gausia-2026',
        title: 'Winter Jacket Wholesale Lot (Gausia Supplier)',
        description:
            "A Gausia stockist is offering men's & women's winter jackets at ৳420/pc if we take a minimum lot of 100 pieces — almost 40% below usual retail-lot price. Mixed sizes (M/L/XL), 6 colors. Great for shop owners stocking up before winter season.",
        category: 'Garments & Fabric',
        unit: 'pcs',
        targetQuantity: 100,
        minJoinQuantity: 5,
        pricePerUnit: 420,
        marketPricePerUnit: 650,
        division: 'Dhaka',
        location: 'Mirpur 10, Dhaka',
        contactPhone: '01711-223344',
        groupLink: 'https://chat.whatsapp.com/growtogether-jacket-demo',
        images: [],
        status: 'OPEN',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
        ownerId: 'seed-owner-1',
        owner: { id: 'seed-owner-1', name: 'Kamal Hossain' },
        participants: [
            { id: 'pt-1', participant: { id: 'p1', name: 'Shirin Akter' }, quantity: 15, note: 'Need mostly M/L sizes', createdAt: iso(-6) },
            { id: 'pt-2', participant: { id: 'p2', name: 'Jasim Uddin' }, quantity: 20, createdAt: iso(-4) },
            { id: 'pt-3', participant: { id: 'p3', name: 'Nasrin Begum' }, quantity: 10, createdAt: iso(-2) },
        ],
        createdAt: iso(-10),
    },
    {
        id: 'pool-002',
        slug: 'led-bulb-carton-order-chattogram',
        title: 'LED Bulb 9W Bulk Order — Factory Rate',
        description:
            'Direct-from-factory LED bulb price drops to ৳55/pc once we cross 50 cartons (24 pcs/carton). Perfect for hardware shop owners and electricians who resell. 2-year warranty included, factory will deliver to Agrabad depot.',
        category: 'Hardware & Tools',
        unit: 'carton',
        targetQuantity: 50,
        minJoinQuantity: 2,
        pricePerUnit: 1320,
        marketPricePerUnit: 1800,
        division: 'Chattogram',
        location: 'Agrabad, Chattogram',
        contactPhone: '01822-556677',
        groupLink: 'https://chat.whatsapp.com/growtogether-led-demo',
        images: [],
        status: 'OPEN',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        ownerId: 'seed-owner-2',
        owner: { id: 'seed-owner-2', name: 'Farid Ahmed' },
        participants: [
            { id: 'pt-4', participant: { id: 'p4', name: 'Rubel Mia' }, quantity: 8, createdAt: iso(-3) },
        ],
        createdAt: iso(-8),
    },
    {
        id: 'pool-003',
        slug: 'basmati-rice-50kg-bag-mymensingh',
        title: '50kg Basmati Rice Bags — Miller Direct Rate',
        description:
            'A miller in Mymensingh is offering premium basmati at ৳4,150 per 50kg bag for orders above 40 bags, ৳300 cheaper per bag than wholesale market rate. Ideal for grocery shop owners and mess/hostel suppliers.',
        category: 'Kirana / Grocery',
        unit: 'bag',
        targetQuantity: 40,
        minJoinQuantity: 1,
        pricePerUnit: 4150,
        marketPricePerUnit: 4450,
        division: 'Mymensingh',
        location: 'Notun Bazar, Mymensingh',
        contactPhone: '01911-889900',
        groupLink: '',
        images: [],
        status: 'OPEN',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
        ownerId: 'seed-owner-3',
        owner: { id: 'seed-owner-3', name: 'Abul Kalam' },
        participants: [
            { id: 'pt-5', participant: { id: 'p5', name: 'Moyna Begum' }, quantity: 12, createdAt: iso(-5) },
            { id: 'pt-6', participant: { id: 'p6', name: 'Sohel Rana' }, quantity: 18, createdAt: iso(-1) },
        ],
        createdAt: iso(-7),
    },
    {
        id: 'pool-004',
        slug: 'cosmetics-lot-khulna-port',
        title: 'Imported Cosmetics Lot — Port Clearance Rate',
        description:
            'Mixed imported cosmetics lot (lipstick, kajal, face cream) cleared from Mongla port, sold at ৳90/pc for orders over 500 pcs. Great starter lot for online sellers and small beauty shops.',
        category: 'Cosmetics & Beauty',
        unit: 'pcs',
        targetQuantity: 500,
        minJoinQuantity: 20,
        pricePerUnit: 90,
        marketPricePerUnit: 150,
        division: 'Khulna',
        location: 'Sonadanga, Khulna',
        contactPhone: '01633-112200',
        groupLink: 'https://chat.whatsapp.com/growtogether-cosmetics-demo',
        images: [],
        status: 'OPEN',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
        ownerId: 'seed-owner-4',
        owner: { id: 'seed-owner-4', name: 'Taslima Khatun' },
        participants: [
            { id: 'pt-7', participant: { id: 'p7', name: 'Bithi Rani' }, quantity: 60, createdAt: iso(-2) },
        ],
        createdAt: iso(-4),
    },
    {
        id: 'pool-005',
        slug: 'exercise-book-ream-sylhet',
        title: 'Exercise Book & Ream Paper — School Season Rate',
        description:
            "Publisher is offering 200-page exercise books at ৳28/pc and A4 ream paper at ৳310/ream for combined orders above 800 pcs, ahead of new school session. Good for stationery shop owners near school zones.",
        category: 'Stationery & Office',
        unit: 'pcs',
        targetQuantity: 800,
        minJoinQuantity: 30,
        pricePerUnit: 28,
        marketPricePerUnit: 38,
        division: 'Sylhet',
        location: 'Zindabazar, Sylhet',
        contactPhone: '01755-334455',
        groupLink: '',
        images: [],
        status: 'OPEN',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
        ownerId: 'seed-owner-5',
        owner: { id: 'seed-owner-5', name: 'Habibur Rahman' },
        participants: [
            { id: 'pt-8', participant: { id: 'p8', name: 'Ismail Hossain' }, quantity: 150, createdAt: iso(-3) },
            { id: 'pt-9', participant: { id: 'p9', name: 'Kulsum Bibi' }, quantity: 200, createdAt: iso(-1) },
        ],
        createdAt: iso(-6),
    },
    {
        id: 'pool-006',
        slug: 'poultry-feed-bag-rangpur',
        title: 'Poultry Feed Bags — Depot Rate',
        description:
            'Layer feed 50kg bags at ৳2,650 (depot rate) for orders above 60 bags, versus ৳2,900 at the retail counter. Useful for small poultry-farm owners buying together.',
        category: 'Agriculture Inputs',
        unit: 'bag',
        targetQuantity: 60,
        minJoinQuantity: 3,
        pricePerUnit: 2650,
        marketPricePerUnit: 2900,
        division: 'Rangpur',
        location: 'Modern More, Rangpur',
        contactPhone: '01944-778899',
        groupLink: 'https://chat.whatsapp.com/growtogether-feed-demo',
        images: [],
        status: 'TARGET_REACHED',
        deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        ownerId: 'seed-owner-6',
        owner: { id: 'seed-owner-6', name: 'Aynal Haque' },
        participants: [
            { id: 'pt-10', participant: { id: 'p10', name: 'Rezaul Karim' }, quantity: 25, createdAt: iso(-9) },
            { id: 'pt-11', participant: { id: 'p11', name: 'Momtaz Ali' }, quantity: 35, createdAt: iso(-5) },
        ],
        createdAt: iso(-15),
    },
]

function iso(daysFromNow: number): string {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * daysFromNow).toISOString()
}

// ── localStorage-backed store ─────────────────────────────────────────

const STORAGE_KEY = 'sohojogbd:growtogether:pools'

function loadPools(): WholesalePool[] {
    if (typeof window === 'undefined') return SEED_POOLS
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POOLS))
            return SEED_POOLS
        }
        return JSON.parse(raw) as WholesalePool[]
    } catch {
        return SEED_POOLS
    }
}

function savePools(pools: WholesalePool[]) {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pools))
    } catch {
        // ignore quota errors
    }
}

// ── public API ─────────────────────────────────────────────────────────

export interface PoolFilters {
    search?: string
    category?: PoolCategory | 'All'
    division?: Division | 'All'
    page?: number
    limit?: number
}

export async function getPools(filters: PoolFilters = {}): Promise<ApiResponse<{ pools: WholesalePool[]; total: number }>> {
    let pools = loadPools()

    if (filters.search?.trim()) {
        const q = filters.search.trim().toLowerCase()
        pools = pools.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.location.toLowerCase().includes(q)
        )
    }
    if (filters.category && filters.category !== 'All') {
        pools = pools.filter((p) => p.category === filters.category)
    }
    if (filters.division && filters.division !== 'All') {
        pools = pools.filter((p) => p.division === filters.division)
    }

    // newest first
    pools = [...pools].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = pools.length
    const page = filters.page ?? 1
    const limit = filters.limit ?? 9
    const start = (page - 1) * limit
    const paged = pools.slice(start, start + limit)

    return delay({ success: true, data: { pools: paged, total } })
}

export async function getPoolBySlug(slug: string): Promise<ApiResponse<WholesalePool | null>> {
    const pool = loadPools().find((p) => p.slug === slug) ?? null
    return delay({ success: true, data: pool })
}

export async function getMyPools(userId: string): Promise<ApiResponse<WholesalePool[]>> {
    const pools = loadPools().filter((p) => p.ownerId === userId)
    return delay({ success: true, data: pools })
}

export async function getJoinedPools(userId: string): Promise<ApiResponse<WholesalePool[]>> {
    const pools = loadPools().filter((p) => p.participants.some((pt) => pt.participant.id === userId))
    return delay({ success: true, data: pools })
}

export interface CreatePoolPayload {
    title: string
    description: string
    category: PoolCategory
    unit: string
    targetQuantity: number
    minJoinQuantity: number
    pricePerUnit: number
    marketPricePerUnit?: number
    division: Division
    location: string
    contactPhone: string
    groupLink?: string
    deadline: string
}

export async function createPool(payload: CreatePoolPayload, owner: PoolPerson): Promise<ApiResponse<WholesalePool>> {
    const pools = loadPools()
    const base = slugify(payload.title)
    let slug = base
    let n = 1
    while (pools.some((p) => p.slug === slug)) {
        slug = `${base}-${n++}`
    }

    const newPool: WholesalePool = {
        id: `pool-${Date.now()}`,
        slug,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        unit: payload.unit,
        targetQuantity: payload.targetQuantity,
        minJoinQuantity: payload.minJoinQuantity,
        pricePerUnit: payload.pricePerUnit,
        marketPricePerUnit: payload.marketPricePerUnit ?? null,
        division: payload.division,
        location: payload.location,
        contactPhone: payload.contactPhone,
        groupLink: payload.groupLink || '',
        images: [],
        status: 'OPEN',
        deadline: payload.deadline,
        ownerId: owner.id,
        owner,
        participants: [],
        createdAt: new Date().toISOString(),
    }

    const next = [newPool, ...pools]
    savePools(next)
    return delay({ success: true, data: newPool }, 350)
}

export interface JoinPoolPayload {
    quantity: number
    note?: string
}

export async function joinPool(
    poolId: string,
    payload: JoinPoolPayload,
    participant: PoolPerson
): Promise<ApiResponse<WholesalePool | null>> {
    const pools = loadPools()
    const idx = pools.findIndex((p) => p.id === poolId)
    if (idx === -1) return delay({ success: false, message: 'Pool not found', data: null })

    const pool = pools[idx]
    const alreadyIn = pool.participants.some((pt) => pt.participant.id === participant.id)
    if (alreadyIn) return delay({ success: false, message: 'You have already joined this pool', data: null })

    const updatedPool: WholesalePool = {
        ...pool,
        participants: [
            ...pool.participants,
            {
                id: `pt-${Date.now()}`,
                participant,
                quantity: payload.quantity,
                note: payload.note,
                createdAt: new Date().toISOString(),
            },
        ],
    }
    if (joinedQuantity(updatedPool) >= updatedPool.targetQuantity && updatedPool.status === 'OPEN') {
        updatedPool.status = 'TARGET_REACHED'
    }

    const next = [...pools]
    next[idx] = updatedPool
    savePools(next)
    return delay({ success: true, data: updatedPool }, 350)
}

export async function cancelPool(poolId: string, ownerId: string): Promise<ApiResponse<null>> {
    const pools = loadPools()
    const idx = pools.findIndex((p) => p.id === poolId && p.ownerId === ownerId)
    if (idx === -1) return delay({ success: false, message: 'Pool not found', data: null })
    pools[idx] = { ...pools[idx], status: 'CANCELLED' }
    savePools(pools)
    return delay({ success: true, data: null })
}

export async function leavePool(poolId: string, participantId: string): Promise<ApiResponse<null>> {
    const pools = loadPools()
    const idx = pools.findIndex((p) => p.id === poolId)
    if (idx === -1) return delay({ success: false, message: 'Pool not found', data: null })
    const pool = pools[idx]
    const updatedParticipants = pool.participants.filter((pt) => pt.participant.id !== participantId)
    pools[idx] = {
        ...pool,
        participants: updatedParticipants,
        status: pool.status === 'TARGET_REACHED' && joinedQuantity({ ...pool, participants: updatedParticipants }) < pool.targetQuantity
            ? 'OPEN'
            : pool.status,
    }
    savePools(pools)
    return delay({ success: true, data: null })
}