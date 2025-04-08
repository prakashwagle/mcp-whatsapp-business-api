import { Router } from 'express';
import * as twoStepVerificationController from '../controllers/twoStepVerificationController';

const router = Router();

/**
 * @route POST /api/two-step-verification
 * @desc Set two-step verification
 * @access Private
 */
router.post('/', twoStepVerificationController.setTwoStepVerification);

export default router;