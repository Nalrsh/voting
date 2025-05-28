'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// 动态导入ECharts组件，避免SSR问题
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// 班级列表
const CLASSES = [
  { id: 1, name: '2201班', emoji: '🥇' },
  { id: 2, name: '2202班', emoji: '🥈' },
  { id: 3, name: '2203班', emoji: '🥉' },
  { id: 4, name: '2204班', emoji: '🎯' },
  { id: 5, name: '2205班', emoji: '🎪' },
  { id: 6, name: '2206班', emoji: '🎭' },
  { id: 7, name: '2207班', emoji: '🎨' },
];

// 投票结果类型
interface VoteResult {
  classId: number;
  count: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);

  // 获取投票结果
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // 从API获取投票结果
        const response = await fetch('/api/results');
        
        if (!response.ok) {
          throw new Error('获取结果失败');
        }
        
        const data = await response.json();
        
        // 处理数据
        const processedResults = CLASSES.map(cls => {
          const classResult = data.find((r: VoteResult) => r.classId === cls.id);
          return {
            classId: cls.id,
            count: classResult ? classResult.count : 0
          };
        });
        
        // 计算总票数
        const total = processedResults.reduce((sum, item) => sum + item.count, 0);
        
        setResults(processedResults);
        setTotalVotes(total);
      } catch (err: any) {
        // 如果API尚未实现，使用模拟数据
        console.error('Error fetching results:', err);
        setError('无法获取实时数据，显示模拟数据');
        
        // 模拟数据
        const mockResults = CLASSES.map(cls => ({
          classId: cls.id,
          count: Math.floor(Math.random() * 50) + 10
        }));
        
        const total = mockResults.reduce((sum, item) => sum + item.count, 0);
        
        setResults(mockResults);
        setTotalVotes(total);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    
    // 每10秒刷新一次数据
    const intervalId = setInterval(fetchResults, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 准备ECharts选项
  const getChartOption = () => {
    return {
      title: {
        text: '各班级得票统计',
        left: 'center',
        textStyle: {
          fontFamily: 'Comic Neue, cursive',
          fontWeight: 'bold',
          fontSize: 18
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params: any) {
          const cls = CLASSES.find(c => c.name === params[0].name);
          return `${cls?.emoji || ''} ${params[0].name}: ${params[0].value}票`;
        },
        backgroundColor: 'rgba(255, 250, 205, 0.9)',
        borderColor: '#FFD166',
        textStyle: {
          color: '#333'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: CLASSES.map(cls => cls.name),
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          formatter: function(value: string) {
            const cls = CLASSES.find(c => c.name === value);
            return `${cls?.emoji || ''}\n${value}`;
          },
          margin: 14,
          fontFamily: 'Comic Neue, cursive'
        }
      },
      yAxis: {
        type: 'value',
        name: '票数',
        nameTextStyle: {
          fontFamily: 'Comic Neue, cursive'
        },
        axisLabel: {
          fontFamily: 'Comic Neue, cursive'
        }
      },
      series: [
        {
          name: '得票数',
          type: 'bar',
          barWidth: '60%',
          data: results.map(r => ({
            value: r.count,
            itemStyle: {
              color: getClassColor(r.classId),
              borderRadius: [8, 8, 0, 0]
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}票',
            fontFamily: 'Comic Neue, cursive',
            fontWeight: 'bold'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      animationDuration: 1500,
      animationEasing: 'bounceOut'
    };
  };

  // 获取班级对应的颜色
  const getClassColor = (classId: number) => {
    const colors = [
      '#FF6B6B', // 鲜艳的红色
      '#4ECDC4', // 清新的青绿色
      '#FFD166', // 明亮的黄色
      '#A5D8FF', // 淡蓝色
      '#B8E0D2', // 淡绿色
      '#FFD1DC', // 淡粉色
      '#D8BFD8'  // 淡紫色
    ];
    return colors[(classId - 1) % colors.length];
  };

  // 获取排名
  const getRankedResults = () => {
    return [...results].sort((a, b) => b.count - a.count);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <span className="text-4xl float mr-3">📊</span>
        <h1 className="cartoon-title text-3xl">投票结果</h1>
      </div>
      
      {error && (
        <div className="bg-pastel-yellow border-2 border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl mb-4 shadow-cartoon">
          <div className="flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary border-r-accent border-b-secondary border-l-pastel-purple"></div>
          <p className="mt-4 text-primary font-bold">加载中...</p>
        </div>
      ) : (
        <>
          <div className="card mb-8 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 text-6xl rotate-12 opacity-20">📈</div>
            <h2 className="cartoon-title flex items-center">
              <span className="text-2xl mr-2">📊</span>
              实时统计图表
            </h2>
            <div className="h-80">
              <ReactECharts option={getChartOption()} style={{ height: '100%' }} />
            </div>
            <div className="mt-4 text-center bg-pastel-blue p-3 rounded-xl border-2 border-blue-300">
              <p className="text-gray-700 font-bold flex items-center justify-center">
                <span className="text-xl mr-2">🎯</span>
                总投票数: <span className="text-primary text-xl ml-1">{totalVotes}</span> 票
              </p>
            </div>
          </div>
          
          <div className="card mb-8 bg-pastel-green border-pastel-green">
            <h2 className="cartoon-title flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              班级排名
            </h2>
            <div className="overflow-hidden rounded-xl">
              {getRankedResults().map((result, index) => {
                const cls = CLASSES.find(c => c.id === result.classId);
                const percentage = totalVotes > 0 ? (result.count / totalVotes * 100).toFixed(1) : '0';
                
                // 为前三名添加特殊样式
                let rankStyle = "";
                let rankEmoji = "";
                
                if (index === 0) {
                  rankStyle = "bg-accent border-2 border-yellow-500";
                  rankEmoji = "🥇";
                } else if (index === 1) {
                  rankStyle = "bg-pastel-blue border-2 border-blue-300";
                  rankEmoji = "🥈";
                } else if (index === 2) {
                  rankStyle = "bg-pastel-pink border-2 border-pink-300";
                  rankEmoji = "🥉";
                }
                
                return (
                  <div
                    key={result.classId}
                    className={`flex items-center p-4 mb-3 rounded-xl transition-transform hover:scale-102 ${
                      rankStyle || (index % 2 === 0 ? 'bg-white' : 'bg-pastel-yellow border border-yellow-200')
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-primary shadow-cartoon mr-4">
                      <span className="font-bold text-lg">{rankEmoji || index + 1}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-lg flex items-center">
                          {cls?.emoji} {cls?.name}
                        </span>
                        <span className="font-bold">{result.count}票 ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-4 border border-gray-200">
                        <div
                          className="h-4 rounded-full transition-all duration-1000"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getClassColor(result.classId)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Link href="/" className="btn-secondary flex items-center">
              <span className="mr-1">🏠</span>
              返回首页
            </Link>
            <Link href="/vote" className="btn flex items-center float">
              <span className="mr-1">✅</span>
              去投票
            </Link>
          </div>
        </>
      )}
    </div>
  );
}