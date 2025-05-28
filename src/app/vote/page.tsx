'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VoiceRecognition from '@/components/VoiceRecognition';
import { parseVoiceInput } from '@/utils/voiceParser';

// 班级列表
const CLASSES = [
  { id: 1, name: '2201班' },
  { id: 2, name: '2202班' },
  { id: 3, name: '2203班' },
  { id: 4, name: '2204班' },
  { id: 5, name: '2205班' },
  { id: 6, name: '2206班' },
  { id: 7, name: '2207班' },
];

export default function VotePage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 处理语音识别结果
  const handleVoiceResult = (text: string) => {
    setTranscript(text);
  };

  // 处理语音识别错误
  const handleVoiceError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // 处理语音识别状态变化
  const handleVoiceStatusChange = (listening: boolean) => {
    setIsListening(listening);
    if (listening) {
      setTranscript('');
    }
  };

  // 处理解析后的语音结果
  const handleParsedVoiceResult = (result: {
    studentId?: string;
    studentName?: string;
    classId?: number;
    error?: string;
  }) => {
    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.studentId && result.studentName && result.classId) {
      setStudentId(result.studentId);
      setStudentName(result.studentName);
      setSelectedClass(result.classId);
    }
  };

  // 提交投票
  const submitVote = async () => {
    if (!studentId || !studentName || !selectedClass) {
      setError('请填写完整的学号、姓名和选择班级');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // 提交投票数据到API
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          studentName,
          classId: selectedClass,
          timestamp: new Date().toISOString(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '投票失败');
      }
      
      // 投票成功后清空输入框
      setStudentId('');
      setStudentName('');
      setSelectedClass(null);
      
      // 投票成功，跳转到结果页面
      router.push('/results');
    } catch (err: any) {
      setError(err.message || '投票过程中出现错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <span className="text-4xl float mr-3">🗳️</span>
        <h1 className="cartoon-title text-3xl">投票页面</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 shadow-cartoon">
          <div className="flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <div className="card mb-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 text-6xl rotate-12 opacity-20">✏️</div>
        <h2 className="cartoon-title flex items-center">
          <span className="text-2xl mr-2">👤</span>
          请输入您的信息
        </h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold">学号</label>
          <div className="relative">
            <input
              type="text"
              className="input w-full pl-10"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="请输入您的学号"
            />
            <span className="absolute left-3 top-2.5">🔢</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold">姓名</label>
          <div className="relative">
            <input
              type="text"
              className="input w-full pl-10"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="请输入您的姓名"
            />
            <span className="absolute left-3 top-2.5">📝</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-bold">选择班级</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                  selectedClass === cls.id
                    ? 'bg-accent text-gray-800 border-yellow-500 shadow-cartoon'
                    : 'bg-white text-gray-700 border-pastel-blue hover:bg-pastel-yellow'
                }`}
                onClick={() => setSelectedClass(cls.id)}
              >
                <div className="flex items-center justify-center">
                  <span className="mr-1">🏫</span>
                  {cls.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card mb-6 bg-pastel-blue border-pastel-blue">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">🎤</span>
          <h2 className="cartoon-title mb-0">语音输入</h2>
        </div>
        <div className="bubble mb-4">
          <p className="text-gray-700">
            您也可以通过语音输入，请说："学号[您的学号] 姓名[您的姓名] 投给[班级]"
          </p>
        </div>
        
        <VoiceRecognition
          onResult={handleVoiceResult}
          onError={handleVoiceError}
          onStatusChange={handleVoiceStatusChange}
          onParsedResult={handleParsedVoiceResult}
        />
        
        {transcript && (
          <div className="mt-4 p-3 bg-pastel-yellow border-2 border-yellow-300 rounded-xl">
            <p className="font-bold flex items-center">
              <span className="text-xl mr-2">🔊</span>
              识别结果：
            </p>
            <p className="ml-7">{transcript}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Link href="/" className="btn-secondary flex items-center">
          <span className="mr-1">🏠</span>
          返回首页
        </Link>
        <button
          className={`btn flex items-center ${isSubmitting || !studentId || !studentName || !selectedClass ? 'opacity-50' : 'float'}`}
          onClick={submitVote}
          disabled={isSubmitting || !studentId || !studentName || !selectedClass}
        >
          <span className="mr-1">✅</span>
          {isSubmitting ? '提交中...' : '确认投票'}
        </button>
      </div>
    </div>
  );
}