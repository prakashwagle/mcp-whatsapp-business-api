# Setup & Deployment Guide

This comprehensive guide covers everything from WhatsApp API setup to production deployment of the WhatsApp Business API MCP server.

## Table of Contents

- [Prerequisites](#prerequisites)
- [WhatsApp API Setup](#whatsapp-api-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [MCP Integration](#mcp-integration)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Facebook/Meta developer account
- A business Facebook page
- A phone number that can receive SMS/calls for verification

---

## WhatsApp API Setup

### 1. Create a Meta Developer Account

If you don't already have a Meta Developer Account:

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "Get Started" or "Log In"
3. Complete the registration process

### 2. Set Up a WhatsApp Business Account

1. Go to the [Meta Developer Dashboard](https://developers.facebook.com/apps/)
2. Click "Create App"
3. Select "Business" as the app type
4. Enter your app name and contact email
5. Select your Business Account (or create one if needed)
6. Click "Create App"

### 3. Add WhatsApp to Your App

1. In your app dashboard, scroll down to find WhatsApp
2. Click "Set Up"
3. Accept the terms and conditions
4. You'll be taken to the WhatsApp setup page

### 4. Register a Phone Number

1. In the WhatsApp API setup page, go to "From" section
2. Click "Add phone number"
3. Enter your business information:
   - Display name (follows WhatsApp guidelines)
   - Category
   - Business description (optional)
4. Add your phone number and verify it via SMS or voice call
5. Note down your:
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
   - **WhatsApp phone number**

### 5. Generate an Access Token

1. Go to your app's dashboard
2. Click on "App Settings" > "Basic"
3. Scroll down to find the "App Secret"
4. Go to "System Users" in Business Settings
5. Create a new System User with appropriate permissions
6. Generate a token with the WhatsApp messaging permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
7. **Note down the access token** (keep it secure!)

### 6. Enable Two-Step Verification (Optional)

If required for your WhatsApp Business API account:

1. Set up two-factor authentication on your Facebook account
2. Use the `whatsapp_enable_two_step_verification` tool in this project to set a PIN

---

## Local Development

### Quick Start

1. **Clone and install:**
   ```bash
   git clone https://github.com/prakashwagle/mcp-whatsapp-business-api.git
   cd mcp-whatsapp-business-api
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials from WhatsApp API setup
   ```

3. **Environment variables:**
   ```env
   # Server Configuration
   SERVER_PORT=3000
   NODE_ENV=development

   # WhatsApp API Configuration (from step 5 above)
   WHATSAPP_API_VERSION=v21.0
   WHATSAPP_ACCESS_TOKEN=your_access_token_from_step_5
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_from_step_4
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_from_step_4

   # Database Configuration (Optional)
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=whatsapp_mcp
   DATABASE_USERNAME=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_SSL=false
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Verify setup:**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok"}
   ```

⚠️ **Security:** Never commit `.env` to git (already in `.gitignore`)

---

## Production Deployment

### Option 1: AWS Systems Manager (SSM) ⭐ **RECOMMENDED**

**Benefits:**
- ✅ Encrypted storage
- ✅ Fine-grained access control  
- ✅ Audit logging
- ✅ Version history
- ✅ Free for standard parameters

**Setup:**
```bash
# Store secrets in SSM Parameter Store
aws ssm put-parameter \
  --name "/whatsapp-mcp/whatsapp-access-token" \
  --value "your_actual_token" \
  --type "SecureString" \
  --description "WhatsApp Access Token"

aws ssm put-parameter \
  --name "/whatsapp-mcp/database-password" \
  --value "your_db_password" \
  --type "SecureString"
```

**EC2 IAM Role Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": [
        "arn:aws:ssm:*:*:parameter/whatsapp-mcp/*"
      ]
    }
  ]
}
```

**Deploy:**
```bash
# Build and deploy
npm run build
docker build -t whatsapp-mcp .
docker run -e NODE_ENV=production -e AWS_REGION=us-east-1 -p 3000:3000 whatsapp-mcp
```

### Option 2: Docker with Environment Variables

**For simple deployments:**
```bash
docker run \
  -e WHATSAPP_ACCESS_TOKEN="your_token" \
  -e WHATSAPP_PHONE_NUMBER_ID="your_phone_id" \
  -e WHATSAPP_BUSINESS_ACCOUNT_ID="your_business_id" \
  -e DATABASE_PASSWORD="your_password" \
  -p 3000:3000 \
  whatsapp-mcp
