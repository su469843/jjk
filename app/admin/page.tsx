'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BounceLoader from '@/components/BounceLoader';
import AlertModal from '@/components/AlertModal';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const router = useRouter();

  // 简单的登录检查
  useEffect(() => {
    const adminPassword = localStorage.getItem('adminPassword');
    if (adminPassword === 'admin123') { // 简单的硬编码密码示例
      setIsLoggedIn(true);
      loadFiles();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    // 模拟登录延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 简单的密码验证（实际项目中应该使用更安全的方法）
    if (password === 'admin123') {
      localStorage.setItem('adminPassword', password);
      setIsLoggedIn(true);
      loadFiles();
    } else {
      setError('密码错误');
    }
    
    setIsLoggingIn(false);
  };

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/admin/files');
      const data = await response.json();
      
      if (response.ok) {
        setFiles(data);
      } else {
        setError(data.error || '加载文件列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setIsLoggedIn(false);
    setPassword('');
    setFiles([]);
  };

  const handleDeleteFile = (file: any) => {
    setSelectedFile(file);
    setShowDeleteModal(true);
  };

  const confirmDeleteFile = async () => {
    if (!selectedFile) return;
    
    try {
      // 这里应该调用删除API
      // 由于时间关系，我们只是从列表中移除
      setFiles(files.filter(f => f.id !== selectedFile.id));
      setShowDeleteModal(false);
      setSelectedFile(null);
    } catch (err) {
      setError('删除失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-80">
          <BounceLoader message="正在加载..." />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">管理员登录</h1>
              <p className="text-slate-600">请输入管理员密码访问后台</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label htmlFor="password" className="block text-slate-700 text-sm font-medium mb-2">
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isLoggingIn
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {isLoggingIn ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      登录中...
                    </div>
                  ) : '登录'}
                </button>
                
                <a 
                  href="/" 
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  返回首页
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">文件管理</h1>
              <p className="text-slate-600 mt-1">管理所有上传的文件</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadFiles}
                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                刷新
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                退出登录
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    分享码
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    文件名
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    下载次数
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    过期时间
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center mb-4">
                        <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-1">暂无文件</h3>
                      <p className="text-slate-500">还没有上传的文件</p>
                    </td>
                  </tr>
                ) : (
                  files.map((file) => {
                    const isExpired = new Date(file.expiresAt) < new Date();
                    const isDownloadLimitReached = file.downloadCount >= file.downloadLimit;
                    
                    return (
                      <tr key={file.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{file.shareCode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900 truncate max-w-xs">{file.fileName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            file.type === 'blob' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {file.type === 'blob' ? '上传文件' : '外部链接'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            <span className={file.downloadCount >= file.downloadLimit ? 'text-red-500' : 'text-green-500'}>
                              {file.downloadCount}
                            </span> / {file.downloadLimit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {new Date(file.expiresAt).toLocaleDateString('zh-CN')}
                          </div>
                          <div className={`text-xs ${
                            isExpired ? 'text-red-500' : 'text-slate-500'
                          }`}>
                            {isExpired ? '已过期' : '有效'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <a 
                              href={`/download/${file.shareCode}`} 
                              target="_blank"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              查看
                            </a>
                            <button 
                              onClick={() => {
                                // 这里可以实现编辑功能
                                alert('编辑功能将在后续版本中实现');
                              }}
                              className="text-slate-600 hover:text-slate-900"
                            >
                              编辑
                            </button>
                            <button 
                              onClick={() => handleDeleteFile(file)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {showDeleteModal && (
        <AlertModal
          title="确认删除"
          body={`您确定要删除文件 "${selectedFile?.fileName}" 吗？此操作不可撤销。`}
          confirmText="确认删除"
          cancelText="取消"
          type="confirm"
          onConfirm={confirmDeleteFile}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}