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

export interface PlantListing {
  id: string
  slug: string
  title: string
  description: string
  plantType: string
  quantity: number
  images: string[]
  location: string
  contactPhone?: string | null
  status: 'AVAILABLE' | 'CLAIMED' | 'COMPLETED' | 'CANCELLED'
  ownerId: string
  owner?: Pick<UserProfile, 'id' | 'name' | 'avatar' | 'email'>
  createdAt: string
  updatedAt: string
  _count?: { claims: number }
  claims?: PlantClaim[]
}

export type OrgCategory = 'REGISTERED' | 'TEAM'
export type OrgVerificationStatus =
  | 'PENDING' | 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED'
  | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'EXPIRED'
export type InstitutionAffiliation = 'YES' | 'NO' | 'NOT_APPLICABLE'

export interface AreaOfWork {
  id?: string
  area: string
  areaOther?: string | null
  description: string
}

export interface OrgRegistration {
  registrationAuthority: string
  authorityOther?: string | null
  registrationNumber?: string
  registrationDate: string
  expiryDate?: string | null
  certificateUrl?: string
}

export interface OrgTeamEvidence {
  pastActivities?: string | null
  activityCount?: number | null
  volunteerCountApprox?: number | null
  recentActivity?: string | null
  photos: string[]
  activityReportUrl?: string | null
  facebookPageUrl?: string | null
  previousCampaignLinks: string[]
  supportingDocUrl?: string | null
}

export interface OrgInstitution {
  institutionName: string
  institutionType: string
  department?: string | null
  clubName?: string | null
  advisorName?: string | null
  advisorContact?: string | null
  affiliated: InstitutionAffiliation
  authorizationDocUrl?: string | null
}

export interface OrgRepresentative {
  fullName: string
  designation: string
  designationOther?: string | null
  mobile: string
  email?: string | null
  nidNumber?: string
  nidDocUrl?: string
  authorizationDocUrl?: string | null
}

export interface Organization {
  id: string
  slug: string
  name: string
  description: string
  category: OrgCategory
  orgType: string
  orgTypeOther?: string | null
  establishedYear?: number | null
  logo?: string | null
  coverImage?: string | null
  contactPhone: string
  contactEmail?: string | null
  website?: string | null
  facebookPage?: string | null
  otherSocialLinks?: string | null

  division?: string | null
  district?: string | null
  upazila?: string | null
  fullAddress: string
  postalCode?: string | null
  latitude?: number | null
  longitude?: number | null

  status: OrgVerificationStatus
  adminNote?: string | null
  rejectReason?: string | null

  areasOfWork: AreaOfWork[]
  registration?: OrgRegistration | null
  teamEvidence?: OrgTeamEvidence | null
  institution?: OrgInstitution | null
  representative?: OrgRepresentative | null

  ownerId: string
  owner?: Pick<UserProfile, 'id' | 'name' | 'avatar'>
  createdAt: string
  updatedAt: string
  _count?: { requests: number; updates: number }
}

export interface OrgVerificationLog {
  id: string
  oldStatus: OrgVerificationStatus | null
  newStatus: OrgVerificationStatus
  reason?: string | null
  createdAt: string
  admin: { id: string; name: string }
}

export interface VolunteerRequest {
  id: string
  message?: string | null
  interestAreas: string[]
  availability?: string | null
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  createdAt: string
  volunteer?: Pick<UserProfile, 'id' | 'name' | 'avatar' | 'email'> & { phone?: string | null }
  organization?: Pick<Organization, 'id' | 'name' | 'slug' | 'logo' | 'category'>
}

export interface OrgUpdate {
  id: string
  title: string
  content: string
  images: string[]
  eventDate: string
  place: string
  division: string
  district: string
  upazila: string
  capacity?: number | null
  createdAt: string
  organizationId: string
  organization?: { id: string; name: string; slug: string; logo?: string | null; contactPhone?: string | null; ownerId?: string }
}

export interface EventRegistration {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  createdAt: string
  isRegisteredVolunteer: boolean
  fullName?: string | null
  phone?: string | null
  guardianPhone?: string | null
  message?: string | null
}

export interface MyEventRegistrationStatus {
  alreadyRegistered: boolean
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | null
  isRegisteredVolunteer: boolean
}

export interface AnalyzedPlant {
  title: string
  description: string
  plantType: string
  confidence: 'high' | 'medium' | 'low'
}

