# 端午养生饮品展区投票系统

这是一个基于Next.js开发的投票统计系统，用于学校养生饮品展区的投票活动。

## 功能特点

- 支持语音和文字输入投票
- 防止重复投票，每个学生只能投一次票
- 实时统计和可视化展示投票结果
- 响应式设计，适配各种设备

## 页面说明

- **首页**：投票流程介绍、规则说明
- **投票页**：支持语音和文字输入进行投票
- **结果页**：实时展示各班级得票情况，包括柱状图和排名

## 技术栈

- **前端**：Next.js (React)、TypeScript、Tailwind CSS
- **数据可视化**：ECharts
- **语音识别**：模拟实现（实际项目中可集成第三方API）
- **数据存储**：本地JSON文件

## 开发环境设置

1. 安装依赖：

```bash
npm install
```

2. 运行开发服务器：

```bash
npm run dev
```

3. 访问 [http://localhost:3000](http://localhost:3000) 查看应用

## 部署

构建生产版本：

```bash
npm run build
```

启动生产服务器：

```bash
npm start
```

## 项目结构

```
/
├── data/               # 数据存储目录
├── public/             # 静态资源
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API路由
│   │   ├── vote/       # 投票页面
│   │   └── results/    # 结果页面
│   ├── components/     # React组件
│   ├── types/          # TypeScript类型定义
│   └── utils/          # 工具函数
├── .env.local          # 环境变量
└── package.json        # 项目配置
```

## 注意事项

- 本项目中的语音识别功能为模拟实现，实际项目中可以集成第三方API
- 数据存储使用本地JSON文件，实际项目中可以使用数据库