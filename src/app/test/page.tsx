'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [prompt, setPrompt] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [result, setResult] = useState('');
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiInfo, setApiInfo] = useState<{
    apiKey?: string;
    apiUrl?: string;
    model?: string;
  }>({});

  // 获取API配置信息
  useEffect(() => {
    // 注意：这里只能获取NEXT_PUBLIC_开头的环境变量
    setApiInfo({
      apiUrl: process.env.NEXT_PUBLIC_QIANWEN_API_URL || '(仅服务器端可见)',
      model: process.env.NEXT_PUBLIC_QIANWEN_MODEL || '(仅服务器端可见)',
      apiKey: process.env.NEXT_PUBLIC_QIANWEN_API_KEY ?
        `${process.env.NEXT_PUBLIC_QIANWEN_API_KEY.substring(0, 5)}...` :
        '(仅服务器端可见)'
    });
  }, []);

  // 测试通义千问API
  const testQianwenApi = async () => {
    if (!prompt) {
      setError('请输入提示词');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 调用API路由
      const response = await fetch('/api/qianwen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '调用API出错');
      }
      
      setResult(data.text || JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || '调用API出错');
    } finally {
      setLoading(false);
    }
  };

  // 测试语音解析
  const testVoiceParsing = async () => {
    if (!voiceText) {
      setError('请输入模拟的语音文本');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 调用API路由
      const response = await fetch('/api/qianwen/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: voiceText }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '解析语音出错');
      }
      
      setParsedResult(data);
    } catch (err: any) {
      setError(err.message || '解析语音出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">通义千问API测试页面</h1>
      
      <Link href="/" className="text-blue-500 hover:underline mb-6 block">
        返回首页
      </Link>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">API配置信息</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p><strong>API URL:</strong> {apiInfo.apiUrl}</p>
          <p><strong>模型:</strong> {apiInfo.model}</p>
          <p><strong>API Key:</strong> {apiInfo.apiKey}</p>
          <p className="text-sm text-gray-500 mt-2">注意：出于安全考虑，完整的API密钥仅在服务器端可见</p>
        </div>
      </div>
      
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">测试通义千问API</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">提示词</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入提示词，例如：你好，请介绍一下自己"
          />
        </div>
        
        <button
          className="btn mb-4"
          onClick={testQianwenApi}
          disabled={loading}
        >
          {loading ? '请求中...' : '测试API'}
        </button>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-50 border rounded-md">
            <p className="font-semibold">API响应：</p>
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">测试语音解析</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">模拟语音文本</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            placeholder="例如：学号12345 姓名张三 投给一班"
          />
        </div>
        
        <button
          className="btn mb-4"
          onClick={testVoiceParsing}
          disabled={loading}
        >
          {loading ? '解析中...' : '测试语音解析'}
        </button>
        
        {parsedResult && (
          <div className="mt-4 p-3 bg-gray-50 border rounded-md">
            <p className="font-semibold">解析结果：</p>
            <pre className="whitespace-pre-wrap">{JSON.stringify(parsedResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}