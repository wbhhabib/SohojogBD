'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

type Tab = 'general' | 'features' | 'maintenance'

const TABS: { key: Tab; label: string }[] = [
  { key: 'general',     label: 'General'     },
  { key: 'features',    label: 'Features'    },
  { key: 'maintenance', label: 'Maintenance' },
]

interface PlatformSettings {
  siteName:                  string
  siteDescription:           string
  contactEmail:              string
  supportPhone:              string
  allowRegistrations:        boolean
  allowCampaignCreation:     boolean
  emailVerificationRequired: boolean
  googleLoginEnabled:        boolean
  maintenanceMode:           boolean
  maintenanceMessage:        string
}

const DEFAULTS: PlatformSettings = {
  siteName:                  'FundRaise',
  siteDescription:           'A trusted crowdfunding platform connecting donors with meaningful causes across Bangladesh.',
  contactEmail:              'support@fundraise.com.bd',
  supportPhone:              '+880 1800-FUNDRAISE',
  allowRegistrations:        true,
  allowCampaignCreation:     true,
  emailVerificationRequired: true,
  googleLoginEnabled:        true,
  maintenanceMode:           false,
  maintenanceMessage:        'We are currently performing scheduled maintenance. We will be back shortly. Thank you for your patience.',
}

interface ToggleProps {
  checked:   boolean
  onChange:  (v: boolean) => void
  danger?:   boolean
  id?:       string
  disabled?: boolean
}

