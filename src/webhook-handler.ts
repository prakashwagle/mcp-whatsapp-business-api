import { Request, Response } from 'express';
import { eventEmitter } from './utils/event-emitter.js';

export class WebhookHandler {
    private verifyToken: string;

    constructor(verifyToken: string) {
        this.verifyToken = verifyToken;
    }

    /**
     * Verifies the webhook subscription
     */
    verify(req: Request, res: Response): void {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === this.verifyToken) {
            console.log('Webhook verified successfully');
            res.status(200).send(challenge);
        } else {
            console.error('Failed to verify webhook');
            res.status(403).send('Forbidden');
        }
    }

    /**
     * Handles incoming webhook events
     */
    async handle(req: Request, res: Response): Promise<void> {
        const body = req.body;

        console.log('Webhook received:', JSON.stringify(body, null, 2));

        if (body.object === 'whatsapp_business_account') {
            body.entry?.forEach((entry: any) => {
                entry.changes?.forEach((change: any) => {
                    if (change.field === 'messages') {
                        const value = change.value;

                        // Handle incoming messages
                        if (value.messages) {
                            value.messages.forEach((message: any) => {
                                eventEmitter.emitWhatsAppEvent({
                                    type: 'message_received',
                                    timestamp: new Date(),
                                    data: {
                                        messageId: message.id,
                                        from: message.from,
                                        timestamp: message.timestamp,
                                        type: message.type,
                                        content:
                                            message.text ||
                                            message.image ||
                                            message.audio ||
                                            message.document ||
                                            message.video ||
                                            message.sticker ||
                                            message,
                                        phoneNumberId: value.metadata?.phone_number_id,
                                    },
                                });
                            });
                        }

                        // Handle message status updates
                        if (value.statuses) {
                            value.statuses.forEach((status: any) => {
                                eventEmitter.emitWhatsAppEvent({
                                    type: 'message_status_update',
                                    timestamp: new Date(),
                                    data: {
                                        messageId: status.id,
                                        status: status.status,
                                        timestamp: status.timestamp,
                                        recipientId: status.recipient_id,
                                        phoneNumberId: value.metadata?.phone_number_id,
                                    },
                                });
                            });
                        }
                    }
                });
            });
        }

        res.status(200).send('OK');
    }
}
