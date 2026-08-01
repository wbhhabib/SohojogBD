'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, X } from 'lucide-react'

import type { Campaign } from '@/lib/api'
import { campaignApi } from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StepIndicator from '@/components/campaign/StepIndicator'
import CampaignForm from '@/components/campaign/CampaignForm'
import ImageUploadPreview from '@/components/campaign/ImageUploadPreview'

interface EditCampaignClientProps {
  campaign: Campaign
}

const STEPS = ['Basic Info', 'Story & Beneficiary', 'Media & Preview']

/**
 * Converts a date-only string (YYYY-MM-DD from <input type="date">)
 * to a full ISO datetime string.
 * If the value is already a full ISO string, return it unchanged.
 */
function normalizeDeadline(dateValue?: string): string | undefined {
  if (!dateValue) return undefined
  // Already a full ISO string (from DB) — pass through unchanged
  if (dateValue.includes('T') || dateValue.includes('Z')) {
    return new Date(dateValue).toISOString()
  }
  // Date-only from <input type="date"> — set to end of day
  const date = new Date(`${dateValue}T23:59:59.999`)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

export default function EditCampaignClient({ campaign }: EditCampaignClientProps) {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<Partial<Campaign>>({ ...campaign })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [visible, setVisible] = useState(true)

  const handleFormChange = (data: Partial<Campaign>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const animateTransition = (cb: () => void) => {
    setVisible(false)
    setTimeout(() => {
      cb()
      setVisible(true)
    }, 180)
  }

  const handleNext = () => {
    if (currentStep < 3) {
      animateTransition(() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3))
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      animateTransition(() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3))
    }
  }

  const uploadSelectedFiles = async (slug: string, files: File[]) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append('image', file)

      const uploadRes = await campaignApi.uploadCover(slug, formData)
      if (!uploadRes.success) {
        throw new Error(uploadRes.message || 'Image upload failed')
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')

    try {
      const payload: Record<string, unknown> = {}

      if (formData.title !== undefined) payload.title = formData.title
      if (formData.description !== undefined) payload.description = formData.description
      if (formData.story !== undefined) payload.story = formData.story
      if (formData.goalAmount !== undefined) payload.goalAmount = Number(formData.goalAmount)
      if (formData.category !== undefined) payload.category = formData.category
      if (formData.beneficiaryName !== undefined) payload.beneficiaryName = formData.beneficiaryName
      if (formData.beneficiaryInfo !== undefined) payload.beneficiaryInfo = formData.beneficiaryInfo

      // Only include deadline in payload if user actually changed it
      // This avoids sending a past deadline that would fail server validation
      if (formData.deadline !== undefined && formData.deadline !== campaign.deadline) {
        const normalizedDeadline = normalizeDeadline(formData.deadline)
        if (normalizedDeadline) payload.deadline = normalizedDeadline
      }

      const res = await campaignApi.update(campaign.id, payload)

      if (!res.success) {
        setSaveError(res.message || 'Failed to save changes. Please try again.')
        return
      }

      if (selectedFiles.length > 0) {
        await uploadSelectedFiles(campaign.slug, selectedFiles)
      }

      setToast(true)
      setTimeout(() => setToast(false), 3000)
    } catch (err) {
      setSaveError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout role="creator">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Campaign</h1>
            <p className="text-slate-500 text-sm mt-1 line-clamp-1">
              {campaign.title}
            </p>
          </div>
          <button
            onClick={() => router.push('/creator/campaigns')}
            className="shrink-0 px-4 py-2 rounded-lg border border-gray-200 text-slate-600 hover:border-red-300 hover:text-red-500 font-medium text-sm transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <div className="mb-8">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        <div
          className="transition-opacity duration-200"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7 flex flex-col gap-6">
            {currentStep === 1 && (
              <CampaignForm
                step={1}
                formData={formData}
                onChange={handleFormChange}
              />
            )}

            {currentStep === 2 && (
              <CampaignForm
                step={2}
                formData={formData}
                onChange={handleFormChange}
              />
            )}

            {currentStep === 3 && (
              <>
                <CampaignForm
                  step={3}
                  formData={formData}
                  onChange={handleFormChange}
                />
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Campaign Images
                  </p>
                  <ImageUploadPreview
                    initialImages={formData.images ?? []}
                    onChange={(images) => handleFormChange({ images })}
                    onFilesChange={setSelectedFiles}
                    maxFiles={5}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {saveError && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 font-semibold text-sm transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">
              Step {currentStep} of {STEPS.length}
            </span>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            Changes saved successfully!
            <button
              onClick={() => setToast(false)}
              className="ml-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}