import { put } from '@vercel/blob';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateUniqueShareCode, saveFile } from '@/lib/datastore';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const externalUrl = formData.get('externalUrl') as string | null;
    const downloadLimit = parseInt(formData.get('downloadLimit') as string) || 10;
    const expiresAt = formData.get('expiresAt') as string || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 默认7天后过期

    // 检查是否提供了文件或链接
    if (!file && !externalUrl) {
      return Response.json({ error: '请选择文件或提供外部链接' }, { status: 400 });
    }

    let fileInfo: any = {
      id: uuidv4(),
      fileName: '',
      shareCode: await generateUniqueShareCode(),
      type: 'blob' as const,
      downloadLimit,
      downloadCount: 0,
      expiresAt,
      uploadTime: new Date().toISOString(),
    };

    if (file) {
      // 处理文件上传
      const blob = await put(file.name, file, {
        access: 'public',
      });

      fileInfo.fileName = file.name;
      fileInfo.blobUrl = blob.url;
    } else if (externalUrl) {
      // 处理外部链接
      fileInfo.type = 'externalLink' as const;
      fileInfo.fileName = new URL(externalUrl).pathname.split('/').pop() || 'external-file';
      fileInfo.externalUrl = externalUrl;
    }

    // 保存文件信息到数据库
    await saveFile(fileInfo);

    return Response.json({ 
      shareCode: fileInfo.shareCode,
      message: '上传成功' 
    });
  } catch (error) {
    console.error('上传错误:', error);
    return Response.json({ error: '上传失败，请稍后重试' }, { status: 500 });
  }
}

export const runtime = 'edge';