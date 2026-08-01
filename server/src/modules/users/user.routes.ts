
import { Router } from 'express'
import { Role } from '../../types/prisma-enums'
import * as userController from './user.controller'
import { authenticate, authorize } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { updateProfileSchema } from './user.schema'
import { uploadSingle } from '../../middlewares/upload.middleware'

const router = Router()


router.use(authenticate)


router.get('/me', userController.getMe)
router.put('/me', validate(updateProfileSchema), userController.updateMe)



router.patch('/avatar', uploadSingle, userController.uploadAvatar)


router.get('/', authorize(Role.ADMIN), userController.getAllUsers)
router.get('/:id', authorize(Role.ADMIN), userController.getUserById)
router.patch('/:id/ban', authorize(Role.ADMIN), userController.banUser)
router.patch('/:id/unban', authorize(Role.ADMIN), userController.unbanUser)
router.delete('/:id', authorize(Role.ADMIN), userController.deleteUser)

export default router