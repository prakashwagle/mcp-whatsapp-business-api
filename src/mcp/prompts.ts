import { z } from 'zod';

// Schema definitions for MCP prompts
export const helpWithBusinessProfileSchema = z.object({
  action: z.enum(['view', 'update']),
});

export const helpWithMessagingSchema = z.object({
  messageType: z.enum(['text', 'template']),
  recipient: z.string(),
});

export const helpWithRegistrationSchema = z.object({
  action: z.enum(['register', 'deregister']),
});

export const helpWithTwoStepVerificationSchema = z.object({
  action: z.enum(['setup']),
});

// Prompt implementations for MCP
export const helpWithBusinessProfile = (params: z.infer<typeof helpWithBusinessProfileSchema>) => {
  if (params.action === 'view') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `How can I view my WhatsApp Business profile information?`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To view your WhatsApp Business profile information, you can use the \`getBusinessProfile\` resource. This will return all the details about your business profile, including about, address, description, email, websites, and vertical.

Example:
\`\`\`
GET /api/business-profile
\`\`\`

Or if you're using the MCP client directly:
\`\`\`javascript
const result = await mcpClient.getResource('businessProfile');
console.log(result);
\`\`\`
`,
          },
        },
      ],
    };
  } else {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `How can I update my WhatsApp Business profile information?`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To update your WhatsApp Business profile information, you can use the \`updateBusinessProfile\` tool. You need to provide the fields you want to update.

Example:
\`\`\`
PUT /api/business-profile
Content-Type: application/json

{
  "about": "We provide excellent customer service",
  "description": "Your trusted partner for all your needs",
  "email": "contact@yourbusiness.com",
  "websites": ["https://yourbusiness.com"],
  "vertical": "RETAIL"
}
\`\`\`

Or if you're using the MCP client directly:
\`\`\`javascript
const result = await mcpClient.useTool('updateBusinessProfile', {
  about: "We provide excellent customer service",
  description: "Your trusted partner for all your needs",
  email: "contact@yourbusiness.com",
  websites: ["https://yourbusiness.com"],
  vertical: "RETAIL"
});
console.log(result);
\`\`\`
`,
          },
        },
      ],
    };
  }
};

export const helpWithMessaging = (params: z.infer<typeof helpWithMessagingSchema>) => {
  if (params.messageType === 'text') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `How can I send a text message to ${params.recipient}?`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To send a text message to ${params.recipient}, you can use the \`sendTextMessage\` tool. You need to provide the recipient's phone number and the message text.

Example:
\`\`\`
POST /api/messages/text
Content-Type: application/json

{
  "to": "${params.recipient}",
  "text": "Hello from our business!",
  "preview_url": true
}
\`\`\`

Or if you're using the MCP client directly:
\`\`\`javascript
const result = await mcpClient.useTool('sendTextMessage', {
  to: "${params.recipient}",
  text: "Hello from our business!",
  preview_url: true
});
console.log(result);
\`\`\`

Note: The \`preview_url\` parameter is optional and determines whether links in your message should generate a preview.
`,
          },
        },
      ],
    };
  } else {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `How can I send a template message to ${params.recipient}?`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To send a template message to ${params.recipient}, you can use the \`sendTemplateMessage\` tool. You need to provide the recipient's phone number, the template name, and the language code.

Example:
\`\`\`
POST /api/messages/template
Content-Type: application/json

{
  "to": "${params.recipient}",
  "template_name": "hello_world",
  "language": {
    "code": "en_US"
  },
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "Customer"
        }
      ]
    }
  ]
}
\`\`\`

Or if you're using the MCP client directly:
\`\`\`javascript
const result = await mcpClient.useTool('sendTemplateMessage', {
  to: "${params.recipient}",
  template_name: "hello_world",
  language: {
    code: "en_US"
  },
  components: [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: "Customer"
        }
      ]
    }
  ]
});
console.log(result);
\`\`\`

Note: The template must be pre-approved by WhatsApp, and the \`components\` parameter allows you to customize the dynamic parts of the template.
`,
          },
        },
      ],
    };
  }
};

export const helpWithRegistration = (params: z.infer<typeof helpWithRegistrationSchema>) => {
  if (params.action === 'register') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `How can I register a phone number with WhatsApp Business API?`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To register a phone number with WhatsApp Business API, you can use the \`registerPhoneNumber\` tool. You need to provide the PIN you received during the verification process.

Example:
\`\`\`
POST /api/registration/register
Content-Type: application/json

{
  "pin": "123456"
}
\`\`\`

Or if you're using the MCP client directly:
\`\`\`javascript
const result = await mcpClient.useTool('registerPhoneNumber', {
  pin: "123456"
});
console.log(result);
\`\`\`

Note: Before registering, you need to request a verification code using the WhatsApp Business Platform or the Facebook Business Manager.
`,
          },
        },
      ],
    };
  } else {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `How can I deregister a phone number from WhatsApp Business API?`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To deregister a phone number from WhatsApp Business API, you can use the deregister endpoint. This will remove the phone number from your WhatsApp Business API account.

Example:
\`\`\`
POST /api/registration/deregister
Content-Type: application/json

{}
\`\`\`

Or if you're using the MCP client directly:
\`\`\`javascript
const result = await mcpClient.useTool('deregisterPhoneNumber', {});
console.log(result);
\`\`\`

Note: Deregistering a phone number is irreversible. After deregistering, you'll need to go through the registration process again if you want to use this phone number with WhatsApp Business API.
`,
          },
        },
      ],
    };
  }
};

export const helpWithTwoStepVerification = (params: z.infer<typeof helpWithTwoStepVerificationSchema>) => {
  if (params.action === 'setup') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `How can I set up two-step verification for my WhatsApp Business API account?`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `To set up two-step verification for your WhatsApp Business API account, you can use the \`setTwoStepVerification\` tool. You need to provide a PIN that will be used for verification.

Example:
\`\`\`
POST /api/two-step-verification
Content-Type: application/json

{
  "pin": "123456"
}
\`\`\`

Or if you're using the MCP client directly:
\`\`\`javascript
const result = await mcpClient.useTool('setTwoStepVerification', {
  pin: "123456"
});
console.log(result);
\`\`\`

Note: The PIN should be a secure code that you can remember. It will be required when registering your phone number with WhatsApp Business API.
`,
          },
        },
      ],
    };
  }
  
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `I need help with two-step verification for WhatsApp Business API.`,
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: `WhatsApp Business API supports two-step verification to add an extra layer of security to your account. Here are some common actions:

1. **Setup Two-Step Verification**: Use the \`setTwoStepVerification\` tool to set a PIN for two-step verification.

2. **Change Two-Step Verification PIN**: If you need to change your PIN, use the same \`setTwoStepVerification\` tool with the new PIN.

For detailed instructions on any of these actions, you can ask for specific help.
`,
        },
      },
    ],
  };
};