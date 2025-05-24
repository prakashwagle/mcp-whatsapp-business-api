# WhatsApp Business API MCP Integration

A production-ready Node.js Model Context Protocol (MCP) server that provides seamless integration between Claude and the WhatsApp Business Cloud API.

## Features

### 🏢 **Business Profile Management**
- View and update business profile information
- Browse profile details via `whatsapp://business_profile`

### 📱 **Phone Number Management**  
- List all registered phone numbers
- Get detailed phone number information
- Browse phone numbers via `whatsapp://phone_numbers`
- Request verification codes

### 💬 **Messaging**
- Send text, template, and media messages
- List and browse message templates via `whatsapp://templates`
- Mark messages as read
- Support for images, audio, documents, video, and stickers

### 🔐 **Registration & Verification**
- Register and deregister phone numbers
- Phone number verification
- Two-step verification management
- Check registration status

### 🗄️ **Database Integration** (Optional)
- PostgreSQL support for data persistence
- Browse database tables and schemas via resources

### 🛠️ **Developer Experience**
- Comprehensive error handling with detailed WhatsApp API error information
- Pre-built prompts for common tasks
- TypeScript with strict type checking
- Docker containerization
- CI/CD pipeline with GitHub Actions

## Quick Start

1. **Clone and install:**
   ```bash
   git clone https://github.com/prakashwagle/mcp-whatsapp-business-api.git
   cd mcp-whatsapp-business-api
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your WhatsApp API credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Integrate with Claude:**
   ```bash
   npm run build
   npm install -g .
   claude --mcp="mcp-whatsapp-business-api"
   ```

## 📖 **Complete Setup Guide**

For detailed setup instructions including:
- WhatsApp Business API credential setup
- Production deployment options  
- Security best practices
- MCP integration with Claude Desktop
- Troubleshooting guide

👉 **[See SETUP.md](./SETUP.md)**

## Architecture

### Tools vs Resources
This project follows the optimal MCP pattern:

- **🔧 Tools** - For parameterized operations and real-time actions
  - `whatsapp_send_text_message`
  - `whatsapp_get_phone_numbers` 
  - `whatsapp_update_business_profile`

- **📋 Resources** - For browsable data discovery
  - `whatsapp://business_profile`
  - `whatsapp://phone_numbers` 
  - `whatsapp://templates`

### Built-in Prompts
- `help_with_business_profile` - Business profile management guidance
- `help_with_messaging` - Text, template, and media messaging help
- `help_with_registration` - Phone registration and verification
- `help_with_two_step_verification` - Security setup guidance
- `help_with_whatsapp_api` - General API capabilities overview

## Development

```bash
# Development server
npm run dev

# Build
npm run build

# Lint and format
npm run lint
npm run format

# Production server
npm start
```

## Production Deployment

Multiple deployment options supported:

- **AWS SSM Parameter Store** (Recommended)
- **Docker with environment variables**
- **Docker Swarm secrets**
- **AWS Secrets Manager**

See [SETUP.md](./SETUP.md#production-deployment) for detailed deployment instructions.

## Requirements

- Node.js 18+ 
- WhatsApp Business API account
- Facebook/Meta developer account
- Registered phone number for WhatsApp Business

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm test && npm run lint`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📚 [Setup Guide](./SETUP.md)
- 🐛 [Report Issues](https://github.com/prakashwagle/mcp-whatsapp-business-api/issues)
- 📖 [WhatsApp API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- 🤖 [MCP Documentation](https://modelcontextprotocol.io/introduction)