export interface PlantClaim {
  id: string
  message?: string | null
  quantity: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  createdAt: string
  claimant?: { id: string; name: string; avatar: string | null; phone?: string | null }
  listing?: { id: string; title: string; slug: string; images: string[]; status: string; location: string }
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
  errors?: { field: string; message: string }[]
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
    const errors = errData?.errors as { field: string; message: string }[] | undefined
    // Backend sends a generic 'Validation failed' plus a per-field errors array on
    // Zod validation errors. Every caller across the app just reads `message`, so
    // fold the specific field messages into it here instead of the generic text —
    // fixing this once fixes every form's error display at once.
    const message =
      errors && errors.length > 0
        ? errors.map((e) => e.message).join(' ')
        : errData?.message ?? `Request failed with status ${res.status}`
    return {
      success: false,
      message,
      data: errData as T,
      errors,
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



export const plantApi = {
  getAll(query = '') {
    return api.get<PlantListing[]>(`/plants${query ? `?${query}` : ''}`)
  },
  getImpactStats() {
    return api.get<{ given: number; available: number; connections: number }>('/plants/stats')
  },
  getBySlug(slug: string) {
    return api.get<PlantListing>(`/plants/${slug}`)
  },
  getMy(query = '') {
    return api.get<PlantListing[]>(`/plants/my${query ? `?${query}` : ''}`)
  },
  getMyById(id: string) {
    return api.get<PlantListing>(`/plants/my/${id}`)
  },
  create(payload: Record<string, unknown>) {
    return api.post<PlantListing>('/plants', payload)
  },
  update(id: string, payload: Record<string, unknown>) {
    return api.patch<PlantListing>(`/plants/${id}`, payload)
  },
  delete(id: string) {
    return api.delete(`/plants/${id}`)
  },
  markCompleted(id: string) {
    return api.post<PlantListing>(`/plants/${id}/complete`)
  },
  uploadImages(id: string, formData: FormData) {
    return request<PlantListing>(`/plants/${id}/images`, {
      method: 'POST',
      body: formData,
    })
  },
  analyzeImage(file: File) {
    const fd = new FormData()
    fd.append('image', file)
    return request<AnalyzedPlant>('/plants/analyze-image', {
      method: 'POST',
      body: fd,
    })
  },
  requestClaim(listingId: string, payload: { message?: string; quantity: number }) {
    return api.post<PlantClaim>(`/plants/${listingId}/claims`, payload)
  },
  getMyClaims(query = '') {
    return api.get<PlantClaim[]>(`/plants/claims/my${query ? `?${query}` : ''}`)
  },
  respondToClaim(claimId: string, status: 'ACCEPTED' | 'REJECTED') {
    return api.patch<PlantClaim>(`/plants/claims/${claimId}`, { status })
  },
  cancelClaim(claimId: string) {
    return api.delete(`/plants/claims/${claimId}`)
  },
}

export const orgApi = {
  getAll(query = '') {
    return api.get<Organization[]>(`/orgs${query ? `?${query}` : ''}`)
  },
  getBySlug(slug: string) {
    return api.get<Organization>(`/orgs/${slug}`)
  },
  getMy(query = '') {
    return api.get<Organization[]>(`/orgs/my${query ? `?${query}` : ''}`)
  },
  create(payload: Record<string, unknown>) {
    return api.post<Organization>('/orgs', payload)
  },
  update(id: string, payload: Record<string, unknown>) {
    return api.patch<Organization>(`/orgs/${id}`, payload)
  },
  delete(id: string) {
    return api.delete(`/orgs/${id}`)
  },
  sendVolunteerRequest(orgId: string, payload: Record<string, unknown>) {
    return api.post<VolunteerRequest>(`/orgs/${orgId}/requests`, payload)
  },
  getOrgRequests(orgId: string, query = '') {
    return api.get<VolunteerRequest[]>(`/orgs/${orgId}/requests${query ? `?${query}` : ''}`)
  },
  getMyVolunteerRequests(query = '') {
    return api.get<VolunteerRequest[]>(`/orgs/requests/my${query ? `?${query}` : ''}`)
  },
  respondToRequest(requestId: string, status: 'ACCEPTED' | 'REJECTED') {
    return api.patch<VolunteerRequest>(`/orgs/requests/${requestId}`, { status })
  },
  cancelRequest(requestId: string) {
    return api.delete(`/orgs/requests/${requestId}`)
  },
  createUpdate(orgId: string, payload: Record<string, unknown>) {
    return api.post<OrgUpdate>(`/orgs/${orgId}/updates`, payload)
  },
  getEventsFeed(query = '') {
    return api.get<OrgUpdate[]>(`/orgs/updates/feed${query ? `?${query}` : ''}`)
  },
  getEventById(id: string) {
    return api.get<OrgUpdate>(`/orgs/updates/feed/${id}`)
  },
  uploadUpdateImage(fd: FormData) {
    return api.post<{ url: string }>('/orgs/updates/upload-image', fd)
  },
  getUpdates(orgId: string, query = '') {
    return api.get<OrgUpdate[]>(`/orgs/${orgId}/updates${query ? `?${query}` : ''}`)
  },
  uploadImages(id: string, formData: FormData) {
    return request<Organization>(`/orgs/${id}/images`, {
      method: 'POST',
      body: formData,
    })
  },
  deleteUpdate(updateId: string) {
    return api.delete(`/orgs/updates/${updateId}`)
  },
  createEventRegistration(eventId: string, payload: Record<string, unknown>) {
    return api.post<EventRegistration>(`/orgs/updates/${eventId}/registrations`, payload)
  },
  getEventRegistrations(eventId: string, query = '') {
    return api.get<EventRegistration[]>(`/orgs/updates/${eventId}/registrations${query ? `?${query}` : ''}`)
  },
  getMyEventRegistrationStatus(eventId: string) {
    return api.get<MyEventRegistrationStatus>(`/orgs/updates/${eventId}/registrations/me`)
  },
  respondToEventRegistration(registrationId: string, status: 'ACCEPTED' | 'REJECTED', message?: string) {
    return api.patch<EventRegistration>(`/orgs/registrations/${registrationId}`, { status, message })
  },
  // ── Verification document upload ──────────────────────────────────────
  uploadDocument(file: File) {
    const fd = new FormData()
    fd.append('document', file)
    return request<{ url: string }>('/orgs/documents', {
      method: 'POST',
      body: fd,
    })
  },
  // ── Admin verification dashboard ──────────────────────────────────────
  adminGetAll(query = '') {
    return api.get<Organization[]>(`/orgs/admin/all${query ? `?${query}` : ''}`)
  },
  adminGetById(id: string) {
    return api.get<Organization & { verificationLogs: OrgVerificationLog[] }>(`/orgs/admin/${id}`)
  },
  adminUpdateStatus(id: string, payload: { status: OrgVerificationStatus; reason?: string; adminNote?: string }) {
    return api.patch<Organization>(`/orgs/admin/${id}/status`, payload)
  },
}


export const pushApi = {
  getVapidPublicKey() {
    return api.get<{ publicKey: string }>('/push/vapid-public-key')
  },
  subscribe(subscription: PushSubscriptionJSON) {
    return api.post('/push/subscribe', subscription)
  },
  unsubscribe(endpoint: string) {
    return api.post('/push/unsubscribe', { endpoint })
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

// ── Authenticated document viewer (NID/certificate/etc — not plain public URLs) ──
export async function openOrgDocument(url: string): Promise<void> {
  const token = getAccessToken()
  // Some documents may have been saved with an old/duplicated "/api/v1" prefix
  // (a past backend bug) — strip it so this works for both old and new data.
  const path = url.replace(/^\/api\/v1/, '')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    alert('Could not open this document.')
    return
  }
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  window.open(objectUrl, '_blank')
}


export type SOSStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED'
export type SOSResponseStatus = 'ACKNOWLEDGED' | 'ON_THE_WAY' | 'ARRIVED'

export interface SOSRequest {
  id: string
  message: string
  latitude: number
  longitude: number
  address?: string | null
  status: SOSStatus
  createdAt: string
  updatedAt: string
  requesterId: string
  requester?: { id: string; name: string; avatar: string | null; phone: string | null }
  _count?: { responses: number }
  notifiedCount?: number
}

export interface SOSResponseItem {
  id: string
  status: SOSResponseStatus
  createdAt: string
  responder: { id: string; name: string; avatar: string | null; phone: string | null }
}

export interface SOSRequestDetail extends SOSRequest {
  responses: SOSResponseItem[]
}

export interface SOSNearbyItem extends SOSRequest {
  distanceKm: number
}

export interface ResponderSettings {
  respLat: number | null
  respLng: number | null
  respRadiusKm: number | null
  pushEnabled: boolean
}

export const sosApi = {
  create(payload: { message: string; latitude: number; longitude: number; address?: string; radiusKm?: number }) {
    return api.post<SOSRequest>('/sos', payload)
  },
  getById(id: string) {
    return api.get<SOSRequestDetail>(`/sos/${id}`)
  },
  getMy() {
    return api.get<SOSRequest[]>('/sos/my')
  },
  getNearby() {
    return api.get<SOSNearbyItem[]>('/sos/nearby')
  },
  respond(id: string, status: SOSResponseStatus) {
    return api.post(`/sos/${id}/respond`, { status })
  },
  updateStatus(id: string, status: 'RESOLVED' | 'CANCELLED') {
    return api.patch<SOSRequest>(`/sos/${id}/status`, { status })
  },
  getResponderSettings() {
    return api.get<ResponderSettings>('/sos/responder-settings')
  },
  updateResponderSettings(payload: {
    respLat?: number | null
    respLng?: number | null
    respRadiusKm?: number
    pushEnabled?: boolean
  }) {
    return api.patch<ResponderSettings>('/sos/responder-settings', payload)
  },
}