// 使用PostgreSQL数据库存储文件元数据
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// 从环境变量获取数据库连接字符串
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// 创建 PostgreSQL 连接池
const dbPool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// 定义文件信息的数据结构
export interface FileInfo {
  id: string;
  fileName: string;
  shareCode: string;
  type: 'blob' | 'externalLink';
  blobUrl?: string;
  externalUrl?: string;
  downloadLimit: number;
  downloadCount: number;
  expiresAt: string; // ISO string format
  uploadTime: string; // ISO string format
}

// 初始化数据库表
async function initializeDatabase() {
  const client = await dbPool.connect();
  
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

// 读取所有文件信息
export async function getAllFiles(): Promise<FileInfo[]> {
  const client = await dbPool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM file_info ORDER BY upload_time DESC'
    );
    
    return result.rows.map(row => ({
      id: row.id,
      fileName: row.file_name,
      shareCode: row.share_code,
      type: row.type,
      blobUrl: row.blob_url,
      externalUrl: row.external_url,
      downloadLimit: row.download_limit,
      downloadCount: row.download_count,
      expiresAt: row.expires_at.toISOString(),
      uploadTime: row.upload_time.toISOString()
    }));
  } finally {
    client.release();
  }
}

// 根据分享码查找文件
export async function getFileByShareCode(shareCode: string): Promise<FileInfo | undefined> {
  const client = await dbPool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM file_info WHERE share_code = $1',
      [shareCode]
    );
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      fileName: row.file_name,
      shareCode: row.share_code,
      type: row.type,
      blobUrl: row.blob_url,
      externalUrl: row.external_url,
      downloadLimit: row.download_limit,
      downloadCount: row.download_count,
      expiresAt: row.expires_at.toISOString(),
      uploadTime: row.upload_time.toISOString()
    };
  } finally {
    client.release();
  }
}

// 根据ID查找文件
export async function getFileById(id: string): Promise<FileInfo | undefined> {
  const client = await dbPool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM file_info WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      fileName: row.file_name,
      shareCode: row.share_code,
      type: row.type,
      blobUrl: row.blob_url,
      externalUrl: row.external_url,
      downloadLimit: row.download_limit,
      downloadCount: row.download_count,
      expiresAt: row.expires_at.toISOString(),
      uploadTime: row.upload_time.toISOString()
    };
  } finally {
    client.release();
  }
}

// 保存文件信息
export async function saveFile(fileInfo: FileInfo) {
  const client = await dbPool.connect();
  
  try {
    await client.query(
      `INSERT INTO file_info (
        id, file_name, share_code, type, blob_url, external_url, 
        download_limit, download_count, expires_at, upload_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        fileInfo.id,
        fileInfo.fileName,
        fileInfo.shareCode,
        fileInfo.type,
        fileInfo.blobUrl,
        fileInfo.externalUrl,
        fileInfo.downloadLimit,
        fileInfo.downloadCount,
        new Date(fileInfo.expiresAt),
        new Date(fileInfo.uploadTime)
      ]
    );
  } finally {
    client.release();
  }
}

// 更新文件信息
export async function updateFile(id: string, updates: Partial<FileInfo>) {
  const client = await dbPool.connect();
  
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;
    
    // 构建更新字段
    if (updates.fileName !== undefined) {
      fields.push(`file_name = $${index++}`);
      values.push(updates.fileName);
    }
    
    if (updates.shareCode !== undefined) {
      fields.push(`share_code = $${index++}`);
      values.push(updates.shareCode);
    }
    
    if (updates.type !== undefined) {
      fields.push(`type = $${index++}`);
      values.push(updates.type);
    }
    
    if (updates.blobUrl !== undefined) {
      fields.push(`blob_url = $${index++}`);
      values.push(updates.blobUrl);
    }
    
    if (updates.externalUrl !== undefined) {
      fields.push(`external_url = $${index++}`);
      values.push(updates.externalUrl);
    }
    
    if (updates.downloadLimit !== undefined) {
      fields.push(`download_limit = $${index++}`);
      values.push(updates.downloadLimit);
    }
    
    if (updates.downloadCount !== undefined) {
      fields.push(`download_count = $${index++}`);
      values.push(updates.downloadCount);
    }
    
    if (updates.expiresAt !== undefined) {
      fields.push(`expires_at = $${index++}`);
      values.push(new Date(updates.expiresAt));
    }
    
    if (fields.length === 0) {
      return false; // 没有要更新的字段
    }
    
    values.push(id); // 为WHERE子句添加ID
    
    const query = `UPDATE file_info SET ${fields.join(', ')} WHERE id = $${index}`;
    
    const result = await client.query(query, values);
    return (result.rowCount || 0) > 0;
  } finally {
    client.release();
  }
}

// 删除文件信息
export async function deleteFile(id: string) {
  const client = await dbPool.connect();
  
  try {
    const result = await client.query(
      'DELETE FROM file_info WHERE id = $1',
      [id]
    );
    
    return (result.rowCount || 0) > 0;
  } finally {
    client.release();
  }
}

// 生成唯一的5位数字分享码
export async function generateUniqueShareCode(): Promise<string> {
  const client = await dbPool.connect();
  
  try {
    let shareCode: string;
    let isUnique = false;
    
    do {
      // 生成5位随机数字
      shareCode = Math.floor(10000 + Math.random() * 90000).toString();
      
      // 检查是否唯一
      const result = await client.query(
        'SELECT 1 FROM file_info WHERE share_code = $1',
        [shareCode]
      );
      
      isUnique = result.rows.length === 0;
    } while (!isUnique);
    
    return shareCode;
  } finally {
    client.release();
  }
}

// 初始化数据库
export async function initDatabase() {
  await initializeDatabase();
}