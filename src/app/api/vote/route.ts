import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 数据文件路径
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'votes.json');

// 确保数据目录存在
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取投票数据
const readVotesData = () => {
  ensureDataDir();
  
  if (!fs.existsSync(DATA_FILE_PATH)) {
    return [];
  }
  
  const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
  return JSON.parse(data);
};

// 写入投票数据
const writeVotesData = (data: any[]) => {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
};

// 处理POST请求 - 提交投票
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    if (!body.studentId || !body.studentName || !body.classId) {
      return NextResponse.json(
        { message: '缺少必要的投票信息' },
        { status: 400 }
      );
    }
    
    // 读取现有投票数据
    const votes = readVotesData();
    
    // 检查是否已经投票
    const existingVote = votes.find((vote: any) => vote.studentId === body.studentId);
    if (existingVote) {
      return NextResponse.json(
        { message: '您已经投过票了', vote: existingVote },
        { status: 409 }
      );
    }
    
    // 添加新投票
    const newVote = {
      studentId: body.studentId,
      studentName: body.studentName,
      classId: body.classId,
      timestamp: body.timestamp || new Date().toISOString(),
    };
    
    votes.push(newVote);
    
    // 保存投票数据
    writeVotesData(votes);
    
    return NextResponse.json(
      { message: '投票成功', vote: newVote },
      { status: 201 }
    );
  } catch (error) {
    console.error('投票处理错误:', error);
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}