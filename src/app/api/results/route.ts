import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 数据文件路径
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'votes.json');

// 班级列表
const CLASSES = [
  { id: 1, name: '一班' },
  { id: 2, name: '二班' },
  { id: 3, name: '三班' },
  { id: 4, name: '四班' },
  { id: 5, name: '五班' },
  { id: 6, name: '六班' },
  { id: 7, name: '七班' },
];

// 读取投票数据
const readVotesData = () => {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir) || !fs.existsSync(DATA_FILE_PATH)) {
    return [];
  }
  
  const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('解析投票数据错误:', error);
    return [];
  }
};

// 处理GET请求 - 获取投票结果
export async function GET() {
  try {
    // 读取投票数据
    const votes = readVotesData();
    
    // 统计各班级得票数
    const results = CLASSES.map(cls => {
      const classVotes = votes.filter((vote: any) => vote.classId === cls.id);
      return {
        classId: cls.id,
        className: cls.name,
        count: classVotes.length
      };
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('获取结果错误:', error);
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}