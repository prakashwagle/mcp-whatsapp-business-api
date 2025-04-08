import { startMcpServer } from '../server.js';
import { Config } from '../utils/config.js';
import { Express } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

describe('MCP Server', () => {
    let server: { server: McpServer; app: Express };

    afterEach(async () => {
        if (server?.app) {
            // Close the server
            await new Promise<void>((resolve) => {
                server.app.listen().close(() => resolve());
            });
        }
    });

    it('should start the server with valid configuration', async () => {
        const config: Config = {
            whatsappApiVersion: 'v17.0',
            whatsappAccessToken: 'test-token',
            whatsappPhoneNumberId: 'test-number-id',
            whatsappBusinessAccountId: 'test-account-id',
            serverPort: 0 // Let the OS assign a random port
        };

        server = await startMcpServer(config);
        expect(server.server).toBeDefined();
        expect(server.app).toBeDefined();
    });

    it('should handle invalid configuration', async () => {
        const config: Partial<Config> = {
            // Missing required fields
            serverPort: 0
        };

        await expect(startMcpServer(config as Config))
            .rejects
            .toThrow();
    });
}); 