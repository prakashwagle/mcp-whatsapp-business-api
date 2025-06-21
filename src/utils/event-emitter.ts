// Event emitter for internal application events
import { EventEmitter } from 'events';

export interface WhatsAppEvent {
  type:
    | 'message_sent'
    | 'message_failed'
    | 'message_received'
    | 'message_status_update'
    | 'api_call'
    | 'rate_limit_hit'
    | 'error';
  timestamp: Date;
  data: any;
  phoneNumberId?: string;
  sessionId?: string;
}

export class WhatsAppEventEmitter extends EventEmitter {
  private static instance: WhatsAppEventEmitter;

  private constructor() {
    super();
    this.setMaxListeners(100); // Allow many SSE connections
  }

  static getInstance(): WhatsAppEventEmitter {
    if (!WhatsAppEventEmitter.instance) {
      WhatsAppEventEmitter.instance = new WhatsAppEventEmitter();
    }
    return WhatsAppEventEmitter.instance;
  }

  emitWhatsAppEvent(event: WhatsAppEvent): void {
    this.emit('whatsapp_event', event);

    // Also emit specific event types for targeted listening
    this.emit(event.type, event);
  }

  emitMessageSent(
    messageId: string,
    phoneNumber: string,
    content: any,
    sessionId?: string
  ): void {
    this.emitWhatsAppEvent({
      type: 'message_sent',
      timestamp: new Date(),
      data: { messageId, phoneNumber, content },
      phoneNumberId: phoneNumber,
      sessionId,
    });
  }

  emitMessageFailed(
    error: any,
    phoneNumber: string,
    content: any,
    sessionId?: string
  ): void {
    this.emitWhatsAppEvent({
      type: 'message_failed',
      timestamp: new Date(),
      data: { error: error.message || error, phoneNumber, content },
      phoneNumberId: phoneNumber,
      sessionId,
    });
  }

  emitApiCall(
    endpoint: string,
    method: string,
    responseTime: number,
    sessionId?: string
  ): void {
    this.emitWhatsAppEvent({
      type: 'api_call',
      timestamp: new Date(),
      data: { endpoint, method, responseTime },
      sessionId,
    });
  }

  emitRateLimitHit(
    endpoint: string,
    retryAfter: number,
    sessionId?: string
  ): void {
    this.emitWhatsAppEvent({
      type: 'rate_limit_hit',
      timestamp: new Date(),
      data: { endpoint, retryAfter },
      sessionId,
    });
  }

  emitError(error: any, context: string, sessionId?: string): void {
    this.emitWhatsAppEvent({
      type: 'error',
      timestamp: new Date(),
      data: { error: error.message || error, context },
      sessionId,
    });
  }
}

export const eventEmitter = WhatsAppEventEmitter.getInstance();
