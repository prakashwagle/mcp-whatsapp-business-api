// Rate limiting utility using Bottleneck library
import Bottleneck from 'bottleneck';
import { eventEmitter } from './event-emitter.js';

export class WhatsAppRateLimiter {
  private limiters: Map<string, Bottleneck> = new Map();

  // WhatsApp Cloud API rate limits (conservative estimates)
  private readonly limits = {
    // Per phone number limits - 80 messages per hour
    messaging: {
      maxConcurrent: 5,
      minTime: 45000, // 45 seconds between requests (80 per hour)
      reservoir: 80,
      reservoirRefreshAmount: 80,
      reservoirRefreshInterval: 60 * 60 * 1000, // 1 hour
    },

    // Template messages - 250 per day
    templates: {
      maxConcurrent: 2,
      minTime: 345600, // ~345 seconds between template messages (250 per day)
      reservoir: 250,
      reservoirRefreshAmount: 250,
      reservoirRefreshInterval: 24 * 60 * 60 * 1000, // 24 hours
    },

    // API endpoints - 100 requests per hour
    api: {
      maxConcurrent: 10,
      minTime: 36000, // 36 seconds between requests (100 per hour)
      reservoir: 100,
      reservoirRefreshAmount: 100,
      reservoirRefreshInterval: 60 * 60 * 1000, // 1 hour
    },

    // Global limit - 1000 requests per hour
    global: {
      maxConcurrent: 20,
      minTime: 3600, // 3.6 seconds between requests (1000 per hour)
      reservoir: 1000,
      reservoirRefreshAmount: 1000,
      reservoirRefreshInterval: 60 * 60 * 1000, // 1 hour
    },
  };

  private getLimiter(
    key: string,
    limitType: keyof typeof this.limits
  ): Bottleneck {
    const limiterKey = `${key}:${limitType}`;

    if (!this.limiters.has(limiterKey)) {
      const config = this.limits[limitType];
      const limiter = new Bottleneck(config);

      // Add event listeners for monitoring
      limiter.on('failed', (error, jobInfo) => {
        eventEmitter.emitError(error, `rate_limiter:${limiterKey}`);
      });

      limiter.on('retry', (error, _jobInfo) => {
        eventEmitter.emitRateLimitHit(limiterKey, 1000); // Default 1 second delay
      });

      this.limiters.set(limiterKey, limiter);
    }

    return this.limiters.get(limiterKey)!;
  }

  async scheduleMessage(
    phoneNumberId: string,
    messageFunction: () => Promise<any>,
    isTemplate: boolean = false
  ): Promise<any> {
    const limitType = isTemplate ? 'templates' : 'messaging';
    const messageLimiter = this.getLimiter(phoneNumberId, limitType);
    const globalLimiter = this.getLimiter('global', 'global');

    // Chain the limiters - message must pass both phone-specific and global limits
    return globalLimiter.schedule(() =>
      messageLimiter.schedule(messageFunction)
    );
  }

  async scheduleApiCall(
    _endpoint: string,
    apiFunction: () => Promise<any>,
    identifier: string = 'global'
  ): Promise<any> {
    const apiLimiter = this.getLimiter(identifier, 'api');
    const globalLimiter = this.getLimiter('global', 'global');

    // Chain the limiters - API call must pass both
    return globalLimiter.schedule(() => apiLimiter.schedule(apiFunction));
  }

  async getRateLimitStatus(phoneNumberId?: string): Promise<any> {
    const globalLimiter = this.limiters.get('global:global');
    const status: any = {
      global: {
        running: globalLimiter?.running() || 0,
        queued: globalLimiter?.queued() || 0,
        reservoir: (await globalLimiter?.currentReservoir()) || 0,
      },
    };

    if (phoneNumberId) {
      const messagingLimiter = this.limiters.get(`${phoneNumberId}:messaging`);
      const templatesLimiter = this.limiters.get(`${phoneNumberId}:templates`);

      status.messaging = {
        running: messagingLimiter?.running() || 0,
        queued: messagingLimiter?.queued() || 0,
        reservoir: (await messagingLimiter?.currentReservoir()) || 0,
      };

      status.templates = {
        running: templatesLimiter?.running() || 0,
        queued: templatesLimiter?.queued() || 0,
        reservoir: (await templatesLimiter?.currentReservoir()) || 0,
      };
    }

    return status;
  }

  // Clean up old limiters periodically
  async cleanup(): Promise<void> {
    for (const [key, limiter] of this.limiters.entries()) {
      // Remove limiters that have no jobs running or queued
      if ((await limiter.running()) === 0 && limiter.queued() === 0) {
        await limiter.stop();
        this.limiters.delete(key);
      }
    }
  }
}

export const rateLimiter = new WhatsAppRateLimiter();

// Clean up old rate limit buckets every hour
if (typeof setInterval !== 'undefined') {
  setInterval(async () => {
    await rateLimiter.cleanup();
  }, 3600000);
}
