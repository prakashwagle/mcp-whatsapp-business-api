// src/utils/error-handler.ts
import { AxiosError } from 'axios';

export interface ErrorResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

/**
 * Formats API errors with detailed information
 */
export function formatApiError(error: any, operation: string): ErrorResponse {
  let errorMessage = `Error ${operation}`;

  if (error instanceof AxiosError) {
    // Handle Axios errors with detailed WhatsApp API error info
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      errorMessage += `:\n• Code: ${apiError.code || 'Unknown'}\n• Message: ${apiError.message || 'Unknown error'}\n• Type: ${apiError.type || 'Unknown'}`;

      if (apiError.error_data?.details) {
        errorMessage += `\n• Details: ${apiError.error_data.details}`;
      }

      if (apiError.fbtrace_id) {
        errorMessage += `\n• Trace ID: ${apiError.fbtrace_id}`;
      }
    } else if (error.response) {
      errorMessage += `:\n• Status: ${error.response.status}\n• Message: ${error.response.statusText}`;
      if (error.response.data) {
        errorMessage += `\n• Data: ${JSON.stringify(error.response.data, null, 2)}`;
      }
    } else if (error.request) {
      errorMessage += ': No response received from WhatsApp API';
    } else {
      errorMessage += `: ${error.message}`;
    }
  } else if (error instanceof Error) {
    errorMessage += `: ${error.message}`;
  } else {
    errorMessage += `: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: errorMessage,
      },
    ],
  };
}

/**
 * Formats success responses consistently
 */
export function formatSuccessResponse(data: any, operation: string): any {
  return {
    content: [
      {
        type: 'text',
        text: `${operation} successful:\n${JSON.stringify(data, null, 2)}`,
      },
    ],
  };
}

/**
 * Validates required parameters
 */
export function validateRequiredParams(
  params: Record<string, any>,
  requiredFields: string[]
): string | null {
  const missing = requiredFields.filter(field => !params[field]);
  if (missing.length > 0) {
    return `Missing required parameters: ${missing.join(', ')}`;
  }
  return null;
}
