'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ImageIcon, X } from 'lucide-react'

import DashboardLayout from '@/components/layout/DashboardLayout'
import StepIndicator from '@/components/campaign/StepIndicator'
import CampaignForm from '@/components/campaign/CampaignForm'
import ImageUploadPreview from '@/components/campaign/ImageUploadPreview'
import { campaignApi } from '@/lib/api'
import type { Campaign } from '@/lib/api'

const STEPS = ['Basic Info', 'Story & Beneficiary', 'Media & Preview']



















function normalizeDeadline(dateValue?: string): string | undefined {
  if (!dateValue) return undefined

  const [year, month, day] = dateValue.split('-').map(Number)
  if (!year || !month || !day) return undefined

  const ts = Date.UTC(year, month - 1, day, 23, 59, 59, 999)
  if (Number.isNaN(ts)) return undefined
  return new Date(ts).toISOString()
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}



interface CoverUploadStepProps {
  slug: string
  onSkip: () => void
  onDone: () => void
}

function CoverUploadStep({ slug, onSkip, onDone }: CoverUploadStepProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadDone, setUploadDone] = useState(false)

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setUploadError('')
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('image', file)
        const res = await campaignApi.uploadCover(slug, fd)
        if (!res.success) {
          throw new Error((res as { message?: string }).message ?? 'Upload failed')
        }
      }
      setUploadDone(true)
      setTimeout(onDone, 1200)
    } catch (err) {
      setUploadError(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Upload Campaign Cover</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Add photos to make your campaign stand out. You can add up to 5 images.
            </p>
          </div>
        </div>
        <button
          onClick={onSkip}
          className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          title="Skip"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ImageUploadPreview
        initialImages={[]}
        onChange={() => {}}
        onFilesChange={setFiles}
        maxFiles={5}
      />

      {uploadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <div className="w-4 h-4 rounded-full bg-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {uploadDone && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">Images uploaded successfully!</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={onSkip}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || uploadDone}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading…
            </>
          ) : (
            `Upload ${files.length > 0 ? `${files.length} Image${files.length > 1 ? 's' : ''}` : 'Images'}`
          )}
        </button>
      </div>
    </div>
  )
}



interface SuccessScreenProps {
  onViewCampaigns: () => void
  onCreateAnother: () => void
}

function SuccessScreen({ onViewCampaigns, onCreateAnother }: SuccessScreenProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Campaign Created!</h2>
        <p className="text-slate-500 text-sm mt-2">
          Your campaign has been created successfully and is pending review.
        </p>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={onCreateAnother}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 font-semibold text-sm transition-colors"
        >
          Create Another
        </button>
        <button
          onClick={onViewCampaigns}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
        >
          View My Campaigns
        </button>
      </div>
    </div>
  )
}



export default function CreateCampaignPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<'form' | 'cover-upload' | 'done'>('form')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [createdSlug, setCreatedSlug] = useState('')
  const [formData, setFormData] = useState<Partial<Campaign>>({})
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(true)
  const [error, setError] = useState('')

  const previewImages = useMemo(() => formData.images ?? [], [formData.images])

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
    if (currentStep === 1) {
      if (!formData.title || formData.title.length < 5) {
        setError('Campaign title must be at least 5 characters.')
        return
      }
      if (!formData.category || formData.category === '') {
        setError('Please select a category.')
        return
      }
      if (!formData.goalAmount || Number(formData.goalAmount) < 1000) {
        setError('Fundraising goal must be at least ৳1,000.')
        return
      }
      if (!formData.deadline) {
        setError('Please select a deadline.')
        return
      }
    }

    if (currentStep === 2) {
      if (!formData.description || formData.description.length < 20) {
        setError('Short description must be at least 20 characters.')
        return
      }
      if (!formData.story || formData.story.length < 50) {
        setError('Your story must be at least 50 characters.')
        return
      }
      if (!formData.beneficiaryName || formData.beneficiaryName.length < 2) {
        setError('Beneficiary name must be at least 2 characters.')
        return
      }
      if (!formData.beneficiaryInfo || formData.beneficiaryInfo.length < 10) {
        setError('Beneficiary information must be at least 10 characters.')
        return
      }
    }

    setError('')
    if (currentStep < 3) {
      animateTransition(() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3))
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setError('')
      animateTransition(() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3))
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      if (
        !formData.title ||
        !formData.description ||
        !formData.story ||
        !formData.goalAmount ||
        !formData.beneficiaryName ||
        !formData.beneficiaryInfo ||
        !formData.deadline
      ) {
        setError('Please fill in all required fields.')
        return
      }

      if (!formData.category || formData.category === '') {
        setError('Please select a category.')
        return
      }

      const normalizedDeadline = normalizeDeadline(formData.deadline)
      if (!normalizedDeadline || new Date(normalizedDeadline) <= new Date()) {
        setError('Deadline must be a future date.')
        return
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        story: formData.story,
        goalAmount: Number(formData.goalAmount),
        category: formData.category,
        beneficiaryName: formData.beneficiaryName,
        beneficiaryInfo: formData.beneficiaryInfo,
        deadline: normalizedDeadline,
        images: [],
      }

      const res = await campaignApi.create(payload)

      if (!res.success) {
        const resWithErrors = res as unknown as { success: boolean; message: string; errors?: { field: string; message: string }[] }
        if (resWithErrors.errors && resWithErrors.errors.length > 0) {
          const errorMessages = resWithErrors.errors.map((e) => `${e.field}: ${e.message}`).join(' | ')
          setError(errorMessages)
        } else {
          setError(res.message || 'Campaign creation failed.')
        }
        return
      }

      const created = res.data as { slug: string }
      setCreatedSlug(created.slug)

      setPageState('cover-upload')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setPageState('form')
    setCurrentStep(1)
    setFormData({})
    setCreatedSlug('')
    setVisible(true)
    setError('')
  }


  if (pageState === 'done') {
    return (
      <DashboardLayout role="creator">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <SuccessScreen
            onViewCampaigns={() => router.push('/creator/campaigns')}
            onCreateAnother={resetForm}
          />
        </div>
      </DashboardLayout>
    )
  }


  if (pageState === 'cover-upload') {
    return (
      <DashboardLayout role="creator">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Campaign Created! 🎉</h1>
            <p className="text-slate-500 text-sm mt-1">
              One more step — add cover images to attract more donors.
            </p>
          </div>
          <CoverUploadStep
            slug={createdSlug}
            onSkip={() => setPageState('done')}
            onDone={() => setPageState('done')}
          />
        </div>
      </DashboardLayout>
    )
  }


  return (
    <DashboardLayout role="creator">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create a Campaign</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill in the details below to launch your fundraising campaign.
          </p>
        </div>

        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div
          className={`mt-8 transition-opacity duration-180 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
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
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Campaign Images <span className="text-slate-400 font-normal">(optional)</span>
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    You can also upload images after creation in the next step.
                  </p>
                  <ImageUploadPreview
                    initialImages={previewImages}
                    onChange={(images) => handleFormChange({ images })}
                    onFilesChange={() => {}}
                    maxFiles={5}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <div className="w-4 h-4 rounded-full bg-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
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
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  'Submit Campaign'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
