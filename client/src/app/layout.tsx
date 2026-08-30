import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/auth/AuthProvider'
import ServiceWorkerRegister from '@/components/common/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: "SohojogBD — Bangladesh's Social Support Platform",
  description: 'Fundraising, volunteering, plant giveaways, and community support — all in one platform for Bangladesh.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}