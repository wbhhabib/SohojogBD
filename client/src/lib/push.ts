import { pushApi } from './api'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null
    try {
        return await navigator.serviceWorker.register('/sw.js')
    } catch {
        return null
    }
}

export async function isPushSubscribed(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return !!sub
}

export async function subscribeToPush(): Promise<{ success: boolean; message?: string }> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { success: false, message: 'Push notifications are not supported in this browser.' }
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
        return { success: false, message: 'Notification permission was not granted.' }
    }

    const keyRes = await pushApi.getVapidPublicKey()
    if (!keyRes.success || !keyRes.data) {
        return { success: false, message: 'Could not fetch push configuration.' }
    }

    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyRes.data.publicKey),
    })

    const res = await pushApi.subscribe(subscription.toJSON() as PushSubscriptionJSON)
    if (!res.success) {
        return { success: false, message: res.message ?? 'Could not save your subscription.' }
    }

    return { success: true }
}

export async function unsubscribeFromPush(): Promise<void> {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
        await pushApi.unsubscribe(sub.endpoint)
        await sub.unsubscribe()
    }
}