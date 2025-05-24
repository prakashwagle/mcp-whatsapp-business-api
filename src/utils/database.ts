// Database utilities and connection management
import { Pool, PoolClient, QueryResult } from 'pg';
import { DatabaseConfig } from './config.js';

export class DatabaseClient {
  private pool: Pool;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
      connectionTimeoutMillis: 2000, // How long to wait for a connection
    });

    // Handle pool errors
    this.pool.on('error', err => {
      console.error('Database pool error:', err);
    });
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  async getTablesList(): Promise<string[]> {
    try {
      const result = await this.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      return result.rows.map(row => row.table_name);
    } catch (error) {
      console.error('Error getting tables list:', error);
      return [];
    }
  }

  async getTableSchema(tableName: string): Promise<any[]> {
    try {
      const result = await this.query(
        `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `,
        [tableName]
      );
      return result.rows;
    } catch (error) {
      console.error(`Error getting schema for table ${tableName}:`, error);
      return [];
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
