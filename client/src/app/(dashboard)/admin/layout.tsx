import RequireRole from '@/components/auth/RequireRole'

// /admin/users, /admin/campaigns, /admin/organizations, /admin/course-providers,
// /admin/verifications, /admin/donations, /admin/reports, /admin/analytics,
// /admin/settings — এই সবগুলো সাবরুটই এখন এই layout-এর নিচে পড়ে, তাই
// একবার এখানে ADMIN role গার্ড বসালেই সবগুলো কভার হয়ে যায়।
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequireRole roles={['ADMIN']} redirectTo="/">
            {children}
        </RequireRole>
    )
}