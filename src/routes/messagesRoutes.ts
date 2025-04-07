import { Router } from 'express';
import * as messagesController from '../controllers/messagesController';

const router = Router();

/**
 * @route POST /api/messages/text
 * @desc Send a text message
 * @access Private
 */
router.post('/text', messagesController.sendTextMessage);

/**
 * @route POST /api/messages/template
 * @desc Send a template message
 * @access Private
 */
router.post('/template', messagesController.sendTemplateMessage);

export default router;