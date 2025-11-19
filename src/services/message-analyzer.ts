import { WhatsAppApiClient } from '../utils/api-client.js';

export class MessageAnalyzer {
    private apiClient: WhatsAppApiClient;

    constructor(apiClient: WhatsAppApiClient) {
        this.apiClient = apiClient;
    }

    async analyzeMessage(messageContent: string): Promise<string> {
        // Analyze message content for type
        const isPromotional = /\b(coupon|discount|sale|offer|promo|deal|savings|special|limited time|exclusive|free|% off|buy now|shop now|order now)\b/i.test(messageContent);
        const isTransactional = /\b(order|receipt|confirmation|delivery|tracking|invoice|payment|appointment|booking|welcome|reset|verify)\b/i.test(messageContent);
        const isUrgent = /\b(urgent|immediate|asap|emergency|critical|important|breaking)\b/i.test(messageContent);

        let recommendation = "**📋 SMART MESSAGING RECOMMENDATION**\n\n";
        let suggestedTool = "";
        let reasoning = "";

        if (isPromotional) {
            suggestedTool = "whatsapp_send_template_message";
            reasoning = "🎯 **PROMOTIONAL CONTENT DETECTED**\n\n" +
                "Keywords found: " + (messageContent.match(/\b(coupon|discount|sale|offer|promo|deal|savings|special|limited time|exclusive|free|% off|buy now|shop now|order now)\b/gi) || []).join(", ") + "\n\n" +
                "**Why Template Message?**\n" +
                "✅ Required for promotional content\n" +
                "✅ Can reach users outside 24-hour window\n" +
                "✅ Better delivery rates for marketing\n" +
                "✅ WhatsApp compliance\n" +
                "✅ Professional appearance and analytics\n\n";
        } else if (isTransactional) {
            suggestedTool = "whatsapp_send_template_message";
            reasoning = "📋 **TRANSACTIONAL CONTENT DETECTED**\n\n" +
                "Keywords found: " + (messageContent.match(/\b(order|receipt|confirmation|delivery|tracking|invoice|payment|appointment|booking|welcome|reset|verify)\b/gi) || []).join(", ") + "\n\n" +
                "**Why Template Message?**\n" +
                "✅ Higher approval rates for transactional content\n" +
                "✅ Better delivery reliability\n" +
                "✅ Can be sent anytime\n" +
                "✅ Professional formatting\n\n";
        } else if (isUrgent) {
            suggestedTool = "whatsapp_send_text_message";
            reasoning = "🚨 **URGENT CONTENT DETECTED**\n\n" +
                "Keywords found: " + (messageContent.match(/\b(urgent|immediate|asap|emergency|critical|important|breaking)\b/gi) || []).join(", ") + "\n\n" +
                "**Why Text Message?**\n" +
                "✅ Faster to send (no template lookup)\n" +
                "✅ Immediate delivery\n" +
                "✅ Good for time-sensitive replies\n\n" +
                "⚠️ **Note:** Only works if customer messaged you within 24 hours\n\n";
        } else {
            suggestedTool = "whatsapp_send_text_message OR whatsapp_send_template_message";
            reasoning = "💬 **CONVERSATIONAL CONTENT**\n\n" +
                "**Options:**\n" +
                "1. **Text Message:** If replying within 24-hour window\n" +
                "2. **Template Message:** If business-initiated or outside 24-hour window\n\n";
        }

        // Get available templates
        const templatesResponse = await this.apiClient.get(
            `${this.apiClient.getBusinessAccountEndpoint()}/message_templates`
        );

        const templates = templatesResponse.data.data || [];
        const promotionalTemplates = templates.filter((t: any) =>
            t.category === 'MARKETING' ||
            t.name.toLowerCase().includes('promo') ||
            t.name.toLowerCase().includes('offer') ||
            t.name.toLowerCase().includes('discount')
        );

        const transactionalTemplates = templates.filter((t: any) =>
            t.category === 'UTILITY' ||
            t.name.toLowerCase().includes('confirm') ||
            t.name.toLowerCase().includes('order') ||
            t.name.toLowerCase().includes('receipt')
        );

        let templateSuggestions = "";
        if (isPromotional && promotionalTemplates.length > 0) {
            templateSuggestions = "\n**🎯 AVAILABLE PROMOTIONAL TEMPLATES:**\n" +
                promotionalTemplates.slice(0, 3).map((t: any) => `- ${t.name} (${t.status})`).join("\n") + "\n";
        } else if (isTransactional && transactionalTemplates.length > 0) {
            templateSuggestions = "\n**📋 AVAILABLE TRANSACTIONAL TEMPLATES:**\n" +
                transactionalTemplates.slice(0, 3).map((t: any) => `- ${t.name} (${t.status})`).join("\n") + "\n";
        }

        recommendation += reasoning + templateSuggestions;

        recommendation += "\n**💡 NEXT STEPS:**\n";
        if (suggestedTool.includes("template")) {
            recommendation += "1. Use `whatsapp_list_message_templates` to see all available templates\n";
            recommendation += "2. Choose appropriate template based on your content\n";
            recommendation += "3. Use `whatsapp_send_template_message` with proper parameters\n";
        } else {
            recommendation += "1. Ensure customer contacted you within last 24 hours\n";
            recommendation += "2. Use `whatsapp_send_text_message` for immediate delivery\n";
            recommendation += "3. If outside 24-hour window, use template instead\n";
        }

        recommendation += "\n**📊 For better insights:** Check analytics with `whatsapp://analytics/messaging`";

        return recommendation;
    }
}
