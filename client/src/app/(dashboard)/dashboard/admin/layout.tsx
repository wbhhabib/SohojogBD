import RequireRole from '@/components/auth/RequireRole'

// /admin/layout.tsx আলাদা route tree (/admin/...) কভার করে; এই
// /dashboard/admin ওভারভিউ পেজটা একটা ভিন্ন path, তাই এখানেও একই
// ADMIN-only গার্ড আলাদাভাবে বসাতে হচ্ছে।
export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequireRole roles={['ADMIN']} redirectTo="/">
            {children}
        </RequireRole>
    )
}