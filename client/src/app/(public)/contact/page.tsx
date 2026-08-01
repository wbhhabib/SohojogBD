
'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@fundraise.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+880 1700-000000',
    sub: 'Sun – Thu, 9 AM – 6 PM',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Dhaka, Bangladesh',
    sub: 'Gulshan-2, Dhaka 1212',
  },
]

const FAQS = [
  {
    id: 'faq-1',
    question: 'How do I start a campaign?',
    answer:
      'Starting a campaign is simple. Create a free account, click "Start a Campaign", fill in your campaign details — title, story, goal amount, and photos — then submit for review. Our team verifies campaigns within 24 hours, after which your campaign goes live and you can start collecting donations immediately.',
  },
  {
    id: 'faq-2',
    question: 'How are donations processed?',
    answer:
      'All donations are processed securely through our payment gateway partners. Once a donation is made, funds are held in escrow and released to the campaign creator upon reaching milestones or campaign completion. Creators can withdraw funds directly to their bank account or mobile banking (bKash, Nagad).',
  },
  {
    id: 'faq-3',
    question: 'Is my donation secure?',
    answer:
      'Absolutely. We use bank-grade SSL encryption for all transactions. Your payment information is never stored on our servers. Every campaign is verified before going live, and we have a dedicated trust & safety team monitoring for suspicious activity. Donors can request a refund within 7 days if a campaign is found to be fraudulent.',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq]   = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  const toggleFaq = (id: string) => setOpenFaq((prev) => (prev === id ? null : id))

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors'

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
<section className="bg-emerald-50 border-b border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Get in Touch
            </h1>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Have a question, feedback, or need help with your campaign? We&apos;re
              here to help — reach out and our team will get back to you promptly.
            </p>
          </div>
        </section>
<section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
<div className="w-full lg:w-[60%]">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Send us a Message</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Fill in the form below and we&apos;ll respond within 24 hours.
                </p>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Message sent!</h3>
                      <p className="text-sm text-slate-500">
                        We&apos;ll reply within 24 hours. Check your inbox at{' '}
                        <span className="font-medium text-slate-700">{form.email}</span>.
                      </p>
                    </div>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                      className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="name"
                          type="text"
                          required
                          placeholder="Rahim Uddin"
                          value={form.name}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          placeholder="rahim@example.com"
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="subject"
                        type="text"
                        required
                        placeholder="How can we help?"
                        value={form.subject}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        placeholder="Tell us more about your question or feedback..."
                        value={form.message}
                        onChange={handleChange}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
<div className="w-full lg:w-[40%] flex flex-col gap-5">
{CONTACT_INFO.map(({ icon: Icon, label, value, sub }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Office Hours</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { day: 'Sunday – Thursday', hours: '9:00 AM – 6:00 PM' },
                    { day: 'Friday',            hours: '10:00 AM – 1:00 PM' },
                    { day: 'Saturday',          hours: 'Closed'             },
                  ].map(({ day, hours }) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{day}</span>
                      <span className={`font-medium ${hours === 'Closed' ? 'text-red-400' : 'text-emerald-600'}`}>
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-4 border-t border-gray-100 pt-3">
                  All times are Bangladesh Standard Time (BST, UTC+6).
                </p>
              </div>
            </div>
          </div>
        </section>
<section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Quick answers to the questions we hear most often.
            </p>

            <div className="space-y-3">
              {FAQS.map((faq) => {
                const isOpen = openFaq === faq.id
                return (
                  <div
                    key={faq.id}
                    className={`rounded-xl border transition-colors ${
                      isOpen ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                    >
                      <span className="text-sm font-semibold text-slate-800">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}