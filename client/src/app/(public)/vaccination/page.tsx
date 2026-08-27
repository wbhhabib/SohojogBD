import { Bird, Users2, PiggyBank, CalendarCheck2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ComingSoon from '@/components/common/ComingSoon'

export const metadata = {
    title: 'ভ্যাকসিনেশন | SohojogBD',
    description: 'ক্ষুদ্র পোল্ট্রি খামারিদের জন্য সমবায়ভিত্তিক, স্বল্প খরচে ভ্যাকসিনেশন সুবিধা — খুব শীঘ্রই আসছে SohojogBD-তে।',
}

const features = [
    {
        icon: <Users2 size={20} />,
        title: 'একসাথে গ্রুপ গঠন',
        description: 'আপনার এলাকায় অল্প পরিসরে (১০-৩০টি) হাঁস-মুরগি পালনকারী পরিবারদের সাথে একটি গ্রুপে যুক্ত হন।',
    },
    {
        icon: <PiggyBank size={20} />,
        title: 'সাশ্রয়ী খরচ',
        description: 'সমবায়ভিত্তিক আয়োজনের মাধ্যমে ভ্যাকসিনেশনের মাথাপিছু খরচ উল্লেখযোগ্যভাবে কমিয়ে আনুন।',
    },
    {
        icon: <CalendarCheck2 size={20} />,
        title: 'নির্ধারিত সময়সূচি',
        description: 'ভ্যাকসিনেটরের সাথে সমন্বয় করে গ্রুপের জন্য সুবিধাজনক তারিখ ও সময় নির্ধারণ করুন।',
    },
]

export default function VaccinationPage() {
    return (
        <>
            <Navbar />
            <ComingSoon
                accent="sky"
                icon={<Bird className="w-full h-full" />}
                title="ভ্যাকসিনেশন"
                tagline="সমবায়ে শক্তি, সাশ্রয়ে সুরক্ষা"
                description="গ্রামে ও শহরে অসংখ্য পরিবার অল্প পরিসরে হাঁস-মুরগি পালন করেন, কিন্তু এককভাবে ভ্যাকসিনেশন করাতে গেলে খরচ ও প্রাপ্যতা উভয়ই বড় বাধা হয়ে দাঁড়ায়। এই ফিচারের মাধ্যমে আশেপাশের খামারি পরিবারগুলো একত্রিত হয়ে সমবায়ভিত্তিক ভ্যাকসিনেশন সুবিধা নিতে পারবেন — কম খরচে, নির্ধারিত সময়ে। কাজ চলছে, শীঘ্রই আসছে।"
                features={features}
            />
            <Footer />
        </>
    )
}