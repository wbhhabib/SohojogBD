import { Router } from 'express'
import * as donationController from './donation.controller'
import { authenticate, authorize } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { createDonationSchema } from './donation.schema'
import { initiatePayment } from '../payments/payment.service'
import { sendSuccess } from '../../utils/response'

const router = Router()




router.get('/campaign/:id', donationController.getCampaignDonations)


router.get('/my', authenticate, donationController.getMyDonations)


router.get('/creator', authenticate, authorize('CREATOR'), donationController.getCreatorDonations)


router.get('/admin/all', authenticate, authorize('ADMIN'), donationController.getAllDonations)


router.post('/', authenticate, validate(createDonationSchema), donationController.initiateDonation)


router.post(
  '/:donationId/pay',
  authenticate,
  async (req, res, next) => {
    try {
      const donorId = req.user!.id
      const { donationId } = req.params
      const data = await initiatePayment(donorId, donationId)
      sendSuccess(res, data, 'Payment initiated successfully')
    } catch (err) {
      next(err)
    }
  }
)







import { completeDonation } from './donation.service'

router.post(
  '/:donationId/mock-confirm',
  async (req, res, next) => {
    try {
      const { donationId } = req.params
      const result = await completeDonation(donationId)
      sendSuccess(res, result, 'Mock payment confirmed successfully')
    } catch (err) {
      next(err)
    }
  }
)


router.get('/:id', authenticate, donationController.getDonationById)

export default router