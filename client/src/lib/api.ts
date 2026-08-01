import { getAccessToken, setAccessToken, clearAccessToken } from '@/lib/auth-store'

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'



export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'DONOR' | 'CREATOR' | 'ADMIN'
  avatar: string | null
  phone?: string | null
  address?: string | null
  bio?: string | null
  isVerified: boolean
  isBanned?: boolean
  createdAt: string
  updatedAt?: string
}

export interface Campaign {
  id: string
  slug: string
  title: string
  description: string
  story: string
  goalAmount: number
  raisedAmount: number
  donorCount: number
  category: string
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'PAUSED' | 'SUSPENDED' | 'PENDING' | 'REJECTED'
  coverImage: string | null
  images: string[]
  beneficiaryName: string
  beneficiaryInfo: string | null
  deadline: string | null
  creatorId: string
  createdAt: string
  updatedAt: string
  creator?: Pick<UserProfile, 'id' | 'name' | 'avatar'>
  creatorName?: string
  creatorAvatar?: string
}

export interface CampaignUpdate {
  id: string
  campaignId: string
  title: string
  content: string
  createdAt: string
}

export interface Donation {
  id: string
  donorId: string
  campaignId: string
  amount: number
  message?: string | null
  isAnonymous: boolean
  status: 'pending' | 'completed' | 'refunded'
  createdAt: string
  updatedAt?: string
  donor?: { id: string; name: string; avatar?: string | null }
  campaign?: { id: string; title: string; slug: string }
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  link?: string | null
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data: T
  meta?: PaginationMeta
}



async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })





  const isAuthEndpoint = path.startsWith('/auth/')
  if (res.status === 401 && retry && !isAuthEndpoint) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const newToken: string =
          refreshData?.data?.accessToken ?? refreshData?.accessToken
        if (newToken) {
          setAccessToken(newToken)
          return request<T>(path, options, false)
        }
      }
    } catch {

    }
    clearAccessToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    return {
      success: false,
      message: errData?.message ?? `Request failed with status ${res.status}`,
      data: errData as T,
    }
  }


  if (res.status === 204) {
    return { success: true, data: undefined as unknown as T }
  }

  return res.json()
}



export const api = {
  get<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  },
  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  },
  patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  },
  delete<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>(path, { method: 'DELETE' })
  },
}



export const authApi = {
  login(email: string, password: string, rememberMe = false) {
    return api.post<{ user: UserProfile; accessToken: string }>(
      '/auth/login',
      { email, password, rememberMe }
    )
  },
  register(payload: { name: string; email: string; password: string; role: string }) {
    return api.post<{ message: string }>('/auth/register', payload)
  },
  logout() {
    return api.post('/auth/logout')
  },
  verifyEmail(token: string) {
    return api.post<{ message: string }>('/auth/verify-email', { token })
  },
  forgotPassword(email: string) {
    return api.post<{ message: string }>('/auth/forgot-password', { email })
  },
  resetPassword(token: string, password: string) {
    return api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    })
  },
  refresh() {
    return request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    })
  },
}



export const userApi = {
  getMe() {
    return api.get<UserProfile>('/users/me')
  },
  updateMe(payload: Partial<Pick<UserProfile, 'name' | 'bio' | 'phone' | 'address'>>) {
    return api.patch<UserProfile>('/users/me', payload)
  },
  uploadAvatar(file: File) {
    const fd = new FormData()
    fd.append('avatar', file)
    return request<UserProfile>('/users/me/avatar', {
      method: 'POST',
      body: fd,
    })
  },
  changePassword(currentPassword: string, newPassword: string) {
    return api.patch<{ message: string }>('/users/me/password', {
      currentPassword,
      newPassword,
    })
  },
  updateNotificationPrefs(prefs: Record<string, boolean>) {
    return api.patch<UserProfile>('/users/me/notifications', prefs)
  },
}



export const campaignApi = {
  getAll(query = '') {
    return api.get<Campaign[]>(`/campaigns${query ? `?${query}` : ''}`)
  },
  getBySlug(slug: string) {
    return api.get<Campaign>(`/campaigns/${slug}`)
  },
  getById(id: string) {
    return api.get<Campaign>(`/campaigns/${id}`)
  },
  // Fetch creator's own campaign by DB id (works for all statuses including DRAFT/PAUSED)
  getMyById(id: string) {
    return api.get<Campaign>(`/campaigns/my/${id}`)
  },
  getMy(query = '') {
    return api.get<Campaign[]>(`/campaigns/my${query ? `?${query}` : ''}`)
  },
  create(payload: Record<string, unknown>) {
    return api.post<Campaign>('/campaigns', payload)
  },
  update(id: string, payload: Record<string, unknown>) {
    return api.patch<Campaign>(`/campaigns/${id}`, payload)
  },
  delete(id: string) {
    return api.delete(`/campaigns/${id}`)
  },
  uploadCover(slug: string, formData: FormData) {
    return request<Campaign>(`/campaigns/${slug}/cover`, {
      method: 'POST',
      body: formData,
    })
  },
  getUpdates(campaignId: string) {
    return api.get<CampaignUpdate[]>(`/campaigns/${campaignId}/updates`)
  },
  addUpdate(campaignId: string, payload: { title: string; content: string }) {
    return api.post<CampaignUpdate>(`/campaigns/${campaignId}/updates`, payload)
  },
}



export const donationApi = {
  create(payload: {
    campaignId: string
    amount: number
    message?: string
    isAnonymous?: boolean
  }) {
    return api.post<Donation>('/donations', payload)
  },
  initiatePayment(donationId: string) {
    return api.post<{ gatewayUrl: string }>(`/donations/${donationId}/pay`)
  },
  getMy(query = '') {
    return api.get<Donation[]>(`/donations/my${query ? `?${query}` : ''}`)
  },
  getCampaignDonations(campaignId: string, query = '') {
    return api.get<Donation[]>(
      `/donations/campaign/${campaignId}${query ? `?${query}` : ''}`
    )
  },


  mockConfirm(donationId: string) {
    return api.post<Donation>(`/donations/${donationId}/mock-confirm`)
  },
}



export const notificationApi = {
  getAll(query = '') {
    return api.get<Notification[]>(
      `/notifications${query ? `?${query}` : ''}`
    )
  },
  getUnreadCount() {
    return api.get<{ count: number }>('/notifications/unread-count')
  },
  markAsRead(id: string) {
    return api.patch(`/notifications/${id}/read`)
  },
  markAllAsRead() {
    return api.patch('/notifications/read-all')
  },
}