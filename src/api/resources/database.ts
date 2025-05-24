// src/api/resources/database.ts
import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatabaseClient } from '../../utils/database.js';

export function setupDatabaseResources(
  server: McpServer,
  dbClient: DatabaseClient
) {
  // Resource for listing all tables
  server.resource(
    'database_tables',
    new ResourceTemplate('postgres://tables', {
      list: undefined,
    }),
    async uri => {
      try {
        const tables = await dbClient.getTablesList();

        let formattedTables = 'PostgreSQL Database Tables:\n';
        formattedTables += '=============================\n\n';

        if (tables.length === 0) {
          formattedTables += 'No tables found in the database.';
        } else {
          tables.forEach((table, index) => {
            formattedTables += `${index + 1}. ${table}\n`;
          });
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: formattedTables,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving database tables: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Resource for table schema information
  server.resource(
    'table_schema',
    new ResourceTemplate('postgres://tables/{table_name}/schema', {
      list: undefined,
    }),
    async (uri, params) => {
      try {
        const table_name = Array.isArray(params.table_name)
          ? params.table_name[0]
          : params.table_name;
        const schema = await dbClient.getTableSchema(table_name);

        let formattedSchema = `Schema for table: ${table_name}\n`;
        formattedSchema += '================================\n\n';

        if (schema.length === 0) {
          formattedSchema += `Table "${table_name}" not found or has no columns.`;
        } else {
          formattedSchema += 'Columns:\n';
          formattedSchema += '--------\n';

          schema.forEach(column => {
            formattedSchema += `• ${column.column_name}\n`;
            formattedSchema += `  Type: ${column.data_type}`;
            if (column.character_maximum_length) {
              formattedSchema += `(${column.character_maximum_length})`;
            }
            formattedSchema += `\n`;
            formattedSchema += `  Nullable: ${column.is_nullable}\n`;
            if (column.column_default) {
              formattedSchema += `  Default: ${column.column_default}\n`;
            }
            formattedSchema += `\n`;
          });
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: formattedSchema,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving schema for table: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Resource for table data preview
  server.resource(
    'table_data',
    new ResourceTemplate('postgres://tables/{table_name}/data', {
      list: undefined,
    }),
    async (uri, params) => {
      try {
        const table_name = Array.isArray(params.table_name)
          ? params.table_name[0]
          : params.table_name;
        // Get first 10 rows from the table
        const result = await dbClient.query(
          `SELECT * FROM "${table_name}" LIMIT 10`
        );

        let formattedData = `Data preview for table: ${table_name}\n`;
        formattedData += '==================================\n\n';

        if (result.rows.length === 0) {
          formattedData += `Table "${table_name}" is empty or doesn't exist.`;
        } else {
          formattedData += `Showing first ${result.rows.length} rows:\n\n`;
          formattedData += JSON.stringify(result.rows, null, 2);
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: formattedData,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error retrieving data from table: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Resource for database connection status
  server.resource(
    'database_status',
    new ResourceTemplate('postgres://status', {
      list: undefined,
    }),
    async uri => {
      try {
        const isConnected = await dbClient.testConnection();

        let statusInfo = 'PostgreSQL Database Status:\n';
        statusInfo += '===========================\n\n';
        statusInfo += `Connection Status: ${isConnected ? '✅ Connected' : '❌ Disconnected'}\n`;

        if (isConnected) {
          const tables = await dbClient.getTablesList();
          statusInfo += `Total Tables: ${tables.length}\n`;
          statusInfo += `Available Tables: ${tables.join(', ') || 'None'}\n`;
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: statusInfo,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error checking database status: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
