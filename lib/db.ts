import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 从环境变量获取数据库连接字符串
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// 创建 PostgreSQL 连接池
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

export { pool };

// 初始化数据库表
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // 创建文件信息表
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_info (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name VARCHAR(255) NOT NULL,
        share_code VARCHAR(10) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('blob', 'externalLink')),
        blob_url TEXT,
        external_url TEXT,
        download_limit INTEGER NOT NULL DEFAULT 10,
        download_count INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMP NOT NULL,
        upload_time TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // 创建索引以提高查询性能
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_file_info_share_code ON file_info(share_code)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_file_info_expires_at ON file_info(expires_at)
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}
