import { UserSearch, Megaphone, HeartHandshake, MapPinned } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ComingSoon from '@/components/common/ComingSoon'

export const metadata = {
    title: 'আপনজন | SohojogBD',
    description: 'আপনজন — হারিয়ে যাওয়া মানুষদের পরিবারের কাছে ফিরিয়ে আনার একটি কমিউনিটি-চালিত উদ্যোগ, খুব শীঘ্রই আসছে।',
}

const features = [
    {
        icon: <Megaphone size={20} />,
        title: 'নিখোঁজ সংবাদ প্রকাশ',
        description: 'ছবি ও প্রয়োজনীয় তথ্যসহ নিখোঁজ ব্যক্তির সংবাদ প্রকাশ করুন, যাতে দ্রুত ছড়িয়ে পড়ে।',
    },
    {
        icon: <UserSearch size={20} />,
        title: 'শনাক্তকরণ ও রিপোর্ট',
        description: 'কেউ কাউকে দেখতে পেলে বা চিনতে পারলে সহজেই রিপোর্ট করে জানাতে পারবেন।',
    },
    {
        icon: <HeartHandshake size={20} />,
        title: 'পুনর্মিলনে সহায়তা',
        description: 'কমিউনিটি ও স্বেচ্ছাসেবকদের সমন্বয়ে হারানো সদস্যকে নিরাপদে পরিবারের কাছে ফিরিয়ে দেওয়া।',
    },
]

export default function AponjonPage() {
    return (
        <>
            <Navbar />
            <ComingSoon
                accent="rose"
                icon={<MapPinned className="w-full h-full" />}
                title="আপনজন"
                tagline="হারিয়ে যাওয়া মানুষ, খুঁজে পাক তাদের পরিবার"
                description="আপনজন একটি কমিউনিটি-চালিত উদ্যোগ, যার লক্ষ্য পরিবার থেকে বিচ্ছিন্ন বা হারিয়ে যাওয়া মানুষদের খুঁজে বের করে তাদের প্রিয়জনদের কাছে ফিরিয়ে দেওয়া। নিখোঁজ সংবাদ প্রকাশ, শনাক্তকরণ ও কমিউনিটির সম্মিলিত প্রচেষ্টায় গড়ে উঠবে এই প্ল্যাটফর্ম। কাজ চলছে, শীঘ্রই আপনাদের জন্য নিয়ে আসছি।"
                features={features}
            />
            <Footer />
        </>
    )
}