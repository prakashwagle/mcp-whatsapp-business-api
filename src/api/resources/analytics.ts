// src/api/resources/analytics.ts
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { WhatsAppApiClient } from '../../utils/api-client.js';

export function setupAnalyticsResources(
  server: McpServer,
  apiClient: WhatsAppApiClient
) {
  // Resource: Messaging Analytics (messages sent and delivered)
  server.resource(
    'messaging_analytics',
    new ResourceTemplate('whatsapp://analytics/messaging', {
      list: undefined,
    }),
    async uri => {
      try {
        // Get last 30 days by default
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 30 * 24 * 60 * 60; // 30 days ago

        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/insights?` +
            `metric=messages_sent,messages_delivered&` +
            `start=${startTime}&` +
            `end=${endTime}&` +
            `granularity=DAILY`
        );

        let analyticsData = 'WhatsApp Messaging Analytics (Last 30 Days):\n';
        analyticsData += '==============================================\n\n';

        if (response.data && response.data.data) {
          const data = response.data.data;

          if (data.length === 0) {
            analyticsData +=
              'No messaging data available for the selected period.';
          } else {
            analyticsData += 'Daily Messaging Statistics:\n';
            analyticsData += '--------------------------\n\n';

            data.forEach((dataPoint: any) => {
              const date = new Date(dataPoint.start_time * 1000).toDateString();
              analyticsData += `📅 ${date}\n`;

              dataPoint.values.forEach((value: any) => {
                const metricName =
                  value.name === 'messages_sent'
                    ? 'Messages Sent'
                    : 'Messages Delivered';
                analyticsData += `   ${metricName}: ${value.value || 0}\n`;
              });
              analyticsData += '\n';
            });
          }
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: analyticsData,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving messaging analytics: ${error.response?.data?.error?.message || error.message}`,
            },
          ],
        };
      }
    }
  );

  // Resource: Conversation Analytics (conversation count and cost)
  server.resource(
    'conversation_analytics',
    new ResourceTemplate('whatsapp://analytics/conversations', {
      list: undefined,
    }),
    async uri => {
      try {
        // Get last 30 days by default
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 30 * 24 * 60 * 60; // 30 days ago

        const response = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/insights?` +
            `metric=conversation_count,conversation_cost&` +
            `start=${startTime}&` +
            `end=${endTime}&` +
            `granularity=DAILY`
        );

        let analyticsData = 'WhatsApp Conversation Analytics (Last 30 Days):\n';
        analyticsData += '================================================\n\n';

        if (response.data && response.data.data) {
          const data = response.data.data;

          if (data.length === 0) {
            analyticsData +=
              'No conversation data available for the selected period.';
          } else {
            analyticsData += 'Daily Conversation Statistics:\n';
            analyticsData += '-----------------------------\n\n';

            let totalConversations = 0;
            let totalCost = 0;

            data.forEach((dataPoint: any) => {
              const date = new Date(dataPoint.start_time * 1000).toDateString();
              analyticsData += `📅 ${date}\n`;

              dataPoint.values.forEach((value: any) => {
                if (value.name === 'conversation_count') {
                  const count = value.value || 0;
                  totalConversations += count;
                  analyticsData += `   Conversations: ${count}\n`;
                } else if (value.name === 'conversation_cost') {
                  const cost = value.value || 0;
                  totalCost += cost;
                  analyticsData += `   Cost: $${(cost / 100).toFixed(4)} USD\n`; // Cost is in cents
                }
              });
              analyticsData += '\n';
            });

            analyticsData += `📊 Summary (30 days):\n`;
            analyticsData += `   Total Conversations: ${totalConversations}\n`;
            analyticsData += `   Total Cost: $${(totalCost / 100).toFixed(2)} USD\n`;
            if (totalConversations > 0) {
              analyticsData += `   Average Cost per Conversation: $${(totalCost / totalConversations / 100).toFixed(4)} USD\n`;
            }
          }
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: analyticsData,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving conversation analytics: ${error.response?.data?.error?.message || error.message}`,
            },
          ],
        };
      }
    }
  );

  // Resource: Template Analytics (template performance metrics)
  server.resource(
    'template_analytics',
    new ResourceTemplate('whatsapp://analytics/templates', {
      list: undefined,
    }),
    async uri => {
      try {
        // Get last 30 days by default (limited to 90 days lookback)
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 30 * 24 * 60 * 60; // 30 days ago

        // First, get templates to analyze
        const templatesResponse = await apiClient.get(
          `${apiClient.getBusinessAccountEndpoint()}/message_templates?fields=name,id,status&limit=10`
        );

        let analyticsData = 'WhatsApp Template Analytics (Last 30 Days):\n';
        analyticsData += '=============================================\n\n';

        if (
          templatesResponse.data &&
          templatesResponse.data.data &&
          templatesResponse.data.data.length > 0
        ) {
          const templates = templatesResponse.data.data.slice(0, 10); // Limit to 10 templates
          const templateIds = templates.map((t: any) => t.id).join(',');

          try {
            const analyticsResponse = await apiClient.get(
              `${apiClient.getBusinessAccountEndpoint()}/insights?` +
                `metric=template_sent,template_delivered,template_read,template_button_clicks&` +
                `start=${startTime}&` +
                `end=${endTime}&` +
                `granularity=DAILY&` +
                `template_ids=[${templateIds}]`
            );

            if (analyticsResponse.data && analyticsResponse.data.data) {
              const data = analyticsResponse.data.data;

              if (data.length === 0) {
                analyticsData +=
                  'No template analytics data available for the selected period.';
              } else {
                analyticsData += 'Template Performance Summary:\n';
                analyticsData += '----------------------------\n\n';

                // Group data by template
                const templateMetrics: { [key: string]: any } = {};

                data.forEach((dataPoint: any) => {
                  dataPoint.values.forEach((value: any) => {
                    const templateId = value.template_id || 'unknown';
                    if (!templateMetrics[templateId]) {
                      templateMetrics[templateId] = {
                        sent: 0,
                        delivered: 0,
                        read: 0,
                        clicks: 0,
                      };
                    }

                    switch (value.name) {
                      case 'template_sent':
                        templateMetrics[templateId].sent += value.value || 0;
                        break;
                      case 'template_delivered':
                        templateMetrics[templateId].delivered +=
                          value.value || 0;
                        break;
                      case 'template_read':
                        templateMetrics[templateId].read += value.value || 0;
                        break;
                      case 'template_button_clicks':
                        templateMetrics[templateId].clicks += value.value || 0;
                        break;
                    }
                  });
                });

                // Display metrics for each template
                Object.entries(templateMetrics).forEach(
                  ([templateId, metrics]) => {
                    const template = templates.find(
                      (t: any) => t.id === templateId
                    );
                    const templateName = template
                      ? template.name
                      : `Template ${templateId}`;

                    analyticsData += `📋 ${templateName} (${template?.status || 'Unknown'})\n`;
                    analyticsData += `   Messages Sent: ${metrics.sent}\n`;
                    analyticsData += `   Messages Delivered: ${metrics.delivered}\n`;
                    analyticsData += `   Messages Read: ${metrics.read}\n`;
                    analyticsData += `   Button Clicks: ${metrics.clicks}\n`;

                    if (metrics.sent > 0) {
                      analyticsData += `   Delivery Rate: ${((metrics.delivered / metrics.sent) * 100).toFixed(1)}%\n`;
                      if (metrics.delivered > 0) {
                        analyticsData += `   Read Rate: ${((metrics.read / metrics.delivered) * 100).toFixed(1)}%\n`;
                      }
                      if (metrics.clicks > 0) {
                        analyticsData += `   Click Rate: ${((metrics.clicks / metrics.sent) * 100).toFixed(1)}%\n`;
                      }
                    }
                    analyticsData += '\n';
                  }
                );
              }
            }
          } catch (analyticsError: any) {
            analyticsData += `Template analytics not available: ${analyticsError.response?.data?.error?.message || analyticsError.message}\n`;
            analyticsData +=
              'Note: Template analytics require specific permissions and may not be available for all accounts.\n\n';

            // Still show template list
            analyticsData += 'Available Templates:\n';
            analyticsData += '-------------------\n';
            templates.forEach((template: any) => {
              analyticsData += `📋 ${template.name} (${template.status})\n`;
            });
          }
        } else {
          analyticsData += 'No message templates found in your account.';
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: analyticsData,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving template analytics: ${error.response?.data?.error?.message || error.message}`,
            },
          ],
        };
      }
    }
  );

  // Resource: Analytics Summary (overview of all metrics)
  server.resource(
    'analytics_summary',
    new ResourceTemplate('whatsapp://analytics/summary', {
      list: undefined,
    }),
    async uri => {
      try {
        // Get last 7 days for summary
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 7 * 24 * 60 * 60; // 7 days ago

        let summaryData =
          'WhatsApp Business Analytics Summary (Last 7 Days):\n';
        summaryData +=
          '====================================================\n\n';

        try {
          // Get messaging analytics
          const messagingResponse = await apiClient.get(
            `${apiClient.getBusinessAccountEndpoint()}/insights?` +
              `metric=messages_sent,messages_delivered&` +
              `start=${startTime}&` +
              `end=${endTime}&` +
              `granularity=DAILY`
          );

          if (messagingResponse.data && messagingResponse.data.data) {
            let totalSent = 0;
            let totalDelivered = 0;

            messagingResponse.data.data.forEach((dataPoint: any) => {
              dataPoint.values.forEach((value: any) => {
                if (value.name === 'messages_sent') {
                  totalSent += value.value || 0;
                } else if (value.name === 'messages_delivered') {
                  totalDelivered += value.value || 0;
                }
              });
            });

            summaryData += '📨 Messaging Overview:\n';
            summaryData += `   Messages Sent: ${totalSent}\n`;
            summaryData += `   Messages Delivered: ${totalDelivered}\n`;
            summaryData += `   Delivery Rate: ${totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0'}%\n\n`;
          }

          // Get conversation analytics
          const conversationResponse = await apiClient.get(
            `${apiClient.getBusinessAccountEndpoint()}/insights?` +
              `metric=conversation_count,conversation_cost&` +
              `start=${startTime}&` +
              `end=${endTime}&` +
              `granularity=DAILY`
          );

          if (conversationResponse.data && conversationResponse.data.data) {
            let totalConversations = 0;
            let totalCost = 0;

            conversationResponse.data.data.forEach((dataPoint: any) => {
              dataPoint.values.forEach((value: any) => {
                if (value.name === 'conversation_count') {
                  totalConversations += value.value || 0;
                } else if (value.name === 'conversation_cost') {
                  totalCost += value.value || 0;
                }
              });
            });

            summaryData += '💬 Conversation Overview:\n';
            summaryData += `   Total Conversations: ${totalConversations}\n`;
            summaryData += `   Total Cost: $${(totalCost / 100).toFixed(2)} USD\n`;
            if (totalConversations > 0) {
              summaryData += `   Average Cost per Conversation: $${(totalCost / totalConversations / 100).toFixed(4)} USD\n`;
            }
            summaryData += '\n';
          }

          summaryData += '📊 Available Analytics Resources:\n';
          summaryData +=
            '   • whatsapp://analytics/messaging - Detailed messaging analytics\n';
          summaryData +=
            '   • whatsapp://analytics/conversations - Conversation analytics\n';
          summaryData +=
            '   • whatsapp://analytics/templates - Template performance\n';
          summaryData += '   • whatsapp://analytics/summary - This overview\n';
        } catch (error: any) {
          summaryData += `Analytics data temporarily unavailable: ${error.response?.data?.error?.message || error.message}\n`;
          summaryData +=
            'This may be due to insufficient permissions or account limitations.\n';
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: summaryData,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving analytics summary: ${error.response?.data?.error?.message || error.message}`,
            },
          ],
        };
      }
    }
  );
}
