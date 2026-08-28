import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import { env } from '../config/env'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = path.join(env.UPLOAD_DIR, 'images')
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only jpeg, jpg, png, and webp images are allowed'))
  }
}

const multerConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
})

export const uploadSingle = multerConfig.single('image')
export const uploadMultiple = multerConfig.array('images', 5)

// ── In-memory upload (no disk write) — used for AI image analysis where we ──
// only need the raw bytes momentarily to send to the Gemini API, not to
// persist the file as a listing photo.
const memoryUploadConfig = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
})

export const uploadSingleMemory = memoryUploadConfig.single('image')

// ── Verification documents (org registration certificates, NID copies, ────
// authorization letters, activity reports) — PDF or image, up to 10MB.
// Stored in a separate, non-public-by-default folder since these can
// contain sensitive personal data (NID numbers etc). Serve these only
// through an authenticated/authorized route, never from the static
// /uploads mount used for public images.
const DOCUMENT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]

const documentStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = path.join(env.UPLOAD_DIR, 'documents')
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const documentFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'))
  }
}

const documentMulterConfig = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: DOCUMENT_MAX_FILE_SIZE,
  },
})

export const uploadDocument = documentMulterConfig.single('document')
export const uploadDocuments = documentMulterConfig.array('documents', 10)
