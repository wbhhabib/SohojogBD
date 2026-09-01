// ─────────────────────────────────────────────────────────────────────────
// GrowTogether — Wholesale Pooling data layer
//
// Talks to the real backend at /grow-together/pools (see
// server/src/modules/growtogether/). Every export keeps the exact async
// shape (`Promise<{ success, data }>`) that campaignApi / plantApi use in
// lib/api.ts, and the same function names/signatures as the earlier
// localStorage-backed version, so page.tsx / create/page.tsx /
// [slug]/page.tsx / my/page.tsx don't need to change.
// ─────────────────────────────────────────────────────────────────────────

import { api } from '@/lib/api'
import type { ApiResponse as BaseApiResponse } from '@/lib/api'

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
    district: string
    upazila: string
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

// ── derived helpers (pure, unchanged) ────────────────────────────────────

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

// ── helpers to adapt lib/api.ts's ApiResponse (with meta/errors) to the
//    simpler { success, data } shape this file has always exposed ────────

function toSimple<T>(res: BaseApiResponse<T>): ApiResponse<T> {
    return { success: res.success, message: res.message, data: res.data }
}

function qs(params: Record<string, string | number | undefined>): string {
    const usp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '' && v !== 'All') usp.set(k, String(v))
    }
    const s = usp.toString()
    return s ? `?${s}` : ''
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
    const query = qs({
        search: filters.search,
        category: filters.category,
        division: filters.division,
        page: filters.page,
        limit: filters.limit ?? 9,
    })
    const res = await api.get<WholesalePool[]>(`/grow-together/pools${query}`)
    return {
        success: res.success,
        message: res.message,
        data: { pools: res.data ?? [], total: res.meta?.total ?? (res.data?.length ?? 0) },
    }
}

export async function getPoolBySlug(slug: string): Promise<ApiResponse<WholesalePool | null>> {
    const res = await api.get<WholesalePool>(`/grow-together/pools/${slug}`)
    if (!res.success) return { success: false, message: res.message, data: null }
    return toSimple(res)
}

export async function getMyPools(_userId: string): Promise<ApiResponse<WholesalePool[]>> {
    const res = await api.get<WholesalePool[]>('/grow-together/pools/my')
    return { success: res.success, message: res.message, data: res.data ?? [] }
}

export async function getJoinedPools(_userId: string): Promise<ApiResponse<WholesalePool[]>> {
    const res = await api.get<WholesalePool[]>('/grow-together/pools/joined')
    return { success: res.success, message: res.message, data: res.data ?? [] }
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
    district: string
    upazila: string
    location: string
    contactPhone: string
    groupLink?: string
    deadline: string
}

// `owner` is kept in the signature so callers don't need to change, but the
// backend derives the owner from the authenticated request, not this value.
export async function createPool(payload: CreatePoolPayload, _owner: PoolPerson): Promise<ApiResponse<WholesalePool>> {
    const res = await api.post<WholesalePool>('/grow-together/pools', payload)
    return toSimple(res) as ApiResponse<WholesalePool>
}

export interface JoinPoolPayload {
    quantity: number
    note?: string
}

// `participant` is kept in the signature so callers don't need to change,
// but the backend derives the participant from the authenticated request.
export async function joinPool(
    poolId: string,
    payload: JoinPoolPayload,
    _participant: PoolPerson
): Promise<ApiResponse<WholesalePool | null>> {
    const res = await api.post<WholesalePool>(`/grow-together/pools/${poolId}/join`, payload)
    if (!res.success) return { success: false, message: res.message, data: null }
    return toSimple(res)
}

export async function cancelPool(poolId: string, _ownerId: string): Promise<ApiResponse<null>> {
    const res = await api.post<null>(`/grow-together/pools/${poolId}/cancel`)
    return { success: res.success, message: res.message, data: null }
}

export async function leavePool(poolId: string, _participantId: string): Promise<ApiResponse<null>> {
    const res = await api.post<null>(`/grow-together/pools/${poolId}/leave`)
    return { success: res.success, message: res.message, data: null }
}