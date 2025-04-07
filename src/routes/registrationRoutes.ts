import { Router } from 'express';
import * as businessProfileController from '../controllers/businessProfileController';

const router = Router();

/**
 * @route GET /api/business-profile
 * @desc Get business profile information
 * @access Private
 */
router.get('/', businessProfileController.getBusinessProfile);

/**
 * @route PUT /api/business-profile
 * @desc Update business profile information
 * @access Private
 */
router.put('/', businessProfileController.updateBusinessProfile);

export default router;