import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 数据文件路径
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'votes.json');

// 仅支持POST请求
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // 校验密码
    if (password !== 'shidafuxiao') {
      return NextResponse.json(
        { message: '密码错误，无法清空投票数据' },
        { status: 401 }
      );
    }

    // 清空投票数据
    fs.writeFileSync(DATA_FILE_PATH, '[]', 'utf-8');

    return NextResponse.json({ message: '投票数据已清空' });
  } catch (error) {
    console.error('清空投票数据错误:', error);
    return NextResponse.json(
      { message: '服务器错误，清空失败' },
      { status: 500 }
    );
  }
}