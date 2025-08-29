'use client';

import { useState } from 'react';
import AlertModal from '@/components/AlertModal';
import BounceLoader from '@/components/BounceLoader';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [downloadLimit, setDownloadLimit] = useState(10);
  const [expiresAt, setExpiresAt] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ shareCode: string } | null>(null);
  const [error, setError] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    if (!agreedToTerms) {
      setError('请阅读并同意免责声明');
      setIsUploading(false);
      return;
    }

    // 检查是否提供了文件或链接
    if (!file && !externalUrl) {
      setError('请选择文件或提供外部链接');
      setIsUploading(false);
      return;
    }

    // 准备表单数据
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (externalUrl) {
      formData.append('externalUrl', externalUrl);
    }
    formData.append('downloadLimit', downloadLimit.toString());
    formData.append('expiresAt', expiresAt);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
      } else {
        setError(result.error || '上传失败');
      }
    } catch (_err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setExternalUrl('');
    setDownloadLimit(10);
    setExpiresAt('');
    setAgreedToTerms(false);
    setUploadResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">文件分享柜</h1>
            <p className="text-slate-600">安全、便捷的文件分享服务</p>
          </div>
          
          {uploadResult ? (
            <div className="text-center py-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">上传成功!</h2>
                <p className="text-slate-600 mb-4">您的分享码是:</p>
                <div className="inline-block bg-slate-900 rounded-lg px-6 py-4 mb-4">
                  <p className="text-3xl font-mono font-bold text-white">{uploadResult.shareCode}</p>
                </div>
                <p className="text-slate-500">请保存此分享码，他人可使用此码下载您的文件。</p>
              </div>
              <button
                onClick={resetForm}
                className="bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                上传另一个文件
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors">
                <div className="mb-4 flex justify-center">
                  <svg className="h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col items-center">
                  {file ? (
                    <div className="space-y-2">
                      <p className="font-medium text-slate-900 truncate max-w-xs">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        移除文件
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="cursor-pointer bg-white rounded-lg font-medium text-indigo-600 hover:text-indigo-500">
                        <span>选择文件</span>
                        <input 
                          type="file" 
                          className="sr-only" 
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <p className="mt-2 text-sm text-slate-500">
                        请选择要上传的文件
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">或者提供外部链接</h3>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="downloadLimit" className="block text-sm font-medium text-slate-700 mb-1">
                    下载次数限制
                  </label>
                  <input
                    type="number"
                    id="downloadLimit"
                    min="1"
                    max="1000"
                    value={downloadLimit}
                    onChange={(e) => setDownloadLimit(parseInt(e.target.value) || 10)}
                    className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="expiresAt" className="block text-sm font-medium text-slate-700 mb-1">
                    过期时间
                  </label>
                  <input
                    type="datetime-local"
                    id="expiresAt"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreedToTerms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreedToTerms" className="font-medium text-slate-700">
                    我已阅读并同意 <button 
                      type="button"
                      onClick={() => setShowDisclaimer(true)}
                      className="text-indigo-600 hover:text-indigo-500 underline"
                    >
                      免责声明
                    </button>
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isUploading || (!file && !externalUrl) || !agreedToTerms}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isUploading || (!file && !externalUrl) || !agreedToTerms
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </div>
                  ) : '生成分享码'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} 文件分享柜 - 安全便捷的文件分享服务</p>
        </div>
      </div>

      {showDisclaimer && (
        <AlertModal
          title="免责声明"
          body="1. 本服务仅供个人学习和技术研究使用，不得用于任何商业用途或非法目的。
                
                2. 用户自行对上传或分享的文件内容负责，本服务不承担任何因文件内容引起的法律责任。
                
                3. 本服务不会主动审查用户上传的文件内容，但保留基于法律要求或安全考虑删除文件的权利。
                
                4. 用户不得上传包含侵犯他人知识产权、违法法律法规、病毒恶意软件等内容的文件。
                
                5. 本服务基于Vercel平台提供，可能因平台策略或技术原因随时变更或终止，恕不另行通知。
                
                6. 在法律允许的最大范围内，本服务按'现状'提供，不提供任何形式的担保。"
          confirmText="我已阅读并理解"
          type="alert"
          onClose={() => setShowDisclaimer(false)}
        />
      )}

      {isUploading && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-80">
            <BounceLoader message="文件上传中..." />
          </div>
        </div>
      )}
    </div>
  );
}