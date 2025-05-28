'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// 扩展Window接口，添加SpeechRecognition属性
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface VoiceRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onStatusChange?: (isListening: boolean) => void;
  onParsedResult?: (result: {
    studentId?: string;
    studentName?: string;
    classId?: number;
    error?: string;
  }) => void;
}

// 模拟语音识别结果 - 仅在无法访问麦克风时使用
const mockRecognitionResults = [
  '学号220328 姓名张三 投给2201班',
  '学号220329 姓名李四 投给2202班',
  '学号220330 姓名王五 投给2203班',
  '学号220331 姓名赵六 投给2204班',
  '学号220332 姓名钱七 投给2205班',
];

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  onResult,
  onError,
  onStatusChange,
  onParsedResult
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [hasWebSpeechSupport, setHasWebSpeechSupport] = useState(false);

  // 语音识别对象引用
  const recognitionRef = useRef<any>(null);
  
  // 检查浏览器是否支持Web Speech API
  useEffect(() => {
    // 检查浏览器是否支持Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasSpeechRecognition = !!SpeechRecognition;
    setHasWebSpeechSupport(hasSpeechRecognition);
    
    if (hasSpeechRecognition) {
      // 创建语音识别对象
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // 配置语音识别
      recognition.continuous = false; // 只识别一次
      recognition.interimResults = true; // 返回临时结果
      recognition.lang = 'zh-CN'; // 设置语言为中文
      
      // 设置事件处理函数
      recognition.onstart = () => {
        setIsListening(true);
        setMessage('正在听取您的语音...');
        setError(null);
        onStatusChange?.(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setMessage('识别中: ' + transcript);
        
        // 如果是最终结果
        if (event.results[0].isFinal) {
          onResult(transcript);
          
          // 停止录音
          try {
            recognition.stop();
          } catch (e) {
            // 忽略错误
          }
          
          // 处理语音结果
          setMessage('处理语音输入中...');
          processVoiceResult(transcript).catch(err => {
            console.error('处理语音结果出错:', err);
          });
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        const errorMessage = `语音识别错误: ${event.error}`;
        setError(errorMessage);
        onError?.(errorMessage);
        setIsListening(false);
        onStatusChange?.(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        onStatusChange?.(false);
      };
    }
    
    // 组件卸载时清理
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // 忽略错误
        }
      }
    };
  }, [onError, onResult, onStatusChange]);

  // 使用API处理语音识别结果
  const processVoiceResult = useCallback(async (text: string) => {
    try {
      // 调用API路由解析语音内容
      const response = await fetch('/api/qianwen/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const parsedResult = await response.json();
      
      if (!response.ok || parsedResult.error) {
        const errorMessage = parsedResult.error || '处理语音识别结果时出错';
        setError(errorMessage);
        onError?.(errorMessage);
        return { error: errorMessage };
      } else {
        // 将解析结果传递给父组件
        onParsedResult?.(parsedResult);
      }
      
      return parsedResult;
    } catch (err) {
      const errorMessage = '处理语音识别结果时出错';
      setError(errorMessage);
      onError?.(errorMessage);
      return { error: errorMessage };
    }
  }, [onError, onParsedResult]);

  // 开始语音识别
  const startListening = useCallback(() => {
    if (!hasWebSpeechSupport) {
      // 如果浏览器不支持Web Speech API，使用模拟实现
      setIsListening(true);
      setError(null);
      onStatusChange?.(true);
      
      // 模拟语音识别过程
      const recordingTime = 5000; // 5秒
      
      // 显示倒计时
      let remainingTime = Math.floor(recordingTime / 1000);
      const countdownInterval = setInterval(() => {
        remainingTime -= 1;
        setMessage(`模拟录音...还剩 ${remainingTime} 秒`);
      }, 1000);
      
      setTimeout(async () => {
        clearInterval(countdownInterval);
        
        try {
          setMessage('处理语音输入中...');
          
          // 随机选择一个模拟结果
          const randomIndex = Math.floor(Math.random() * mockRecognitionResults.length);
          const result = mockRecognitionResults[randomIndex];
          
          onResult(result);
          
          // 使用API解析结果
          await processVoiceResult(result);
        } catch (err) {
          const errorMessage = '语音识别失败，请重试';
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setIsListening(false);
          onStatusChange?.(false);
        }
      }, recordingTime);
      
      return;
    }
    
    try {
      // 使用实际的Web Speech API
      if (recognitionRef.current) {
        // 请求麦克风权限并开始录音
        recognitionRef.current.start();
        
        // 设置超时，防止录音时间过长
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.stop();
              setMessage('处理语音输入中...');
            } catch (e) {
              // 忽略错误
            }
          }
        }, 8000); // 8秒后自动停止
      } else {
        setError('语音识别初始化失败，请刷新页面重试');
        onError?.('语音识别初始化失败，请刷新页面重试');
      }
    } catch (err) {
      console.error('启动语音识别出错:', err);
      setError('启动语音识别出错，请确保已授予麦克风权限');
      onError?.('启动语音识别出错，请确保已授予麦克风权限');
      setIsListening(false);
      onStatusChange?.(false);
    }
  }, [isListening, onResult, onError, onStatusChange, hasWebSpeechSupport, processVoiceResult]);

  const stopListening = useCallback(() => {
    if (isListening) {
      // 如果正在使用Web Speech API，停止录音
      if (hasWebSpeechSupport && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // 忽略错误
        }
      }
      
      setIsListening(false);
      onStatusChange?.(false);
    }
  }, [isListening, onStatusChange, hasWebSpeechSupport]);

  // 组件卸载时停止监听
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <div className="voice-recognition">
      <div className="flex gap-2">
        <button
          className={`btn flex items-center justify-center flex-grow ${
            isListening ? 'bg-red-500 hover:bg-red-600' : ''
          }`}
          onClick={startListening}
          disabled={isListening}
        >
          {isListening ? '正在录音...' : '开始语音输入'}
          <svg
            className={`ml-2 w-5 h-5 ${isListening ? 'animate-pulse' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        {isListening && (
          <button
            className="btn bg-gray-500 hover:bg-gray-600 px-4"
            onClick={stopListening}
          >
            停止
          </button>
        )}
      </div>

      {message && (
        <p className="mt-2 text-sm text-blue-600">{message}</p>
      )}
      
      {error && (
        <p className="text-red-500 mt-2 text-sm">{error}</p>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>请说："学号[您的学号] 姓名[您的姓名] 投给[班级]"</p>
        <p className="mt-1">例如："学号220328 姓名张三 投给2201班"</p>
      </div>
    </div>
  );
};

export default VoiceRecognition;