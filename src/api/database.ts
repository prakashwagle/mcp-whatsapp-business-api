// src/api/database.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DatabaseClient } from '../utils/database.js';

// Define schema for SQL query execution
const ExecuteQuerySchema = z.object({
  query: z.string(),
  params: z.array(z.any()).optional(),
});

// Define schema for table data insertion
const InsertDataSchema = z.object({
  table_name: z.string(),
  data: z.record(z.any()),
});

// Define schema for table data update
const UpdateDataSchema = z.object({
  table_name: z.string(),
  data: z.record(z.any()),
  where_clause: z.string(),
  where_params: z.array(z.any()).optional(),
});

// Define schema for table data deletion
const DeleteDataSchema = z.object({
  table_name: z.string(),
  where_clause: z.string(),
  where_params: z.array(z.any()).optional(),
});

export function setupDatabaseTools(
  server: McpServer,
  dbClient: DatabaseClient
) {
  // Tool: Execute SQL Query
  server.tool(
    'postgres_execute_query',
    ExecuteQuerySchema.shape,
    async params => {
      try {
        const result = await dbClient.query(params.query, params.params);

        return {
          content: [
            {
              type: 'text',
              text: `Query executed successfully:\n\nRows affected: ${result.rowCount}\nReturned rows: ${result.rows.length}\n\nResult:\n${JSON.stringify(result.rows, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing query: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Tool: Insert Data into Table
  server.tool('postgres_insert_data', InsertDataSchema.shape, async params => {
    try {
      const columns = Object.keys(params.data);
      const values = Object.values(params.data);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

      const query = `INSERT INTO "${params.table_name}" (${columns.map(col => `"${col}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await dbClient.query(query, values);

      return {
        content: [
          {
            type: 'text',
            text: `Data inserted successfully into table "${params.table_name}":\n\n${JSON.stringify(result.rows[0], null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error inserting data into table "${params.table_name}": ${error.message}`,
          },
        ],
      };
    }
  });

  // Tool: Update Data in Table
  server.tool('postgres_update_data', UpdateDataSchema.shape, async params => {
    try {
      const columns = Object.keys(params.data);
      const values = Object.values(params.data);

      const setClause = columns
        .map((col, index) => `"${col}" = $${index + 1}`)
        .join(', ');
      const whereParams = params.where_params || [];

      const query = `UPDATE "${params.table_name}" SET ${setClause} WHERE ${params.where_clause} RETURNING *`;
      const allParams = [...values, ...whereParams];

      const result = await dbClient.query(query, allParams);

      return {
        content: [
          {
            type: 'text',
            text: `Data updated successfully in table "${params.table_name}":\n\nRows affected: ${result.rowCount}\n\nUpdated rows:\n${JSON.stringify(result.rows, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating data in table "${params.table_name}": ${error.message}`,
          },
        ],
      };
    }
  });

  // Tool: Delete Data from Table
  server.tool('postgres_delete_data', DeleteDataSchema.shape, async params => {
    try {
      const query = `DELETE FROM "${params.table_name}" WHERE ${params.where_clause} RETURNING *`;
      const result = await dbClient.query(query, params.where_params);

      return {
        content: [
          {
            type: 'text',
            text: `Data deleted successfully from table "${params.table_name}":\n\nRows deleted: ${result.rowCount}\n\nDeleted rows:\n${JSON.stringify(result.rows, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting data from table "${params.table_name}": ${error.message}`,
          },
        ],
      };
    }
  });

  // Tool: Get Table Information
  server.tool(
    'postgres_get_table_info',
    z.object({ table_name: z.string() }).shape,
    async params => {
      try {
        // Get table schema
        const schema = await dbClient.getTableSchema(params.table_name);

        // Get row count
        const countResult = await dbClient.query(
          `SELECT COUNT(*) as total_rows FROM "${params.table_name}"`
        );
        const totalRows = countResult.rows[0]?.total_rows || 0;

        let tableInfo = `Table Information: ${params.table_name}\n`;
        tableInfo += '=================================\n\n';
        tableInfo += `Total Rows: ${totalRows}\n\n`;
        tableInfo += 'Schema:\n';
        tableInfo += '-------\n';

        schema.forEach(column => {
          tableInfo += `• ${column.column_name}: ${column.data_type}`;
          if (column.character_maximum_length) {
            tableInfo += `(${column.character_maximum_length})`;
          }
          tableInfo += ` - ${column.is_nullable === 'YES' ? 'Nullable' : 'Not Null'}`;
          if (column.column_default) {
            tableInfo += ` - Default: ${column.column_default}`;
          }
          tableInfo += `\n`;
        });

        return {
          content: [
            {
              type: 'text',
              text: tableInfo,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting table information for "${params.table_name}": ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Tool: Test Database Connection
  server.tool('postgres_test_connection', {}, async () => {
    try {
      const isConnected = await dbClient.testConnection();
      const tables = await dbClient.getTablesList();

      return {
        content: [
          {
            type: 'text',
            text: `Database Connection Test:\n\nStatus: ${isConnected ? '✅ Connected' : '❌ Failed'}\nTotal Tables: ${tables.length}\nAvailable Tables: ${tables.join(', ') || 'None'}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error testing database connection: ${error.message}`,
          },
        ],
      };
    }
  });
}
