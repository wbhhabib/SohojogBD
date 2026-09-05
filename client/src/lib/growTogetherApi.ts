// ─────────────────────────────────────────────────────────────────────────
// GrowTogether — Wholesale Pooling data layer
//
// Talks to the real backend at /grow-together/pools (see
// server/src/modules/growtogether/). Every export keeps the exact async
// shape (`Promise<{ success, data }>`) that campaignApi / plantApi use in
// lib/api.ts.
// ─────────────────────────────────────────────────────────────────────────

import { api } from '@/lib/api'
import type { ApiResponse as BaseApiResponse } from '@/lib/api'
import { allDivision, DivisionName } from '@bangladeshi/bangladesh-address/build/src'

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

// Package's DivisionName enum is the source of truth for spelling —
// never hardcode division names elsewhere, to avoid silent filter mismatches.
export type Division = DivisionName

export const DIVISIONS: Division[] = allDivision() as DivisionName[]

export const UNITS = ['pcs', 'dozen', 'kg', 'bag', 'carton', 'box', 'liter', 'ream', 'gross', 'other']

export type PoolStatus = 'OPEN' | 'CLOSED' | 'CANCELLED'

export interface PoolPerson {
    id: string
    name: string
    avatar?: string | null
}

export interface PoolParticipant {
    id: string
    participant: PoolPerson
    note?: string | null
    createdAt: string
}

export interface WholesalePool {
    id: string
    slug: string
    title: string
    description: string
    category: PoolCategory
    unit: string
    division: Division
    district: string
    upazila: string
    location: string
    // owner অথবা verified viewer ছাড়া backend এই তিনটা null পাঠায়
    contactPhone: string | null
    groupLink: string | null
    facebookLink: string | null
    images: string[]
    status: PoolStatus
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
    division: Division
    district: string
    upazila: string
    location: string
    contactPhone: string
    groupLink: string
    facebookLink?: string
}

// `owner` is kept in the signature so callers don't need to change, but the
// backend derives the owner from the authenticated request, not this value.
export async function createPool(payload: CreatePoolPayload, _owner: PoolPerson): Promise<ApiResponse<WholesalePool>> {
    const res = await api.post<WholesalePool>('/grow-together/pools', payload)
    return toSimple(res) as ApiResponse<WholesalePool>
}

export interface JoinPoolPayload {
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