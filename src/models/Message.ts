export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'image' | 'document' | 'template';
  content: {
    text?: string;
    caption?: string;
    mediaUrl?: string;
    templateName?: string;
    templateData?: Record<string, any>;
  };
  metadata?: {
    messageId?: string;
    timestamp?: number;
    [key: string]: any;
  };
}

export interface MessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
  error?: string;
}
