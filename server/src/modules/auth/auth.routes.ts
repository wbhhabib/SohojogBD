import { Router } from 'express'
import passport from 'passport'
import * as authController from './auth.controller'
import { validate } from '../../middlewares/validate.middleware'
import { authenticate } from '../../middlewares/auth.middleware'
import { env } from '../../config/env'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schema'

const router = Router()


router.post('/register', validate(registerSchema), authController.register)
router.post('/verify-email', authController.verifyEmail)
router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword)
router.post('/logout', authenticate, authController.logout)


if (env.GOOGLE_CLIENT_ID) {

  router.get('/google', (req, res, next) => {
    // "next" যদি নিরাপদ (শুধু relative path) হয়, সেটাকে OAuth-এর "state"
    // প্যারামিটার হিসেবে পাঠিয়ে দাও — Google callback-এ এটাই ফেরত আসবে।
    const rawNext = typeof req.query.next === 'string' ? req.query.next : ''
    const nextPath = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : ''

    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state: nextPath,
    })(req, res, next)
  })


  router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/auth/login?error=google_failed',
    }),
    authController.googleCallback
  )
} else {

  router.get('/google', (_req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google login is not configured on this server.',
    })
  })
}

export default router