import { NextRequest, NextResponse } from 'next/server';

// 通义千问API配置
const API_KEY = process.env.QIANWEN_API_KEY;
const API_URL = process.env.QIANWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const MODEL = process.env.QIANWEN_MODEL || 'qwen-max';

// 处理POST请求 - 调用通义千问API
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: '缺少必要的prompt参数' },
        { status: 400 }
      );
    }
    
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API密钥未配置' },
        { status: 500 }
      );
    }
    
    console.log('调用通义千问API...');
    console.log('提示词:', prompt);
    
    // 构建请求体
    const requestBody = {
      model: MODEL,
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一个语音识别助手，帮助解析学生的投票信息。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        temperature: 0.3,
        top_p: 0.8,
        result_format: 'text'
      }
    };
    
    // 调用通义千问API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
      return NextResponse.json(
        { error: `API请求失败: ${response.status}` },
        { status: response.status }
      );
    }
    
    // 解析API响应
    const data = await response.json();
    console.log('API响应数据类型:', typeof data);
    
    if (!data.output || !data.output.text) {
      console.error('API响应格式不正确:', data);
      return NextResponse.json(
        { error: 'API响应格式不正确' },
        { status: 500 }
      );
    }
    
    // 返回API响应
    return NextResponse.json({
      text: data.output.text
    });
  } catch (error) {
    console.error('处理请求出错:', error);
    return NextResponse.json(
      { error: `服务器错误: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

// 处理GET请求 - 测试API是否可用
export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      message: '通义千问API路由正常',
      apiConfigured: !!API_KEY,
      model: MODEL,
      apiUrl: API_URL ? API_URL.substring(0, API_URL.indexOf('/api') + 4) + '...' : undefined
    });
  } catch (error) {
    return NextResponse.json(
      { error: `服务器错误: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}