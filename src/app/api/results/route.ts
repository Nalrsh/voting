import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongo';

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

// 处理GET请求 - 获取投票结果
export async function GET() {
  try {
    // 连接数据库，获取所有投票
    const { db } = await connectToDatabase();
    const votes = await db.collection('votes').find({}).toArray();

    // 统计各班级得票数
    const results = CLASSES.map(cls => {
      const classVotes = votes.filter((vote: any) => Number(vote.classId) === cls.id);
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