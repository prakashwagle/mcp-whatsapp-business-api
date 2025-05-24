# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build`
- Start production: `npm run start`
- Development: `npm run dev`
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Format: `npm run format`
- Format check: `npm run format:check`
- Test: Need to implement Jest tests (currently placeholder in package.json)
- Run single test: `npx jest path/to/test-file.test.ts`
- MCP Integration: 
  1. Create `.env` file with WhatsApp credentials
  2. Run `npm run build`
  3. Run `npm install -g .` to install globally
  4. Use Claude CLI with `claude --mcp="mcp-whatsapp-business-api"`

## Code Style Guidelines
- TypeScript with strict type checking enabled
- ES modules (`.js` extension in imports despite TypeScript)
- Error handling: try/catch blocks with structured error responses
- Use Zod for schema validation and type safety
- Imports should be grouped: external dependencies first, then internal imports
- Function naming: camelCase, with 'setup' prefix for MCP resource initializers
- Classes: PascalCase
- Variables/parameters: camelCase
- Error messages: descriptive and user-friendly
- Asynchronous code: use async/await pattern consistently
- Documentation: Add JSDoc comments for exported functions