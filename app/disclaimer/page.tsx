export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">免责声明</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2>使用须知</h2>
            
            <p>在使用本文件分享服务之前，请您仔细阅读以下条款：</p>
            
            <h3>1. 服务性质</h3>
            <p>本服务仅供个人学习和技术研究使用，不得用于任何商业用途或非法目的。</p>
            
            <h3>2. 内容责任</h3>
            <p>用户自行对上传或分享的文件内容负责，本服务不承担任何因文件内容引起的法律责任。</p>
            
            <h3>3. 隐私保护</h3>
            <p>本服务不会主动审查用户上传的文件内容，但保留基于法律要求或安全考虑删除文件的权利。</p>
            
            <h3>4. 使用限制</h3>
            <p>用户不得上传包含以下内容的文件：</p>
            <ul>
              <li>侵犯他人知识产权的内容</li>
              <li>违法法律法规的内容</li>
              <li>病毒、恶意软件等有害程序</li>
              <li>其他违反社会公序良俗的内容</li>
            </ul>
            
            <h3>5. 服务可用性</h3>
            <p>本服务基于Vercel平台提供，可能因平台策略或技术原因随时变更或终止，恕不另行通知。</p>
            
            <h3>6. 免责声明</h3>
            <p>在法律允许的最大范围内，本服务按"现状"提供，不提供任何形式的担保。对于因使用本服务而产生的任何直接或间接损失，本服务不承担任何责任。</p>
            
            <h3>7. 法律适用</h3>
            <p>本声明的解释和适用均适用中华人民共和国法律法规。</p>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="font-bold">重要提醒：</p>
              <p>通过使用本服务，您确认已完全理解并同意上述条款。如您不同意这些条款，请勿使用本服务。</p>
            </div>
            
            <div className="mt-8 text-center">
              <a 
                href="/" 
                className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                返回首页
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}