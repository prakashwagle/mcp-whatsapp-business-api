# Setup Guide

This guide will walk you through setting up the WhatsApp MCP server from scratch, including getting the necessary credentials from Meta.

## 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Facebook/Meta developer account
- A business Facebook page
- A phone number that can receive SMS/calls for verification

## 2. Create a Meta Developer Account

If you don't already have a Meta Developer Account:

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "Get Started" or "Log In"
3. Complete the registration process

## 3. Set Up a WhatsApp Business Account

1. Go to the [Meta Developer Dashboard](https://developers.facebook.com/apps/)
2. Click "Create App"
3. Select "Business" as the app type
4. Enter your app name and contact email
5. Select your Business Account (or create one if needed)
6. Click "Create App"

## 4. Add WhatsApp to Your App

1. In your app dashboard, scroll down to find WhatsApp
2. Click "Set Up"
3. Accept the terms and conditions
4. You'll be taken to the WhatsApp setup page

## 5. Register a Phone Number

1. In the WhatsApp API setup page, go to "From" section
2. Click "Add phone number"
3. Enter your business information:
   - Display name (follows WhatsApp guidelines)
   - Category
   - Business description (optional)
4. Add your phone number and verify it via SMS or voice call
5. Note down your:
   - Phone Number ID
   - WhatsApp Business Account ID
   - WhatsApp phone number

## 6. Generate an Access Token

1. Go to your app's dashboard
2. Click on "App Settings" > "Basic"
3. Scroll down to find the "App Secret"
4. Go to "System Users" in Business Settings
5. Create a new System User with appropriate permissions
6. Generate a token with the WhatsApp messaging permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
7. Note down the access token (keep it secure!)

## 7. Enable Two-Step Verification (Optional)

If required for your WhatsApp Business API account:

1. Set up two-factor authentication on your Facebook account
2. Use the `whatsapp_enable_two_step_verification` tool in this project to set a PIN

## 8. Install and Configure the MCP Server

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/whatsapp-mcp-server.git
   cd whatsapp-mcp-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your credentials:
   ```
   WHATSAPP_API_VERSION=v22.0
   WHATSAPP_ACCESS_TOKEN=your_access_token_from_step_6
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_from_step_5
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_from_step_5
   SERVER_PORT=3000
   ```

4. Build and start the server:
   ```
   npm run build
   npm start
   ```

5. Verify the server is running by checking the health endpoint:
   ```
   curl http://localhost:3000/health
   ```
   
   You should see a response like:
   ```json
   {"status":"ok"}
   ```

## 9. Connect to Claude Desktop

1. Open Claude Desktop application
2. Go to Settings > Extensions
3. Click "Add MCP Extension"
4. Enter the MCP server URL: `http://localhost:3000/mcp`
5. Give the extension a name, like "WhatsApp API"
6. Click "Connect"

## 10. Test the Connection

In Claude, try using one of the WhatsApp tools:

```
I'd like to check the status of my WhatsApp business profile. Can you help me with that?
```

Claude should use the `whatsapp_get_business_profile` tool and show you the results.

## Troubleshooting

### Connection Issues

- Ensure the server is running and accessible from Claude Desktop
- Check that the port (default: 3000) is not blocked by a firewall
- Verify that the MCP URL is correct: `http://localhost:3000/mcp`

### Authentication Errors

- Double-check that your access token is valid and has the correct permissions
- Ensure the WhatsApp API version in the `.env` file is correct
- Verify that your phone number is properly registered with WhatsApp Business API

### API Errors

- Check the server logs for detailed error messages
- Verify that your WhatsApp Business account is active and in good standing
- Make sure you're not exceeding rate limits or message template restrictions

### Common Error Messages

- `Error code 100: Parameter missing`: Check that you've provided all required parameters
- `Error code 131000`: This usually means you're trying to send a message to a number that hasn't messaged you first (within the last 24 hours) and you're not using a template
- `Error code 132000`: Your message template has not been approved or doesn't exist

## Next Steps

After successfully setting up the server:

1. Create and register message templates for business-initiated messages
2. Set up webhooks to receive incoming messages
3. Integrate with your business systems (CRM, support ticketing, etc.)
4. Implement conversation tracking and analytics