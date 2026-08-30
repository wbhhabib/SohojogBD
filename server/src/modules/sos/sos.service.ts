import { VolunteerRequestStatus, SOSStatus, Role } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { env } from '../../config/env'
import { sendPushToUser } from '../push/push.service'
import {
    CreateSOSInput,
    ResponderSettingsInput,
} from './sos.schema'

const createHttpError = (message: string, statusCode: number) => {
    const err = new Error(message) as Error & { statusCode: number }
    err.statusCode = statusCode
    return err
}

// Haversine formula — distance between two lat/lng points, in kilometers
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const SOS_SELECT = {
    id: true,
    message: true,
    latitude: true,
    longitude: true,
    address: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    requesterId: true,
    requester: { select: { id: true, name: true, avatar: true, phone: true } },
    _count: { select: { responses: true } },
} as const

export const createSOSRequest = async (requesterId: string, data: CreateSOSInput) => {
    const sos = await prisma.sOSRequest.create({
        data: {
            message: data.message,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            requesterId,
            status: SOSStatus.OPEN,
        },
        select: SOS_SELECT,
    })

    // ── Find nearby accepted volunteers and notify them ──────────────────
    const searchRadius = data.radiusKm ?? env.SOS_MATCH_RADIUS_KM

    const acceptedVolunteers = await prisma.volunteerRequest.findMany({
        where: { status: VolunteerRequestStatus.ACCEPTED },
        select: { volunteerId: true },
        distinct: ['volunteerId'],
    })
    const volunteerIds = acceptedVolunteers.map((v) => v.volunteerId)

    const candidates = await prisma.user.findMany({
        where: {
            id: { in: volunteerIds },
            pushEnabled: true,
            respLat: { not: null },
            respLng: { not: null },
        },
        select: { id: true, respLat: true, respLng: true, respRadiusKm: true },
    })

    const nearby = candidates
        .map((c) => ({
            ...c,
            distance: distanceKm(data.latitude, data.longitude, c.respLat!, c.respLng!),
        }))
        .filter((c) => c.distance <= Math.min(searchRadius, c.respRadiusKm ?? searchRadius))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, env.SOS_MAX_NOTIFIED)

    await Promise.all(
        nearby.map((c) =>
            sendPushToUser(c.id, {
                title: '🆘 Emergency Nearby',
                body: data.message,
                url: `/bdcare/sos/${sos.id}`,
            })
        )
    )

    await Promise.all(
        nearby.map((c) =>
            prisma.notification.create({
                data: {
                    type: 'SYSTEM',
                    userId: c.id,
                    title: '🆘 Emergency Nearby',
                    message: data.message,
                },
            })
        )
    )

    return { ...sos, notifiedCount: nearby.length }
}

export const getSOSById = async (id: string) => {
    const sos = await prisma.sOSRequest.findUnique({
        where: { id },
        select: {
            ...SOS_SELECT,
            responses: {
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    responder: { select: { id: true, name: true, avatar: true, phone: true } },
                },
            },
        },
    })
    if (!sos) throw createHttpError('SOS request not found', 404)
    return sos
}

export const getMySOSRequests = async (requesterId: string) => {
    return prisma.sOSRequest.findMany({
        where: { requesterId },
        orderBy: { createdAt: 'desc' },
        select: SOS_SELECT,
    })
}

export const getNearbyOpenSOS = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { respLat: true, respLng: true, respRadiusKm: true },
    })
    if (!user?.respLat || !user?.respLng) {
        throw createHttpError('Set your responder location first', 400)
    }

    const openRequests = await prisma.sOSRequest.findMany({
        where: { status: SOSStatus.OPEN },
        orderBy: { createdAt: 'desc' },
        select: SOS_SELECT,
    })

    return openRequests
        .map((s) => ({
            ...s,
            distanceKm: distanceKm(user.respLat!, user.respLng!, s.latitude, s.longitude),
        }))
        .filter((s) => s.distanceKm <= (user.respRadiusKm ?? env.SOS_MATCH_RADIUS_KM))
        .sort((a, b) => a.distanceKm - b.distanceKm)
}

export const respondToSOS = async (
    sosId: string,
    responderId: string,
    status: 'ACKNOWLEDGED' | 'ON_THE_WAY' | 'ARRIVED'
) => {
    const sos = await prisma.sOSRequest.findUnique({ where: { id: sosId } })
    if (!sos) throw createHttpError('SOS request not found', 404)
    if (sos.status !== SOSStatus.OPEN) {
        throw createHttpError('This SOS request is no longer open', 400)
    }

    const response = await prisma.sOSResponse.upsert({
        where: { sosRequestId_responderId: { sosRequestId: sosId, responderId } },
        create: { sosRequestId: sosId, responderId, status },
        update: { status },
    })

    if (sos.status === SOSStatus.OPEN) {
        await prisma.sOSRequest.update({
            where: { id: sosId },
            data: { status: SOSStatus.ACKNOWLEDGED },
        })
    }

    await prisma.notification.create({
        data: {
            type: 'SYSTEM',
            userId: sos.requesterId,
            title: 'Someone is responding to your SOS',
            message: 'A nearby volunteer has acknowledged your emergency request.',
        },
    })

    return response
}

export const updateSOSStatus = async (
    sosId: string,
    userId: string,
    userRole: string,
    status: 'RESOLVED' | 'CANCELLED'
) => {
    const sos = await prisma.sOSRequest.findUnique({ where: { id: sosId } })
    if (!sos) throw createHttpError('SOS request not found', 404)
    if (sos.requesterId !== userId && userRole !== Role.ADMIN) {
        throw createHttpError('Access denied', 403)
    }

    return prisma.sOSRequest.update({
        where: { id: sosId },
        data: { status: status as SOSStatus },
        select: SOS_SELECT,
    })
}

export const updateResponderSettings = async (userId: string, data: ResponderSettingsInput) => {
    return prisma.user.update({
        where: { id: userId },
        data,
        select: { respLat: true, respLng: true, respRadiusKm: true, pushEnabled: true },
    })
}

export const getResponderSettings = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { respLat: true, respLng: true, respRadiusKm: true, pushEnabled: true },
    })
    if (!user) throw createHttpError('User not found', 404)
    return user
}