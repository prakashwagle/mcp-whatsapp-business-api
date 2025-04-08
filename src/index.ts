import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Main entry point for WhatsApp Business API MCP
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 