function Toggle({ checked, onChange, danger = false, id, disabled }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked
          ? danger
            ? 'bg-red-500 focus:ring-red-400'
            : 'bg-emerald-600 focus:ring-emerald-500'
          : 'bg-gray-200 focus:ring-gray-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

interface ToastState { visible: boolean; message: string; isError?: boolean }

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab]         = useState<Tab>('general')
  const [toast, setToast]                 = useState<ToastState>({ visible: false, message: '' })
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)

  const [settings, setSettings]           = useState<PlatformSettings>(DEFAULTS)

  // ── Load settings from backend on mount ──────────────────────────────────
  useEffect(() => {
    api.get<PlatformSettings>('/settings')
      .then((res) => {
        if (res.success && res.data) setSettings(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (message: string, isError = false) => {
    setToast({ visible: true, message, isError })
    setTimeout(() => setToast({ visible: false, message: '' }), 3000)
  }

  // ── Patch helper — sends only changed fields ──────────────────────────────
  const patch = async (fields: Partial<PlatformSettings>, successMsg: string) => {
    setSaving(true)
    try {
      const res = await api.patch<PlatformSettings>('/settings', fields)
      if (res.success && res.data) {
        setSettings(res.data)
        showToast(successMsg)
      } else {
        showToast(res.message ?? 'Failed to save settings.', true)
      }
    } catch {
      showToast('Network error. Please try again.', true)
    } finally {
      setSaving(false)
    }
  }

  // ── General tab save ──────────────────────────────────────────────────────
  const handleSaveGeneral = () => {
    patch(
      {
        siteName:        settings.siteName,
        siteDescription: settings.siteDescription,
        contactEmail:    settings.contactEmail,
        supportPhone:    settings.supportPhone,
      },
      'Platform settings saved successfully.'
    )
  }

  // ── Feature toggle save ───────────────────────────────────────────────────
  const handleToggleFeature = (
    key: keyof PlatformSettings,
    value: boolean,
    label: string
  ) => {
    const previous = settings[key]
    setSettings((prev) => ({ ...prev, [key]: value }))
    patch({ [key]: value }, `"${label}" has been ${value ? 'enabled' : 'disabled'}.`).catch(
      () => setSettings((prev) => ({ ...prev, [key]: previous }))
    )
  }

  // ── Maintenance tab save ──────────────────────────────────────────────────
  const handleMaintenanceToggle = (value: boolean) => {
    patch(
      { maintenanceMode: value },
      value
        ? 'Maintenance mode is now ACTIVE. The site is unavailable to users.'
        : 'Maintenance mode has been disabled. The site is live.'
    )
  }

  const handleSaveMaintenance = () => {
    patch({ maintenanceMessage: settings.maintenanceMessage }, 'Maintenance settings saved.')
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 bg-white border rounded-xl shadow-md px-4 py-3 text-sm font-medium animate-fade-in max-w-sm ${
            toast.isError
              ? 'border-red-200 text-red-800'
              : 'border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.isError
            ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Platform Settings"
        description="Configure global platform behaviour, features, and availability."
      />

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-white border border-b-white border-gray-200 text-emerald-700 -mb-px'
                : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl rounded-tr-xl shadow-sm">

        {/* ── General ─────────────────────────────────────────────────── */}
        {activeTab === 'general' && (
          <div className="p-6 max-w-2xl space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings((p) => ({ ...p, siteName: e.target.value }))}
                placeholder="Site name"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Site Description
              </label>
              <Textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings((p) => ({ ...p, siteDescription: e.target.value }))}
                rows={3}
                placeholder="Brief description of the platform"
                className="rounded-lg resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contact Email
              </label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings((p) => ({ ...p, contactEmail: e.target.value }))}
                placeholder="contact@example.com"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Support Phone
              </label>
              <Input
                value={settings.supportPhone}
                onChange={(e) => setSettings((p) => ({ ...p, supportPhone: e.target.value }))}
                placeholder="+880 ..."
                className="rounded-lg"
              />
            </div>
            <div className="pt-2">
              <Button
                onClick={handleSaveGeneral}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6 inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* ── Features ────────────────────────────────────────────────── */}
        {activeTab === 'features' && (
          <div className="p-6 max-w-2xl divide-y divide-gray-100">
            {(
              [
                {
                  id:          'registrations' as const,
                  key:         'allowRegistrations' as keyof PlatformSettings,
                  label:       'Allow new registrations',
                  description: 'Let new users sign up on the platform.',
                },
                {
                  id:          'campaign-creation' as const,
                  key:         'allowCampaignCreation' as keyof PlatformSettings,
                  label:       'Allow campaign creation',
                  description: 'Permit verified creators to launch new campaigns.',
                },
                {
                  id:          'email-verification' as const,
                  key:         'emailVerificationRequired' as keyof PlatformSettings,
                  label:       'Email verification required',
                  description: 'Require users to verify their email before accessing features.',
                },
                {
                  id:          'google-login' as const,
                  key:         'googleLoginEnabled' as keyof PlatformSettings,
                  label:       'Google login enabled',
                  description: 'Allow users to sign in using their Google account.',
                },
              ]
            ).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 gap-4">
                <div>
                  <label
                    htmlFor={item.id}
                    className="block text-sm font-semibold text-slate-800 cursor-pointer"
                  >
                    {item.label}
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
                <Toggle
                  id={item.id}
                  checked={settings[item.key] as boolean}
                  onChange={(v) => handleToggleFeature(item.key, v, item.label)}
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Maintenance ─────────────────────────────────────────────── */}
        {activeTab === 'maintenance' && (
          <div className="p-6 max-w-2xl space-y-6">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ Warning: Enabling maintenance mode will make the site unavailable to all users.
              </p>
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                settings.maintenanceMode
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div>
                <p
                  className={`text-sm font-bold ${
                    settings.maintenanceMode ? 'text-red-700' : 'text-slate-800'
                  }`}
                >
                  Maintenance Mode
                </p>
                <p className={`text-xs mt-0.5 ${settings.maintenanceMode ? 'text-red-500' : 'text-slate-500'}`}>
                  {settings.maintenanceMode
                    ? 'Site is currently OFFLINE for users.'
                    : 'Site is live and accessible to all users.'}
                </p>
              </div>
              <Toggle
                checked={settings.maintenanceMode}
                onChange={handleMaintenanceToggle}
                danger
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Maintenance Message
              </label>
              <p className="text-xs text-slate-400 mb-2">
                This message will be displayed to users when maintenance mode is active.
              </p>
              <Textarea
                value={settings.maintenanceMessage}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, maintenanceMessage: e.target.value }))
                }
                rows={4}
                placeholder="Enter the message users will see..."
                className="rounded-lg resize-none"
              />
            </div>

            <div>
              <Button
                onClick={handleSaveMaintenance}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6 inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Maintenance Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}