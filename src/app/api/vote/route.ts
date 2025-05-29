import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongo';

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

    // 连接数据库
    const { db } = await connectToDatabase();
    const votesCollection = db.collection('votes');

    // 检查是否已经投票
    const existingVote = await votesCollection.findOne({ studentId: body.studentId });
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

    await votesCollection.insertOne(newVote);

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