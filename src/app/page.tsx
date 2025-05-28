import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 relative">
      {/* 装饰元素 */}
      <div className="absolute top-10 left-10 text-6xl float animate-[float_4s_ease-in-out_infinite]">🍵</div>
      <div className="absolute top-20 right-20 text-6xl float animate-[float_5s_ease-in-out_infinite]">🎋</div>
      <div className="absolute bottom-10 left-20 text-5xl float animate-[float_6s_ease-in-out_infinite]">🏮</div>
      <div className="absolute bottom-20 right-10 text-5xl float animate-[float_3s_ease-in-out_infinite]">🥢</div>
      
      <div className="card max-w-2xl w-full text-center relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12">🍵</div>
        
        <div className="relative">
          <h1 className="cartoon-title text-4xl mb-8 text-primary flex items-center justify-center">
            <span className="text-4xl mr-3">🎉</span>
            端午养生饮品展区投票系统
            <span className="text-4xl ml-3">🎉</span>
          </h1>
          
          <div className="mb-8 bg-pastel-yellow p-6 rounded-2xl border-2 border-yellow-400 shadow-cartoon">
            <h2 className="cartoon-title flex items-center justify-center mb-4">
              <span className="text-2xl mr-2">📜</span>
              投票规则
            </h2>
            <ul className="text-left space-y-3">
              {[
                '全校学生在7个班级的展区品尝后，每人可投1票',
                '每位学生只能投票一次，请慎重选择',
                '可以通过语音或文字方式进行投票',
                '投票结果将用于评选最佳展区'
              ].map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xl mr-2 text-accent">{'✨'}</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-6">
            <Link href="/vote" className="btn px-8 py-4 text-lg float flex items-center justify-center">
              <span className="text-2xl mr-2">🗳️</span>
              开始投票
            </Link>
            <Link href="/results" className="btn-secondary px-8 py-4 text-lg float flex items-center justify-center">
              <span className="text-2xl mr-2">📊</span>
              查看结果
            </Link>
          </div>
          
          <div className="mt-6 text-center p-2 bg-pastel-purple rounded-xl inline-block">
            <Link href="/test" className="text-sm text-gray-700 hover:text-primary transition-colors flex items-center">
              <span className="mr-1">🤖</span>
              测试通义千问API
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}