// server/src/modules/verification/verification.config.ts

// প্রতিটা action-এর জন্য কোন কোন User field অবশ্যই ভরা থাকতে হবে তার তালিকা।
// নতুন action যোগ করতে হলে শুধু এখানে একটা নতুন entry যোগ করো — বাকি কোড ছোঁয়া লাগবে না।

export type ActionType =
    | 'CAMPAIGN_CREATE'
    | 'VOLUNTEER_REQUEST'
    | 'WHOLESALE_JOIN'
    | 'COURSE_APPLY'
    | 'PLANT_CLAIM'
    | 'SOS_RESPOND' // sensitive: verification + বয়স দুটোই লাগবে, দেখো verification.service.ts

// User model-এর যেসব field completeness check করা যাবে
export type CheckableField =
    | 'phone'
    | 'address'
    | 'dateOfBirth'
    | 'identityType'
    | 'identityNumber'
    | 'identityDocPicture'
    | 'emergencyContactName'
    | 'emergencyContactPhone'
    | 'sex'
    | 'occupation'
    | 'educationLevel'
    | 'institution'
    | 'bloodGroup'
    | 'skill'
    | 'division'
    | 'district'
    | 'upazila'
    | 'isStudent'
    | 'studentIdCard'

// common/core fields — accountability-এর জন্য প্রায় সব action-এই লাগে
const CORE_FIELDS: CheckableField[] = [
    'phone',
    'address',
    'identityType',
    'identityNumber',
    'identityDocPicture',
]

export const ACTION_REQUIRED_FIELDS: Record<ActionType, CheckableField[]> = {
    CAMPAIGN_CREATE: [...CORE_FIELDS],

    VOLUNTEER_REQUEST: [
        ...CORE_FIELDS,
        'sex',
        'dateOfBirth',
        'occupation',
        'educationLevel',
        'institution',
        'bloodGroup',
        'skill',
        'division',
        'district',
        'upazila',
        'emergencyContactName',
        'emergencyContactPhone',
    ],

    WHOLESALE_JOIN: ['phone', 'address'],

    COURSE_APPLY: [...CORE_FIELDS, 'educationLevel', 'institution'],

    PLANT_CLAIM: [...CORE_FIELDS, 'isStudent', 'studentIdCard', 'institution'],

    // SOS_RESPOND-এর জন্য field-completeness এখানে চেক হয় না —
    // verification.service.ts-এর canRespondToSOS() আলাদাভাবে
    // VerificationStatus + বয়স ≥ ১৮ চেক করে, দুটো স্বাধীন শর্ত
    SOS_RESPOND: [...CORE_FIELDS, 'dateOfBirth'],
}

// কোন actionType admin approval ছাড়াই সাথে সাথে চলতে পারবে (low-risk),
// আর কোনটা approval না হওয়া পর্যন্ত "PENDING"/অদৃশ্য থাকবে (high-risk)
export const ACTION_REQUIRES_ADMIN_APPROVAL: Record<ActionType, boolean> = {
    CAMPAIGN_CREATE: true,
    VOLUNTEER_REQUEST: false, // org সাথে সাথে দেখতে পাবে, communication শুরু করতে পারবে
    WHOLESALE_JOIN: false,
    COURSE_APPLY: false,
    PLANT_CLAIM: true, // physically দেওয়ার আগে verify লাগবে
    SOS_RESPOND: true,
}