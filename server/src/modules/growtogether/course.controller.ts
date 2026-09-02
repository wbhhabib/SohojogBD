import { Request, Response, NextFunction } from 'express'
import * as courseService from './course.service'
import { sendSuccess, sendPaginated } from '../../utils/response'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next)

export const getAllCourses = asyncHandler(async (req, res) => {
    const { courses, meta } = await courseService.getAllCourses(req.query)
    sendPaginated(res, courses, meta, 'Courses fetched successfully')
})

export const getCourseBySlug = asyncHandler(async (req, res) => {
    const course = await courseService.getCourseBySlug(req.params.slug)
    sendSuccess(res, course, 'Course fetched successfully')
})

export const getOrgCourses = asyncHandler(async (req, res) => {
    const courses = await courseService.getOrgCourses(req.params.organizationId)
    sendSuccess(res, courses, "Organization's courses fetched successfully")
})

export const createCourse = asyncHandler(async (req, res) => {
    const course = await courseService.createCourse(req.user!.id, req.body)
    sendSuccess(res, course, 'Course posted successfully', 201)
})

export const closeCourse = asyncHandler(async (req, res) => {
    const result = await courseService.closeCourse(req.params.id, req.user!.id, req.user!.role)
    sendSuccess(res, null, result.message)
})

export const reopenCourse = asyncHandler(async (req, res) => {
    const result = await courseService.reopenCourse(req.params.id, req.user!.id, req.user!.role)
    sendSuccess(res, null, result.message)
})