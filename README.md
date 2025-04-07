# WhatsApp Business API MCP Integration

A Node.js application for integrating with the WhatsApp Business API using the Meta Cloud Platform (MCP).

## Features

- Business Profile Management
- Message Sending and Receiving
- Phone Number Management
- Two-Step Verification
- Registration Management

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- WhatsApp Business API Account
- Meta Cloud Platform Access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whatsapp-business-api-mcp.git
cd whatsapp-business-api-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure your environment variables:
```env
PORT=3000
NODE_ENV=development
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_API_TOKEN=your_api_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
JWT_SECRET=your_jwt_secret_here
```

## Development

To start the development server:
```bash
npm run dev
```

## Building

To build the application:
```bash
npm run build
```

## Testing

To run tests:
```bash
npm test
```

## Project Structure

```
whatsapp-business-api-mcp/
├── src/
│   ├── config/          # Configuration settings
│   ├── controllers/     # API controllers
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── types/           # TypeScript types
│   └── mcp/             # MCP integration
```

## API Documentation

The API documentation will be available at `http://localhost:3000/api-docs` when the server is running.

## License

MIT 