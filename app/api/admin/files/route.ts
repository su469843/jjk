import { NextRequest } from 'next/server';
import { getAllFiles, initDatabase } from '@/lib/datastore';

// 初始化数据库
initDatabase().catch(console.error);

export async function GET(request: NextRequest) {
  try {
    // 注意：在实际生产环境中，这里应该有身份验证检查
    // 例如检查请求头中的认证令牌
    
    const files = await getAllFiles();
    
    // 返回文件列表（不包括敏感信息）
    const safeFiles = files.map(file => {
      const { blobUrl, externalUrl, ...safeFileInfo } = file;
      return safeFileInfo;
    });
    
    return Response.json(safeFiles);
  } catch (error) {
    console.error('获取文件列表错误:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export const runtime = 'edge';