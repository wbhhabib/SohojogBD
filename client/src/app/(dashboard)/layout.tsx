import RequireRole from '@/components/auth/RequireRole'

// এই গ্রুপের ভেতরে থাকা সব রুট (/creator/*, /donor/*, /admin/*, /dashboard/*)
// লগইন করা ইউজারের জন্য — লগইন ছাড়া কেউ URL সরাসরি খুললে সাথে সাথে
// /auth/login-এ পাঠানো হয়। নির্দিষ্ট role-ভিত্তিক (যেমন শুধু ADMIN) অতিরিক্ত
// গার্ড দরকার হলে সেই সাবরুটে আলাদা layout.tsx-এ roles prop দিয়ে বসানো আছে
// (দেখুন: admin/layout.tsx, dashboard/admin/layout.tsx)।
export default function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <RequireRole>{children}</RequireRole>
}