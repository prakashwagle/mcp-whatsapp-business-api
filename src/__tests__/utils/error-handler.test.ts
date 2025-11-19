import { describe, it, expect } from 'vitest';
import { formatApiError, formatSuccessResponse, validateRequiredParams } from '../../utils/error-handler.js';
import { AxiosError } from 'axios';

describe('Error Handler Utils', () => {
    describe('formatApiError', () => {
        it('should format standard Error objects', () => {
            const error = new Error('Test error');
            const result = formatApiError(error, 'testing');
            expect(result.content[0].text).toContain('Error testing: Test error');
        });

        it('should format Axios errors with response data', () => {
            const axiosError = new AxiosError('Request failed');
            axiosError.response = {
                data: { error: { message: 'API Error', code: 123, type: 'OAuthException' } },
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config: {} as any,
            };

            const result = formatApiError(axiosError, 'api call');
            expect(result.content[0].text).toContain('Code: 123');
            expect(result.content[0].text).toContain('Message: API Error');
            expect(result.content[0].text).toContain('Type: OAuthException');
        });
    });

    describe('formatSuccessResponse', () => {
        it('should format success data correctly', () => {
            const data = { id: '123' };
            const result = formatSuccessResponse(data, 'creation');
            expect(result.content[0].text).toContain('creation successful');
            expect(result.content[0].text).toContain('"id": "123"');
        });
    });

    describe('validateRequiredParams', () => {
        it('should return null when all params are present', () => {
            const params = { a: 1, b: 2 };
            const result = validateRequiredParams(params, ['a', 'b']);
            expect(result).toBeNull();
        });

        it('should return error message when params are missing', () => {
            const params = { a: 1 };
            const result = validateRequiredParams(params, ['a', 'b']);
            expect(result).toContain('Missing required parameters: b');
        });
    });
});
