
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const sections = [
  {
    title: 'Information We Collect',
    content: `We collect information you provide directly to us when you create an account, make a donation, or create a campaign. This includes your name, email address, payment information, and any other information you choose to provide. We also collect information automatically when you use our platform, such as your IP address, browser type, and pages visited.`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to provide, maintain, and improve our services, process donations and payments, send you receipts and updates about campaigns you support, communicate with you about your account, and comply with legal obligations. We do not sell your personal information to third parties.`,
  },
  {
    title: 'Sharing of Information',
    content: `We may share your information with campaign creators when you make a donation (unless you choose to donate anonymously), payment processors to complete transactions, service providers who assist in our operations, and law enforcement when required by law. Anonymous donations will never reveal your identity to campaign creators or the public.`,
  },
  {
    title: 'Data Security',
    content: `We take reasonable measures to protect your personal information from unauthorized access, theft, and loss. All payment information is encrypted using industry-standard SSL technology. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: 'Cookies',
    content: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some parts of our platform may not function properly.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to access, update, or delete your personal information at any time through your account settings. You may also opt out of marketing communications by clicking the unsubscribe link in any email we send. For any privacy-related requests, please contact us at privacy@fundraise.com.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date. Your continued use of the platform after any changes constitutes your acceptance of the new policy.`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
            <p className="text-slate-500 text-sm">Effective date: January 1, 2024</p>
            <p className="text-slate-600 mt-4 leading-relaxed">
              At FundRaise, we take your privacy seriously. This policy explains how we collect,
              use, and protect your personal information when you use our platform.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-3">
                  {i + 1}. {section.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
            <p className="text-sm text-emerald-700">
              Questions about this policy? Contact us at{' '}
              <a href="mailto:privacy@fundraise.com" className="font-medium underline hover:text-emerald-800">
                privacy@fundraise.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}