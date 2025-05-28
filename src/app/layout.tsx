import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '端午养生饮品展区投票系统',
  description: '学校养生饮品展区投票统计系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-primary text-white p-4 shadow-cartoon-lg border-b-4 border-red-700">
            <div className="container mx-auto flex items-center">
              <span className="text-3xl mr-2">🍵</span>
              <h1 className="text-2xl font-bold">端午养生饮品展区投票系统</h1>
              <span className="text-3xl ml-2">🎋</span>
            </div>
          </header>
          <main className="container mx-auto p-4 flex-grow">
            {children}
          </main>
          <footer className="bg-pastel-green p-4 mt-8 border-t-4 border-green-400 shadow-cartoon">
            <div className="container mx-auto text-center text-gray-700">
              <p className="flex items-center justify-center">
                <span className="text-xl mr-2">🎉</span>
                © {new Date().getFullYear()} 端午养生饮品展区投票系统
                <span className="text-xl ml-2">🎉</span>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}