```

### Option 3: Docker Swarm Secrets

**For Docker Swarm deployments:**
```bash
# Create secrets
echo "your_token" | docker secret create whatsapp_token -
echo "your_password" | docker secret create db_password -

# Use in docker-compose.yml
version: '3.8'
services:
  app:
    image: whatsapp-mcp
    secrets:
      - whatsapp_token
      - db_password
secrets:
  whatsapp_token:
    external: true
  db_password:
    external: true
```

### Option 4: AWS Secrets Manager

**For enterprise deployments:**
```bash
# Create secret (~$0.40/month per secret)
aws secretsmanager create-secret \
  --name "whatsapp-mcp/credentials" \
  --secret-string '{"whatsapp_token":"your_token","db_password":"your_password"}'
```

---

## MCP Integration

### With Claude Desktop

1. **Install globally:**
   ```bash
   npm run build
   npm install -g .
   ```

2. **Configure Claude Desktop:**
   Add to your Claude Desktop MCP configuration:
   ```json
   {
     "mcpServers": {
       "whatsapp-business-api": {
         "command": "mcp-whatsapp-business-api"
       }
     }
   }
   ```

3. **Test connection:**
   In Claude, try: *"Can you show me my WhatsApp business profile?"*

### With Claude CLI

```bash
claude --mcp="mcp-whatsapp-business-api"
```

---

## Security Best Practices

### ✅ Do:
- Use IAM roles instead of access keys on EC2
- Rotate credentials regularly
- Use least-privilege access
- Enable CloudTrail for audit logs
- Use different credentials for dev/staging/prod
- Use SSM Parameter Store or Secrets Manager for production

### ❌ Don't:
- Hardcode credentials in source code
- Commit `.env` files to git
- Use the same credentials across environments
- Store credentials in container images
- Use overly broad IAM policies

---

## Troubleshooting

### Connection Issues

- **Server not accessible:** Ensure port 3000 is not blocked by firewall
- **MCP connection fails:** Verify server is running and MCP configuration is correct
- **Health check fails:** Check server logs for startup errors

### Authentication Errors

- **Invalid access token:** Verify token has correct permissions (`whatsapp_business_messaging`, `whatsapp_business_management`)
- **Phone number not found:** Ensure phone number is properly registered with WhatsApp Business API
- **Rate limiting:** Implement proper retry logic and respect API limits

### Common API Error Codes

- **Error 100:** Parameter missing - check that all required parameters are provided
- **Error 131000:** Cannot send message - user hasn't messaged you within 24 hours, use a template message
- **Error 132000:** Template message error - template not approved or doesn't exist
- **Error 190:** Access token issue - token expired or invalid permissions

### Development Issues

- **TypeScript errors:** Run `npm run build` to check compilation
- **Lint warnings:** Run `npm run lint` - warnings are expected for `any` types with API responses
- **Database connection:** Check PostgreSQL credentials and network connectivity

### Getting Help

1. Check server logs for detailed error messages
2. Verify WhatsApp Business account status in Meta Business Manager
3. Review [WhatsApp Business API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/)
4. Test API calls directly using curl or Postman

---

## Next Steps

After successful setup:

1. **Message Templates:** Create and register templates for business-initiated messages
2. **Webhooks:** Set up webhooks to receive incoming messages  
3. **Integration:** Connect with your business systems (CRM, support tools)
4. **Monitoring:** Implement logging and analytics for message tracking
5. **Scaling:** Consider load balancing and database optimization for high volume

For production deployment assistance, refer to the Docker and AWS deployment sections above.