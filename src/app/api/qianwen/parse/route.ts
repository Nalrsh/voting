import { NextRequest, NextResponse } from 'next/server';

// 通义千问API配置
const API_KEY = process.env.QIANWEN_API_KEY;
const API_URL = process.env.QIANWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const MODEL = process.env.QIANWEN_MODEL || 'qwen-max';

// 处理POST请求 - 解析语音文本
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { text } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: '缺少必要的text参数' },
        { status: 400 }
      );
    }
    
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API密钥未配置' },
        { status: 500 }
      );
    }
    
    console.log('解析语音文本:', text);
    
    // 构建提示词
    const prompt = `
    你是一个专业的语音识别解析助手。请从以下语音识别文本中提取学号、姓名和投票班级信息。
    
    语音文本: "${text}"
    
    请严格按照以下JSON格式返回结果，不要包含任何其他文字或解释:
    {
      "studentId": "提取的学号",
      "studentName": "提取的姓名",
      "classId": 提取的班级编号(数字1-7),
      "error": null
    }
    
    如果是中文数字（一到七），请转换为阿拉伯数字(1-7)。
    如果无法提取某项信息，请在对应字段填写null，并在error字段说明原因。
    `;
    
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
    
    if (!data.output || !data.output.text) {
      console.error('API响应格式不正确:', data);
      return NextResponse.json(
        { error: 'API响应格式不正确' },
        { status: 500 }
      );
    }
    
    const result = data.output.text;
    console.log('API返回原始结果:', result);
    
    try {
      // 尝试从结果中提取JSON部分
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : result;
      console.log('提取的JSON字符串:', jsonStr);
      
      // 尝试解析返回的JSON
      const parsedResult = JSON.parse(jsonStr);
      console.log('解析后的JSON结果:', parsedResult);
      
      // 验证结果
      if (!parsedResult.studentId || !parsedResult.studentName || !parsedResult.classId) {
        console.log('验证失败: 缺少必要字段');
        return NextResponse.json({ 
          error: '无法从语音中提取完整信息，请重试或使用文字输入',
          studentId: parsedResult.studentId || undefined,
          studentName: parsedResult.studentName || undefined,
          classId: parsedResult.classId || undefined
        });
      }
      
      // 验证班级ID是否在有效范围内
      const classId = Number(parsedResult.classId);
      if (isNaN(classId) || classId < 1 || classId > 7) {
        console.log('验证失败: 班级ID无效', classId);
        return NextResponse.json({ 
          error: '识别到的班级编号无效，请重试',
          studentId: parsedResult.studentId,
          studentName: parsedResult.studentName
        });
      }
      
      // 返回解析结果
      return NextResponse.json({
        studentId: parsedResult.studentId,
        studentName: parsedResult.studentName,
        classId: classId
      });
    } catch (parseError) {
      console.error('解析API返回结果出错:', parseError);
      console.error('原始结果:', result);
      return NextResponse.json(
        { error: `处理语音识别结果时出错: ${parseError instanceof Error ? parseError.message : '解析JSON失败'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('处理请求出错:', error);
    return NextResponse.json(
      { error: `服务器错误: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}