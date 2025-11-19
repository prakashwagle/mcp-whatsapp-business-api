import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { setupMessagesTools } from '../../api/messages.js';
import { WhatsAppApiClient } from '../../utils/api-client.js';

// Mock WhatsAppApiClient
const mockApiClient = {
    sendMessage: vi.fn(),
    post: vi.fn(),
    get: vi.fn(),
    getPhoneNumberEndpoint: vi.fn().mockReturnValue('https://graph.facebook.com/v18.0/123456789'),
    getBusinessAccountEndpoint: vi.fn().mockReturnValue('https://graph.facebook.com/v18.0/987654321'),
} as unknown as WhatsAppApiClient;

// Mock McpServer
const mockServer = {
    tool: vi.fn(),
} as unknown as McpServer;

describe('Messages API Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupMessagesTools(mockServer, mockApiClient);
    });

    describe('whatsapp_send_text_message', () => {
        it('should register the tool', () => {
            expect(mockServer.tool).toHaveBeenCalledWith(
                'whatsapp_send_text_message',
                expect.any(Object),
                expect.any(Function)
            );
        });

        it('should send text message successfully', async () => {
            const toolHandler = (mockServer.tool as any).mock.calls.find(
                (call: any) => call[0] === 'whatsapp_send_text_message'
            )[2];

            (mockApiClient.sendMessage as any).mockResolvedValue({
                data: { messages: [{ id: 'msg_123' }] }
            });

            const result = await toolHandler({
                to: '1234567890',
                message: 'Hello World'
            });

            expect(mockApiClient.sendMessage).toHaveBeenCalledWith({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: '1234567890',
                type: 'text',
                text: { body: 'Hello World', preview_url: false }
            });

            expect(result.content[0].text).toContain('Message sent successfully');
            expect(result.content[0].text).toContain('msg_123');
        });

        it('should handle errors gracefully', async () => {
            const toolHandler = (mockServer.tool as any).mock.calls.find(
                (call: any) => call[0] === 'whatsapp_send_text_message'
            )[2];

            (mockApiClient.sendMessage as any).mockRejectedValue(new Error('API Error'));

            const result = await toolHandler({
                to: '1234567890',
                message: 'Hello World'
            });

            expect(result.content[0].text).toContain('Error sending text message: API Error');
        });
    });
});
