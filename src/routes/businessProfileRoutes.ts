import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getBusinessProfile,
  updateBusinessProfile
} from '../controllers/businessProfileController';

const router = Router();

router.use(authenticate);

router.get('/', getBusinessProfile);
router.put('/', updateBusinessProfile);

export default router; 