

'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Shield, Lock, CreditCard, CheckCircle, AlertCircle, ChevronRight, Loader2, Phone, RefreshCw } from 'lucide-react'

const CARD_BRANDS = [
  { name: 'Visa',       emoji: '💳', bg: '#f0f4ff', border: '#c7d2fe', label: 'Visa / Debit' },
  { name: 'Mastercard', emoji: '💳', bg: '#fff0f0', border: '#fecaca', label: 'Mastercard' },
  { name: 'bKash',      emoji: '📱', bg: '#fff0f8', border: '#fbcfe8', label: 'bKash' },
  { name: 'Nagad',      emoji: '📱', bg: '#fff7ed', border: '#fed7aa', label: 'Nagad' },
]

function fmt4(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function fmtExp(val: string) {
  const d = val.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}


const DEMO_OTP = '123456'

type Step = 'method' | 'card' | 'otp' | 'processing' | 'done'

function MockGatewayContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const amount       = searchParams.get('amount')       ?? '500'
  const donationId   = searchParams.get('donationId')   ?? 'DEMO'
  const campaign     = searchParams.get('campaign')     ?? 'Campaign'
  const campaignSlug = searchParams.get('campaignSlug') ?? ''
  const successUrl   = searchParams.get('successUrl')   ?? '/payment/success'

  const [step,        setStep]       = useState<Step>('method')
  const [method,      setMethod]     = useState<string | null>(null)
  const [cardNo,      setCardNo]     = useState('')
  const [expiry,      setExpiry]     = useState('')
  const [cvv,         setCvv]        = useState('')
  const [holderName,  setHolderName] = useState('')
  const [phone,       setPhone]      = useState('')
  const [errors,      setErrors]     = useState<Record<string, string>>({})
  const [progress,    setProgress]   = useState(0)
  const [mounted,     setMounted]    = useState(false)


  const [otpDigits,   setOtpDigits]  = useState(['', '', '', '', '', ''])
  const [otpError,    setOtpError]   = useState('')
  const [otpSent,     setOtpSent]    = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [otpShake,    setOtpShake]   = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])


  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])


  useEffect(() => {
    if (step !== 'processing') return
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 15
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setStep('done'), 400) }
      setProgress(p)
    }, 300)
    return () => clearInterval(iv)
  }, [step])


  useEffect(() => {
    if (step !== 'done') return
    const params = new URLSearchParams({
      tran_id:      `TXN${Date.now()}`,
      bank_tran_id: `BANK${Math.floor(Math.random() * 1e9)}`,
      amount, store_amount: amount, currency: 'BDT',
      card_type:   (method === 'bKash' || method === 'Nagad') ? 'MOBILE_BANKING' : 'VISA-Debit',
      card_brand:  method ?? 'VISA',
      card_issuer: 'Demo Bank BD',
      donationId,
      campaignSlug,
    })
    const t = setTimeout(() => router.push(`${successUrl}?${params}`), 1600)
    return () => clearTimeout(t)
  }, [step, router, amount, donationId, method, successUrl])

  const isMobile = method === 'bKash' || method === 'Nagad'

  function validateCard() {
    const e: Record<string, string> = {}
    if (!isMobile) {
      if (cardNo.replace(/\s/g, '').length < 16) e.cardNo = 'Valid 16-digit card number required'
      if (expiry.length < 5)                     e.expiry = 'Valid expiry required (MM/YY)'
      if (cvv.length < 3)                        e.cvv    = 'Valid CVV required'
      if (!holderName.trim())                    e.name   = 'Card holder name required'
    } else {
      if (phone.replace(/\D/g, '').length < 11)  e.phone  = 'Valid 11-digit mobile number required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handlePayClick() {
    if (!validateCard()) return

    setOtpSent(true)
    setResendTimer(30)
    setOtpDigits(['', '', '', '', '', ''])
    setOtpError('')
    setStep('otp')
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...otpDigits]
    next[i] = val
    setOtpDigits(next)
    setOtpError('')
    if (val && i < 5) setTimeout(() => inputRefs.current[i + 1]?.focus(), 30)
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtpDigits(text.split(''))
      setOtpError('')
      setTimeout(() => inputRefs.current[5]?.focus(), 30)
    }
    e.preventDefault()
  }

  function handleVerifyOtp() {
    const entered = otpDigits.join('')
    if (entered.length < 6) { setOtpError('Please enter the 6-digit OTP'); return }
    if (entered !== DEMO_OTP) {
      setOtpError('Incorrect OTP. Please try again.')
      setOtpShake(true)
      setTimeout(() => setOtpShake(false), 600)
      setOtpDigits(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 60)
      return
    }
    setStep('processing')
    setProgress(0)
  }

  function handleResend() {
    if (resendTimer > 0) return
    setOtpDigits(['', '', '', '', '', ''])
    setOtpError('')
    setResendTimer(30)
    setTimeout(() => inputRefs.current[0]?.focus(), 60)
  }

  const maskedContact = isMobile
    ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    : `****-****-****-${cardNo.replace(/\s/g, '').slice(-4)}`

  return (
    <div className={`min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-4 py-10
      transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
<div className="mb-4 px-4 py-1.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-semibold text-amber-700 flex items-center gap-1.5">
        <AlertCircle size={12} />
        DEMO MODE — No real payment will be charged
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
<div className="bg-[#003d7a] px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Lock size={13} className="text-white" />
              </div>
              <span className="text-white font-bold text-sm tracking-wide">SSLCommerz</span>
              <span className="text-[10px] bg-green-400 text-green-900 font-bold px-1.5 py-0.5 rounded">DEMO</span>
            </div>
            <p className="text-blue-200 text-[10px]">Secure Payment Gateway</p>
          </div>
          <div className="flex items-center gap-1.5 text-green-300 text-xs font-medium">
            <Shield size={12} /> 256-bit SSL
          </div>
        </div>
{(step === 'method' || step === 'card' || step === 'otp') && (
          <div className="flex border-b border-gray-100">
            {['Method', 'Details', 'OTP Verify'].map((label, i) => {
              const active = (step === 'method' && i === 0) || (step === 'card' && i === 1) || (step === 'otp' && i === 2)
              const done   = (step === 'card' && i === 0) || (step === 'otp' && i <= 1)
              return (
                <div key={label} className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-semibold gap-1
                  ${active ? 'text-[#003d7a]' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold
                    ${active ? 'bg-[#003d7a] text-white' : done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
              )
            })}
          </div>
        )}
<div className="bg-[#e8f4fd] border-b border-blue-100 px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Donating to</p>
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{decodeURIComponent(campaign)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Amount</p>
            <p className="text-xl font-bold text-[#003d7a]">৳{Number(amount).toLocaleString('en-BD')}</p>
          </div>
        </div>

        <div className="p-6">
{step === 'method' && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <CreditCard size={15} className="text-[#003d7a]" />
                Choose Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CARD_BRANDS.map(b => (
                  <button key={b.name}
                    onClick={() => { setMethod(b.name); setStep('card') }}
                    className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md group"
                    style={{ background: b.bg, borderColor: b.border }}>
                    <span className="text-2xl">{b.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">{b.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-center text-[11px] text-slate-400 mt-5 flex items-center justify-center gap-1">
                <Lock size={10} /> Your payment info is encrypted and secure
              </p>
            </div>
          )}
{step === 'card' && (
            <div>
              <button onClick={() => setStep('method')}
                className="text-xs text-[#003d7a] font-medium mb-4 flex items-center gap-1 hover:underline">
                ← Change Method
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{isMobile ? '📱' : '💳'}</span>
                <p className="text-sm font-bold text-slate-800">Pay with {method}</p>
              </div>

              {isMobile ? (
                <div className="space-y-4">
                  <div className="rounded-xl p-4 text-center border-2"
                    style={{ background: method === 'bKash' ? '#fff0f8' : '#fff7ed', borderColor: method === 'bKash' ? '#fbcfe8' : '#fed7aa' }}>
                    <p className="text-2xl mb-1">{method === 'bKash' ? '🩷' : '🧡'}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter your {method} number. An OTP will be sent for verification.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">{method} Mobile Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="tel" placeholder="01XXXXXXXXX" value={phone}
                        onChange={e => { setPhone(e.target.value); setErrors({}) }}
                        className={`w-full border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/30
                          ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#003d7a]'}`} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
<div className="rounded-xl p-4 text-white text-xs font-mono relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #003d7a, #0066cc)' }}>
                    <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10 bg-white"
                      style={{ transform: 'translate(30%,-30%)' }} />
                    <p className="opacity-50 text-[9px] uppercase tracking-widest mb-2">Card Number</p>
                    <p className="text-base font-bold tracking-[0.15em] mb-3">{cardNo || '•••• •••• •••• ••••'}</p>
                    <div className="flex justify-between">
                      <div><p className="opacity-50 text-[9px] uppercase">Holder</p>
                        <p className="font-semibold text-[11px]">{holderName || 'YOUR NAME'}</p></div>
                      <div className="text-right"><p className="opacity-50 text-[9px] uppercase">Expires</p>
                        <p className="font-semibold text-[11px]">{expiry || 'MM/YY'}</p></div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" value={cardNo}
                      onChange={e => { setCardNo(fmt4(e.target.value)); setErrors({}) }}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#003d7a]/30
                        ${errors.cardNo ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#003d7a]'}`} />
                    {errors.cardNo && <p className="text-red-500 text-[11px] mt-1">{errors.cardNo}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" value={expiry}
                        onChange={e => { setExpiry(fmtExp(e.target.value)); setErrors({}) }}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/30
                          ${errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#003d7a]'}`} />
                      {errors.expiry && <p className="text-red-500 text-[11px] mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">CVV</label>
                      <input type="password" placeholder="•••" maxLength={4} value={cvv}
                        onChange={e => { setCvv(e.target.value.replace(/\D/g,'').slice(0,4)); setErrors({}) }}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/30
                          ${errors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#003d7a]'}`} />
                      {errors.cvv && <p className="text-red-500 text-[11px] mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Card Holder Name</label>
                    <input type="text" placeholder="Name as on card" value={holderName}
                      onChange={e => { setHolderName(e.target.value); setErrors({}) }}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003d7a]/30
                        ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#003d7a]'}`} />
                    {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                  </div>
                </div>
              )}

              <button onClick={handlePayClick}
                className="mt-5 w-full bg-[#003d7a] hover:bg-[#002d5e] text-white font-bold py-3.5 rounded-xl
                  flex items-center justify-center gap-2 transition-colors text-sm">
                <Lock size={14} />
                Continue to OTP Verification
                <ChevronRight size={14} />
              </button>
            </div>
          )}
{step === 'otp' && (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Phone size={26} className="text-[#003d7a]" />
                </div>
                <h3 className="text-base font-bold text-slate-800">OTP Verification</h3>
                <p className="text-xs text-slate-500 text-center mt-1">
                  A 6-digit OTP has been sent to<br />
                  <span className="font-semibold text-slate-700">{maskedContact}</span>
                </p>
              </div>
<div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
                <AlertCircle size={13} className="text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-700">
                  Demo OTP: <span className="font-bold tracking-widest">123456</span>
                </p>
              </div>
<div className={`flex gap-2 justify-center mb-2 ${otpShake ? 'animate-bounce' : ''}`}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    onPaste={handleOtpPaste}
                    className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none
                      transition-all duration-150
                      ${otpError ? 'border-red-400 bg-red-50 text-red-600'
                        : d ? 'border-[#003d7a] bg-blue-50 text-[#003d7a]'
                        : 'border-gray-200 focus:border-[#003d7a]'}`}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-center text-red-500 text-xs font-medium mt-1 mb-3">{otpError}</p>
              )}
<div className="flex items-center justify-center gap-1 mt-3 mb-5">
                <p className="text-xs text-slate-400">Didn't receive OTP?</p>
                <button onClick={handleResend} disabled={resendTimer > 0}
                  className={`flex items-center gap-1 text-xs font-semibold
                    ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#003d7a] hover:underline'}`}>
                  <RefreshCw size={11} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button onClick={handleVerifyOtp}
                disabled={otpDigits.join('').length < 6}
                className="w-full bg-[#003d7a] hover:bg-[#002d5e] disabled:opacity-50 disabled:cursor-not-allowed
                  text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                <CheckCircle size={15} />
                Verify & Confirm Payment
              </button>

              <button onClick={() => setStep('card')}
                className="w-full mt-2 text-xs text-slate-400 hover:text-slate-600 py-2 transition-colors">
                ← Go back
              </button>
            </div>
          )}


          {step === 'processing' && (
            <div className="py-8 flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 size={32} className="text-[#003d7a] animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 text-base">Processing Payment…</p>
                <p className="text-slate-500 text-xs mt-1">Please wait. Do not close this window.</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-[#003d7a] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-slate-400">{Math.round(progress)}% complete</p>
            </div>
          )}


          {step === 'done' && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={34} className="text-emerald-600" />
              </div>
              <p className="font-bold text-emerald-800 text-base">Payment Confirmed!</p>
              <p className="text-slate-500 text-xs">Redirecting to receipt…</p>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                    style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          )}

        </div>


        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Shield size={10} className="text-green-500" /> Secured by SSLCommerz
          </div>
          <div className="flex gap-2 text-[10px] text-slate-400">
            <span>Visa</span><span>·</span><span>Mastercard</span><span>·</span><span>bKash</span><span>·</span><span>Nagad</span>
          </div>
        </div>
      </div>

      <p className="mt-5 text-[11px] text-slate-400 text-center max-w-xs">
        🔒 Demo environment — no real transaction occurs. Use any card details.
      </p>
    </div>
  )
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003d7a]" />
      </div>
    }>
      <MockGatewayContent />
    </Suspense>
  )
}
