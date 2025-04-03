import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// MCP Status endpoint
app.get('/mcp/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'active',
    version: '1.0.0',
    capabilities: [
      'send_message',
      'receive_message',
      'message_status'
    ]
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: MCP Server running at http://localhost:${port}`);
});
