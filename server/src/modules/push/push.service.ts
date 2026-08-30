import webpush from 'web-push'
import { prisma } from '../../config/database'
import { env } from '../../config/env'

webpush.setVapidDetails(
    env.VAPID_CONTACT_EMAIL,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
)

export const saveSubscription = async (
    userId: string,
    sub: { endpoint: string; keys: { p256dh: string; auth: string } }
) => {
    return prisma.pushSubscription.upsert({
        where: { endpoint: sub.endpoint },
        create: {
            userId,
            endpoint: sub.endpoint,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
        },
        update: { userId },
    })
}

export const removeSubscription = async (endpoint: string) => {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } })
    return { message: 'Unsubscribed' }
}

export const sendPushToUser = async (
    userId: string,
    payload: { title: string; body: string; url?: string }
) => {
    const subs = await prisma.pushSubscription.findMany({ where: { userId } })

    await Promise.all(
        subs.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    JSON.stringify(payload)
                )
            } catch (err: unknown) {
                const statusCode = (err as { statusCode?: number }).statusCode
                if (statusCode === 410 || statusCode === 404) {
                    await prisma.pushSubscription.deleteMany({ where: { id: sub.id } })
                }
            }
        })
    )
}