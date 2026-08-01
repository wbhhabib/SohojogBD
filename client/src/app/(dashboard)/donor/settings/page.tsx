
'use client'

import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { userApi } from '@/lib/api'
import type { UserProfile } from '@/lib/api'
import { Camera, Check, Loader2 } from 'lucide-react'

type Tab = 'profile' | 'security' | 'notifications' | 'privacy'

const TABS: { label: string; value: Tab }[] = [
  { label: 'Profile',       value: 'profile'       },
  { label: 'Security',      value: 'security'      },
  { label: 'Notifications', value: 'notifications' },
  { label: 'Privacy',       value: 'privacy'       },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-emerald-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function DonorSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')


  const [profile, setProfile]               = useState<UserProfile | null>(null)
  const [fullName, setFullName]             = useState('')
  const [phone, setPhone]                   = useState('')
  const [address, setAddress]               = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving]   = useState(false)
  const [profileSaved, setProfileSaved]     = useState(false)
  const [profileError, setProfileError]     = useState('')


  const avatarInputRef                      = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError]       = useState('')


  const [currentPassword,  setCurrentPassword]  = useState('')
  const [newPassword,      setNewPassword]      = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [passwordSaving,   setPasswordSaving]   = useState(false)
  const [passwordSaved,    setPasswordSaved]    = useState(false)
  const [passwordError,    setPasswordError]    = useState('')


  const [notif, setNotif] = useState({
    emailNotifications: true,
    donationReceipts:   true,
    campaignUpdates:    false,
  })


  const [privacy, setPrivacy] = useState({
    showNamePublicly:     false,
    showDonationAmount:   false,
    allowCampaignContact: true,
  })


  useEffect(() => {
    setProfileLoading(true)
    userApi
      .getMe()
      .then((res) => {
        if (res.success) {
          setProfile(res.data)
          setFullName(res.data.name ?? '')
          setPhone(res.data.phone ?? '')
          setAddress(res.data.address ?? '')
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }, [])


  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return


    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Only JPG, PNG, or WebP images are allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2MB.')
      return
    }

    setAvatarError('')
    setAvatarUploading(true)
    try {
      const res = await userApi.uploadAvatar(file)
      if (res.success) {
        setProfile(res.data)
      } else {
        setAvatarError((res as { message?: string }).message ?? 'Upload failed.')
      }
    } catch {
      setAvatarError('Upload failed. Please try again.')
    } finally {
      setAvatarUploading(false)

      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }


  const handleProfileSave = async () => {
    setProfileError('')
    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.')
      return
    }
    setProfileSaving(true)
    try {
      const res = await userApi.updateMe({
        name:    fullName.trim(),
        phone:   phone.trim() || undefined,
        address: address.trim() || undefined,
      })
      if (res.success) {
        setProfile(res.data)
        setProfileSaved(true)
        setTimeout(() => setProfileSaved(false), 3000)
      } else {
        setProfileError((res as { message?: string }).message ?? 'Failed to update profile.')
      }
    } catch {
      setProfileError('Something went wrong. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }


  const handlePasswordUpdate = async () => {
    setPasswordError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter.')
      return
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one number.')
      return
    }

    setPasswordSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      }).then((r) => r.json()) as { success: boolean; message?: string }

      if (res.success) {
        setPasswordSaved(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSaved(false), 3000)
      } else {
        setPasswordError(res.message ?? 'Failed to update password.')
      }
    } catch {
      setPasswordError('Something went wrong. Please try again.')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <DashboardLayout role="donor">
      <PageHeader title="Settings" />

      <div className="max-w-2xl">
<div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
{activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">Profile Information</h2>
              <p className="text-sm text-slate-500">Update your public profile details.</p>
            </div>

            {profileLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading profile…
              </div>
            ) : (
              <>
<div className="flex items-center gap-4">
                  <div className="relative">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {getInitials(fullName || 'U')}
                        </span>
                      </div>
                    )}
<input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      {avatarUploading
                        ? <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                        : <Camera className="w-3 h-3 text-slate-500" />}
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG up to 2MB</p>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="mt-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors disabled:opacity-60"
                    >
                      {avatarUploading ? 'Uploading…' : 'Upload new photo'}
                    </button>
                  </div>
                </div>

                {avatarError && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
                    {avatarError}
                  </div>
                )}
<div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
<div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
<div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Your address"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
<div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={profile?.email ?? ''}
                    readOnly
                    className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm text-slate-400 bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed here.</p>
                </div>

                {profileError && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
                    {profileError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                  >
                    {profileSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : profileSaved ? (
                      <Check className="w-4 h-4" />
                    ) : null}
                    {profileSaving ? 'Saving…' : profileSaved ? 'Saved!' : 'Save Changes'}
                  </button>
                  {profileSaved && (
                    <span className="text-sm text-emerald-600 font-medium">Profile updated successfully.</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
{activeTab === 'security' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">Change Password</h2>
              <p className="text-sm text-slate-500">Keep your account secure with a strong password.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
                {passwordError}
              </div>
            )}

            {passwordSaved && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Password updated successfully!
              </div>
            )}

            <button
              onClick={handlePasswordUpdate}
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {passwordSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        )}
{activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-slate-500">Choose what you&apos;d like to be notified about.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  key:   'emailNotifications' as const,
                  label: 'Email Notifications',
                  desc:  'Receive general notifications via email.',
                },
                {
                  key:   'donationReceipts' as const,
                  label: 'Donation Receipts',
                  desc:  'Get an email receipt after every successful donation.',
                },
                {
                  key:   'campaignUpdates' as const,
                  label: 'Campaign Updates',
                  desc:  'Be notified when campaigns you support post updates.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={notif[item.key]}
                    onChange={() => setNotif((p) => ({ ...p, [item.key]: !p[item.key] }))}
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400">Changes are saved automatically.</p>
          </div>
        )}
{activeTab === 'privacy' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">Privacy Settings</h2>
              <p className="text-sm text-slate-500">Control how your information is displayed publicly.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  key:   'showNamePublicly' as const,
                  label: 'Show my name publicly on donations',
                  desc:  'When off, your donations appear as "Anonymous" to others.',
                },
                {
                  key:   'showDonationAmount' as const,
                  label: 'Show donation amounts publicly',
                  desc:  'When off, your donation amount is hidden from public feeds.',
                },
                {
                  key:   'allowCampaignContact' as const,
                  label: 'Allow campaigns to contact me',
                  desc:  'Campaign creators can send you updates and thank-you messages.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={privacy[item.key]}
                    onChange={() => setPrivacy((p) => ({ ...p, [item.key]: !p[item.key] }))}
                  />
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-xs text-amber-700">
              Privacy preferences apply to all future donations. Existing donations are not affected retroactively.
            </div>

            <p className="text-xs text-slate-400">Changes are saved automatically.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
