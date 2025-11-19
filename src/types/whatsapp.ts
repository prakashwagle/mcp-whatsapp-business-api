export interface WhatsAppResponse<T = any> {
    messaging_product: string;
    contacts?: Array<{
        input: string;
        wa_id: string;
    }>;
    messages?: Array<{
        id: string;
    }>;
    data?: T;
    error?: {
        message: string;
        type: string;
        code: number;
        error_data: {
            messaging_product: string;
            details: string;
        };
        fbtrace_id: string;
    };
    [key: string]: any;
}

export interface WhatsAppMessage {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'text' | 'template' | 'image' | 'audio' | 'document' | 'video' | 'sticker' | 'interactive';
    text?: {
        body: string;
        preview_url?: boolean;
    };
    template?: {
        name: string;
        language: {
            code: string;
        };
        components?: any[];
    };
    [key: string]: any;
}

export interface WhatsAppTemplate {
    name: string;
    components: any[];
    language: string;
    status: string;
    category: string;
    id: string;
}
