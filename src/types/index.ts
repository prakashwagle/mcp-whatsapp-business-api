// Business Profile Types
export interface BusinessProfile {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  websites?: string[];
  vertical?: string;
}

// Message Types
export interface TextMessage {
  to: string;
  text: string;
  preview_url?: boolean;
}

export interface TemplateMessage {
  to: string;
  template_name: string;
  language: {
    code: string;
  };
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: TemplateParameter[];
}

export type TemplateParameter = 
  | { type: 'text'; text: string }
  | { type: 'currency'; currency: { code: string; amount: number } }
  | { type: 'date_time'; date_time: { fallback_value: string } }
  | { type: 'image'; image: { link: string } }
  | { type: 'document'; document: { link: string } }
  | { type: 'video'; video: { link: string } };

// Phone Number Types
export interface PhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: string;
  code_verification_status: string;
}

// Registration Types
export interface RegistrationResult {
  success: boolean;
  message: string;
}

// Two-Step Verification Types
export interface TwoStepVerificationResult {
  success: boolean;
  message: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}