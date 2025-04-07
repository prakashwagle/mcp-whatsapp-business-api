export interface Message {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACT = 'contact',
  INTERACTIVE = 'interactive',
  TEMPLATE = 'template'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export interface MessageSendRequest {
  to: string;
  type: MessageType;
  content: string;
  metadata?: Record<string, any>;
} 