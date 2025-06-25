// Rate limiting utility using Bottleneck library
import Bottleneck from 'bottleneck';
import { eventEmitter } from './event-emitter.js';

export class WebhookRateLimiter {
  private limiters: Map<string, Bottleneck> = new Map();

  // Webhook rate limits to prevent abuse
  private readonly limits = {
    // Webhook processing - prevent spam/abuse
    webhook: {
      maxConcurrent: 10,
      minTime: 100, // 100ms between webhook processing
      reservoir: 1000,
      reservoirRefreshAmount: 1000,
      reservoirRefreshInterval: 60 * 60 * 1000, // 1000 webhooks per hour
    },

    // Event broadcasting to prevent SSE overload
    events: {
      maxConcurrent: 50,
      minTime: 50, // 50ms between event broadcasts
      reservoir: 2000,
      reservoirRefreshAmount: 2000,
      reservoirRefreshInterval: 60 * 60 * 1000, // 2000 events per hour
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
      limiter.on('failed', (error, _jobInfo) => {
        eventEmitter.emitError(error, `rate_limiter:${limiterKey}`);
      });

      limiter.on('retry', (_error, _jobInfo) => {
        eventEmitter.emitRateLimitHit(limiterKey, 1000); // Default 1 second delay
      });

      this.limiters.set(limiterKey, limiter);
    }

    return this.limiters.get(limiterKey)!;
  }

  async scheduleWebhook(
    webhookFunction: () => Promise<any>,
    identifier: string = 'default'
  ): Promise<any> {
    const webhookLimiter = this.getLimiter(identifier, 'webhook');
    return webhookLimiter.schedule(webhookFunction);
  }

  async scheduleEvent(
    eventFunction: () => Promise<any>,
    identifier: string = 'default'
  ): Promise<any> {
    const eventLimiter = this.getLimiter(identifier, 'events');
    return eventLimiter.schedule(eventFunction);
  }

  async getRateLimitStatus(): Promise<any> {
    const webhookLimiter = this.limiters.get('default:webhook');
    const eventsLimiter = this.limiters.get('default:events');

    const status: any = {
      webhook: {
        running: webhookLimiter?.running() || 0,
        queued: webhookLimiter?.queued() || 0,
        reservoir: (await webhookLimiter?.currentReservoir()) || 0,
      },
      events: {
        running: eventsLimiter?.running() || 0,
        queued: eventsLimiter?.queued() || 0,
        reservoir: (await eventsLimiter?.currentReservoir()) || 0,
      },
    };

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

export const webhookRateLimiter = new WebhookRateLimiter();

// Clean up old rate limit buckets every hour
if (typeof setInterval !== 'undefined') {
  setInterval(async () => {
    await webhookRateLimiter.cleanup();
  }, 3600000);
}
