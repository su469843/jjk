import { NextRequest } from 'next/server';
import { getFileByShareCode, updateFile, initDatabase } from '@/lib/datastore';

// 初始化数据库
initDatabase().catch(console.error);

export async function POST(
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

    // 增加下载计数
    await updateFile(file.id, {
      downloadCount: file.downloadCount + 1
    });

    // 根据文件类型返回相应的下载URL
    const downloadUrl = file.type === 'blob' ? file.blobUrl : file.externalUrl;
    
    if (!downloadUrl) {
      return Response.json({ error: '文件链接无效' }, { status: 500 });
    }

    return Response.json({ 
      downloadUrl,
      message: '获取下载链接成功'
    });
  } catch (error) {
    console.error('下载文件错误:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export const runtime = 'edge';