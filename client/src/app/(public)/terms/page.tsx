
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const sections = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using FundRaise, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and your continued use of the platform constitutes acceptance of any changes.`,
  },
  {
    title: 'Eligibility',
    content: `You must be at least 18 years old to use FundRaise. By using the platform, you represent and warrant that you meet this requirement. If you are creating a campaign on behalf of an organization, you represent that you have the authority to bind that organization to these terms.`,
  },
  {
    title: 'Campaign Creator Responsibilities',
    content: `As a campaign creator, you are solely responsible for the accuracy of information provided in your campaign, ensuring funds are used for the stated purpose, providing updates to donors, and complying with all applicable laws. FundRaise reserves the right to suspend or remove any campaign that violates these terms or our community guidelines.`,
  },
  {
    title: 'Donations',
    content: `All donations made through FundRaise are voluntary contributions. Donors acknowledge that donations are not tax-deductible unless specifically stated. FundRaise does not guarantee that campaign goals will be met. In cases of fraud or misuse, FundRaise may issue refunds at its discretion but is not obligated to do so.`,
  },
  {
    title: 'Platform Fees',
    content: `FundRaise charges a platform fee on all successful donations to cover operational costs. The current fee structure is displayed at the time of donation. Payment processing fees are charged separately by our payment partners. These fees are non-refundable except in cases of platform error.`,
  },
  {
    title: 'Prohibited Activities',
    content: `You may not use FundRaise for fraudulent campaigns or misrepresentation, campaigns that promote violence, hate speech, or illegal activities, unauthorized collection of user data, spamming or harassment of other users, or any activity that violates applicable laws. Violations may result in immediate account termination.`,
  },
  {
    title: 'Intellectual Property',
    content: `All content on the FundRaise platform, including logos, design, and software, is owned by FundRaise and protected by copyright law. Campaign creators retain ownership of content they upload but grant FundRaise a license to display and promote that content on the platform.`,
  },
  {
    title: 'Limitation of Liability',
    content: `FundRaise is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability to you shall not exceed the amount of fees paid by you in the past six months. We do not guarantee uninterrupted or error-free operation of the platform.`,
  },
  {
    title: 'Governing Law',
    content: `These Terms of Service are governed by the laws of Bangladesh. Any disputes arising from these terms shall be resolved through binding arbitration in Dhaka, Bangladesh. If any provision of these terms is found unenforceable, the remaining provisions will continue in full force and effect.`,
  },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Terms of Service</h1>
            <p className="text-slate-500 text-sm">Effective date: January 1, 2024</p>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Please read these Terms of Service carefully before using FundRaise. These terms
              govern your use of our platform and form a legally binding agreement between you and FundRaise.
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
              Questions about these terms? Contact us at{' '}
              <a href="mailto:legal@fundraise.com" className="font-medium underline hover:text-emerald-800">
                legal@fundraise.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}