'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import BounceLoader from '@/components/BounceLoader';
import AlertModal from '@/components/AlertModal';
import { FileInfo } from '@/lib/datastore';

export default function DownloadPage() {
  const params = useParams();
  const code = params?.code as string;

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const searchParams = useSearchParams();
  const _download = searchParams.get('download'); // 添加下划线前缀表示故意不使用

  useEffect(() => {
    const fetchFileInfo = async () => {
      if (!code) {
        setError('无效的分享码');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/file/${code}`);
        const data = await response.json();

        if (response.ok) {
          setFileInfo(data);
        } else {
          setError(data.error || '文件未找到');
        }
      } catch (_err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [code]);

  const handleDownload = async () => {
  if (!fileInfo || !code) return;

    try {
      setIsDownloading(true);
      
      // 请求下载，增加下载计数
      const response = await fetch(`/api/file/${code}/download`, {
        method: 'POST',
      });

  if (response.ok) {
        const data = await response.json();
        const downloadUrl = data.downloadUrl;
        
        // 触发下载
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileInfo.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 更新本地的下载次数
        setFileInfo((prev) => ({
          ...prev!,
          downloadCount: (prev?.downloadCount ?? 0) + 1
        }));
      } else {
        const data = await response.json();
        setError(data.error || '下载失败');
      }
    } catch (_err) {
      setError('下载失败，请稍后重试');
    } finally {
      setIsDownloading(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-80">
          <BounceLoader message="正在加载文件信息..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">错误</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link 
            href="/" 
            className="inline-block bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = fileInfo ? new Date(fileInfo.expiresAt) < new Date() : false;
  // 移除了未使用的变量 isDownloadLimitReached
  // const isDownloadLimitReached = fileInfo ? (fileInfo.downloadCount ?? 0) >= (fileInfo.downloadLimit ?? Infinity) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">文件下载</h1>
            <p className="text-slate-600">通过分享码获取文件</p>
          </div>
          
          <div className="border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">文件信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">文件名</p>
                <p className="font-medium truncate">{fileInfo?.fileName}</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">文件类型</p>
                <p className="font-medium">
                  {fileInfo?.type === 'blob' ? '上传文件' : '外部链接'}
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">剩余下载次数</p>
                <p className="font-medium">
                  <span className={(fileInfo?.downloadLimit ?? 0) - (fileInfo?.downloadCount ?? 0) === 0 ? 'text-red-500' : 'text-green-500'}>
                    {(fileInfo?.downloadLimit ?? 0) - (fileInfo?.downloadCount ?? 0)}
                  </span> / {fileInfo?.downloadLimit}
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">过期时间</p>
                <p className="font-medium">
                  {fileInfo ? new Date(fileInfo.expiresAt).toLocaleString('zh-CN') : ''}
                </p>
              </div>
            </div>
            
            {isExpired ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                文件已过期
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                下载文件
              </button>
            )}
          </div>
          
          <div className="text-center">
            <Link 
              href="/" 
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              返回首页
            </Link>
          </div>
        </div>
      </div>
      
      {showConfirmModal && fileInfo && (
        <AlertModal
          title="确认下载"
          body={`您确定要下载文件 "${fileInfo.fileName}" 吗？下载后剩余次数将减少1次。`}
          confirmText="确认下载"
          cancelText="取消"
          type="confirm"
          onConfirm={handleDownload}
          onClose={() => setShowConfirmModal(false)}
        />
      )}
      
      {isDownloading && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-80">
            <BounceLoader message="文件下载中..." />
          </div>
        </div>
      )}
    </div>
  );
}