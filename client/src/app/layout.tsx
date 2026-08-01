
import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  title: "FundRise — Bangladesh's Trusted Fundraising Platform",
  description: 'Raise funds for causes that matter in Bangladesh.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {




}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}