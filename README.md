# WhatsApp Business API MCP Integration

A Node.js-based Model Context Protocol (MCP) Server implementation that provides a standardized interface for MCP clients to interact with the WhatsApp Business API

Features
The server exposes the following WhatsApp Cloud API endpoints:

Business Profiles

Get business profile information
Update business profile information


Registration

Register a phone number
Deregister a phone number
Verify a phone number
Check registration status


Messages

Send text messages
Send template messages
Send media messages (images, audio, documents, video, stickers)
Mark messages as read
List message templates


Phone Numbers

Get all phone numbers
Get phone number details
Request verification code


Two-Step Verification

Enable two-step verification
Disable two-step verification



Prerequisites

Node.js (v16 or higher)
npm or yarn
A WhatsApp Business Account
A registered phone number for WhatsApp Business API
Access token for the WhatsApp Cloud API

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcp-whatsapp-business-api.git
cd mcp-whatsapp-business-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure your environment variables:
```env
PORT=3000
NODE_ENV=development
WHATSAPP_API_URL=https://graph.facebook.com/v21.0
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

## API Documentation

The API documentation will be available at `http://localhost:3000/api-docs` when the server is running.

## License

MIT 