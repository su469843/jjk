import { NextRequest } from 'next/server';
import { getFileByShareCode, initDatabase } from '@/lib/datastore';

// 初始化数据库
initDatabase().catch(console.error);

export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const file = await getFileByShareCode(params.code);
    
    if (!file) {
      return Response.json({ error: '文件未找到' }, { status: 404 });
    }

    // 检查是否过期
    if (new Date(file.expiresAt) < new Date()) {
      return Response.json({ error: '文件已过期' }, { status: 410 });
    }

    // 检查下载次数是否已达上限
    if (file.downloadCount >= file.downloadLimit) {
      return Response.json({ error: '下载次数已达上限' }, { status: 429 });
    }

    // 返回文件信息（不包括敏感信息）
    // 移除了未使用的变量 blobUrl 和 externalUrl
    const { blobUrl: _blobUrl, externalUrl: _externalUrl, ...safeFileInfo } = file; // 添加下划线前缀表示故意不使用
    return Response.json(safeFileInfo);
  } catch (error) {
    console.error('获取文件信息错误:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export const runtime = 'edge';