import { Router } from 'express';
import * as phoneNumbersController from '../controllers/phoneNumbersController';

const router = Router();

/**
 * @route GET /api/phone-numbers
 * @desc Get phone numbers
 * @access Private
 */
router.get('/', phoneNumbersController.getPhoneNumbers);

export default router;