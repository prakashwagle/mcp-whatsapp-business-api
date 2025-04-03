import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';

const router = Router();
const messageController = new MessageController();

router.post('/send', (req, res) => messageController.sendMessage(req, res));
router.get('/status/:messageId', (req, res) => messageController.getMessageStatus(req, res));

export default router;
