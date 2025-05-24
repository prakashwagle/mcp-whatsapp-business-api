// src/api/prompts/whatsapp-prompts.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function setupWhatsAppPrompts(server: McpServer) {
  // Prompt for business profile help
  server.prompt(
    'help_with_business_profile',
    {
      action: z.enum(['view', 'update']),
    },
    params => {
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
                text: `To view your WhatsApp Business profile information, you can use the \`whatsapp_get_business_profile\` tool. This will return all the details about your business profile, including about, address, description, email, websites, and vertical.

You can also access this information as a resource through \`whatsapp://business_profile\` for a more formatted view.

Example using the tool:
\`\`\`
Tool name: whatsapp_get_business_profile
Input: {}
\`\`\`

This will return the complete business profile information in JSON format.`,
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
                text: `To update your WhatsApp Business profile information, you can use the \`whatsapp_update_business_profile\` tool. You need to provide the fields you want to update.

Example:
\`\`\`
Tool name: whatsapp_update_business_profile
Input: {
  "about": "We provide excellent customer service",
  "description": "Your trusted partner for all your needs",
  "email": "contact@yourbusiness.com",
  "websites": ["https://yourbusiness.com"],
  "vertical": "RETAIL"
}
\`\`\`

The possible vertical values include:
- AUTOMOTIVE
- BEAUTY_SPA_AND_SALON
- CLOTHING_AND_APPAREL
- EDUCATION
- ENTERTAINMENT
- EVENT_PLANNING_AND_SERVICE
- FINANCE_AND_BANKING
- FOOD_AND_GROCERY
- GOVERNMENT
- HEALTH_AND_MEDICAL
- HOME_IMPROVEMENT
- HOTEL_AND_LODGING
- NONPROFIT
- PROFESSIONAL_SERVICES
- RETAIL
- SHOPPING_AND_RETAIL
- TRAVEL_AND_TRANSPORTATION
- RESTAURANT
- OTHER

You only need to include the fields you want to update.`,
              },
            },
          ],
        };
      }
    }
  );

  // Prompt for messaging help
  server.prompt(
    'help_with_messaging',
    {
      messageType: z.enum(['text', 'template', 'media']),
      recipient: z.string().optional(),
    },
    params => {
      const recipient = params.recipient || 'a customer';

      if (params.messageType === 'text') {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `How can I send a text message to ${recipient}?`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `To send a text message to ${recipient}, you can use the \`whatsapp_send_text_message\` tool. You need to provide the recipient's phone number and the message text.

Example:
\`\`\`
Tool name: whatsapp_send_text_message
Input: {
  "to": "${params.recipient || '1234567890'}",
  "message": "Hello from our business!",
  "preview_url": true
}
\`\`\`

The \`preview_url\` parameter is optional and determines whether links in your message should generate a preview.

Important notes:
1. The phone number must include the country code (e.g., "1" for US numbers)
2. For business-initiated conversations, you can only message users who have either:
   - Messaged you in the last 24 hours
   - Opted in to receive messages from your business
3. Otherwise, you must use a template message`,
              },
            },
          ],
        };
      } else if (params.messageType === 'template') {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `How can I send a template message to ${recipient}?`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `To send a template message to ${recipient}, you can use the \`whatsapp_send_template_message\` tool. You need to provide the recipient's phone number, the template name, and the language code.

Example:
\`\`\`
Tool name: whatsapp_send_template_message
Input: {
  "to": "${params.recipient || '1234567890'}",
  "template_name": "hello_world",
  "language_code": "en_US",
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

You can view your available templates using the \`whatsapp_list_message_templates\` tool or by accessing the \`whatsapp://templates\` resource.

Important notes:
1. The template must be pre-approved by WhatsApp
2. The components parameter allows you to customize the dynamic parts of the template
3. Template messages can be sent to users even if they haven't messaged you in the last 24 hours
4. Templates are subject to quality ratings and may be rejected if they have high block rates`,
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
                text: `How can I send a media message to ${recipient}?`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `To send a media message to ${recipient}, you can use the \`whatsapp_send_media_message\` tool. You need to provide the recipient's phone number, the media type, and the media URL.

Example:
\`\`\`
Tool name: whatsapp_send_media_message
Input: {
  "to": "${params.recipient || '1234567890'}",
  "media_type": "image",
  "media_url": "https://example.com/image.jpg",
  "caption": "Check out this image!"
}
\`\`\`

The media_type can be one of:
- image
- audio
- document
- video
- sticker

Important notes:
1. The media_url must be publicly accessible
2. The caption parameter is optional and supports text to be sent with the media
3. For business-initiated conversations, the same 24-hour messaging window restrictions apply as with text messages
4. Media files must comply with WhatsApp's size limits:
   - Images: 5MB
   - Audio: 16MB
   - Video: 16MB
   - Documents: 100MB`,
              },
            },
          ],
        };
      }
    }
  );

  // Prompt for registration help
  server.prompt(
    'help_with_registration',
    {
      action: z.enum(['register', 'deregister', 'verify']),
    },
    params => {
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
                text: `To register a phone number with WhatsApp Business API, you can use the \`whatsapp_register_phone_number\` tool. You need to provide a 6-digit PIN for two-step verification.

Example:
\`\`\`
Tool name: whatsapp_register_phone_number
Input: {
  "pin": "123456"
}
\`\`\`

The registration process:
1. Make sure two-step verification is enabled on your Facebook account
2. Submit the registration request with your PIN
3. After registration is complete, you may need to verify the phone number

You can check the registration status using the \`whatsapp_check_registration_status\` tool.

Important notes:
- If you're using a number that was previously used with WhatsApp or WhatsApp Business app, you need to delete that account first
- Once a number is registered with the WhatsApp Business API, it cannot be used with the regular WhatsApp or WhatsApp Business apps`,
              },
            },
          ],
        };
      } else if (params.action === 'deregister') {
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
                text: `To deregister a phone number from WhatsApp Business API, you can use the \`whatsapp_deregister_phone_number\` tool.

Example:
\`\`\`
Tool name: whatsapp_deregister_phone_number
Input: {}
\`\`\`

Important notes:
1. Deregistering a phone number is irreversible
2. After deregistering, you'll need to go through the registration process again if you want to use this phone number with WhatsApp Business API
3. Any conversations, message history, and settings associated with this number will be lost
4. After deregistration, there may be a cooling period before the number can be registered again`,
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
                text: `How can I verify a phone number with WhatsApp Business API?`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `To verify a phone number with WhatsApp Business API, you first need to receive a verification code and then use the \`whatsapp_verify_phone_number\` tool.

First, request a verification code:
\`\`\`
Tool name: whatsapp_request_verification_code
Input: {
  "code_method": "SMS",
  "locale": "en_US"
}
\`\`\`

Once you receive the verification code, submit it:
\`\`\`
Tool name: whatsapp_verify_phone_number
Input: {
  "code": "123456"
}
\`\`\`

The verification process:
1. Request a verification code via SMS or voice call
2. Receive the code on the phone number you're verifying
3. Submit the code to complete verification

You can check the verification status using the \`whatsapp_check_registration_status\` tool.`,
              },
            },
          ],
        };
      }
    }
  );

  // Prompt for two-step verification help
  server.prompt(
    'help_with_two_step_verification',
    {
      action: z.enum(['enable', 'disable']),
    },
    params => {
      if (params.action === 'enable') {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `How can I enable two-step verification for my WhatsApp Business API account?`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `To enable two-step verification for your WhatsApp Business API account, you can use the \`whatsapp_enable_two_step_verification\` tool. You need to provide a 6-digit PIN.

Example:
\`\`\`
Tool name: whatsapp_enable_two_step_verification
Input: {
  "pin": "123456"
}
\`\`\`

Important notes:
1. The PIN should be a secure 6-digit code that you can remember
2. This PIN will be required when registering your phone number with WhatsApp Business API
3. Two-step verification adds an extra layer of security to your account
4. Keep your PIN secure and don't share it with others
5. You may need to have two-factor authentication enabled on your Facebook account as well`,
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
                text: `How can I disable two-step verification for my WhatsApp Business API account?`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `To disable two-step verification for your WhatsApp Business API account, you can use the \`whatsapp_disable_two_step_verification\` tool.

Example:
\`\`\`
Tool name: whatsapp_disable_two_step_verification
Input: {}
\`\`\`

Important notes:
1. Disabling two-step verification reduces the security of your account
2. After disabling, you won't need to enter a PIN when re-registering your phone number
3. It's generally recommended to keep two-step verification enabled for security
4. If you're experiencing issues with two-step verification, consider changing your PIN instead of disabling it entirely`,
              },
            },
          ],
        };
      }
    }
  );

  // General help prompt for WhatsApp API
  server.prompt('help_with_whatsapp_api', {}, () => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `What can I do with the WhatsApp Cloud Business API?`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `The WhatsApp Cloud Business API offers several capabilities:

**Business Profile Management**
- View your business profile information
- Update details like about, description, email, websites, and industry vertical

**Messaging**
- Send text messages to customers
- Use pre-approved templates for business-initiated conversations
- Send media messages (images, audio, video, documents, stickers)
- Mark messages as read

**Phone Number Management**
- Register phone numbers with WhatsApp Business API
- Verify phone numbers
- Deregister phone numbers
- Check registration status

**Two-Step Verification**
- Enable two-step verification with a PIN
- Disable two-step verification

**Templates Management**
- List available message templates
- Use templates for outbound messaging

To get specific help with any of these areas, you can use one of the following prompts:
- help_with_business_profile
- help_with_messaging
- help_with_registration
- help_with_two_step_verification

You can also browse the resources available:
- whatsapp://business_profile
- whatsapp://templates`,
          },
        },
      ],
    };
  });
}
