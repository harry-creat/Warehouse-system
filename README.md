# 仓库管理系统 (WMS)

全栈仓库库存管理系统，提供两套运行方案：
- **Web 版**: React + Express (前后端分离，功能完整)
- **Streamlit 版**: Python Streamlit App (单命令启动，快速部署)

支持手动/文件导入入库出库，实时库存仪表盘，报表导出。

---

## 方案一：Web 版 (React + Express)

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + shadcn/ui |
| 状态管理 | Zustand 4 |
| 数据请求 | Axios + TanStack React Query v5 |
| 图表 | Recharts 2 |
| 后端 | Node.js 20 + Express 4 + TypeScript |
| ORM | Prisma 5 |
| 数据库 | SQLite (开发) / PostgreSQL (生产，兼容) |
| 认证 | JWT (access token 15min + refresh token 7d) |
| 文件解析 | SheetJS/xlsx + pdf-parse |

### 前置要求

- Node.js 20+
- npm 10+

### 第一步：安装依赖

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 第二步：配置环境变量

```bash
cd backend
cp .env.example .env
```

默认配置可直接使用，生产环境请修改 `.env` 中的密钥和端口。

### 第三步：初始化数据库

```bash
cd backend
npx prisma db push
npx tsx prisma/seed.ts
```

### 第四步：启动服务

打开两个终端分别启动前后端：

**终端 1 — 启动后端（端口 4000）**

```bash
cd backend
npm run dev
```

**终端 2 — 启动前端（端口 5173）**

```bash
cd frontend
npm run dev
```

### 第五步：打开系统

浏览器访问 **http://localhost:5173**

### 默认账户

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@wms.com | Admin@123456 |
| 操作员 | operator@wms.com | Oper@123456 |

### 启动方式说明

| 文件 | 路径 | 启动命令 |
|------|------|----------|
| 后端入口 | [backend/src/index.ts](backend/src/index.ts) | `cd backend && npm run dev` |
| 前端入口 | [frontend/src/main.tsx](frontend/src/main.tsx) | `cd frontend && npm run dev` |
| 数据库 Schema | [backend/src/prisma/schema.prisma](backend/src/prisma/schema.prisma) | — |
| 种子数据 | [backend/prisma/seed.ts](backend/prisma/seed.ts) | `cd backend && npx tsx prisma/seed.ts` |
| 共享验证 | [shared/schemas/index.ts](shared/schemas/index.ts) | — |

---

## 方案二：Streamlit 版 (Python)

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Streamlit 1.57+ |
| 数据处理 | Pandas 3.0+ |
| 图表 | Plotly 6.7+ |
| Excel 解析 | openpyxl 3.1+ |
| PDF 解析 | PyPDF2 3.0+ |
| 密码加密 | bcrypt 5.0+ |

### 🚀 快速启动（推荐新手）

只需 **3 步** 即可启动：

#### Step 1 — 安装 Python 依赖

```bash
cd streamlit_app
pip install -r requirements.txt
```

#### Step 2 — 启动 Streamlit 应用

```bash
cd streamlit_app
streamlit run app.py
```

#### Step 3 — 打开浏览器

浏览器会自动打开，如果没有，访问 **http://localhost:8501**

#### 登录账户

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@wms.com | Admin@123456 |
| 操作员 | operator@wms.com | Oper@123456 |

### 功能模块对应文件

| 功能 | Streamlit 文件 |
|------|---------------|
| 主入口 + 登录 | [streamlit_app/app.py](streamlit_app/app.py) |
| 仪表盘 | [streamlit_app/pages/dashboard.py](streamlit_app/pages/dashboard.py) |
| 库存管理 | [streamlit_app/pages/inventory.py](streamlit_app/pages/inventory.py) |
| 入库管理 | [streamlit_app/pages/stock_in.py](streamlit_app/pages/stock_in.py) |
| 出库管理 | [streamlit_app/pages/stock_out.py](streamlit_app/pages/stock_out.py) |
| 交易记录 | [streamlit_app/pages/transactions.py](streamlit_app/pages/transactions.py) |
| 产品管理 | [streamlit_app/pages/products.py](streamlit_app/pages/products.py) |
| 报表分析 | [streamlit_app/pages/reports.py](streamlit_app/pages/reports.py) |
| 数据库操作 | [streamlit_app/utils/db.py](streamlit_app/utils/db.py) |
| 认证模块 | [streamlit_app/utils/auth.py](streamlit_app/utils/auth.py) |
| 文件解析 | [streamlit_app/utils/parsers.py](streamlit_app/utils/parsers.py) |

### 二者对比

| 特性 | Web 版 | Streamlit 版 |
|------|--------|-------------|
| 启动方式 | 两个终端分别启动前后端 | 单命令 `streamlit run app.py` |
| 技术栈 | React + Node.js + Prisma | Python + Streamlit + SQLite |
| 适合人群 | 前端开发者、生产部署 | 数据分析师、快速验证 |
| UI 风格 | 自定义组件，完整交互 | Streamlit 原生控件 |
| 数据源 | 共享同一个 SQLite 数据库 | 共享同一个 SQLite 数据库 |
| 文件上传 | 拖拽上传 + 服务端解析 | Streamlit file_uploader + 客户端解析 |
| 图表 | Recharts | Plotly |
| 权限控制 | JWT 中间件 + 路由守卫 | Session State + 页面条件渲染 |

> **两种方案共享同一个数据库**，可以先用 Streamlit 快速录入数据，再用 Web 版进行高级操作。

---

## 文件上传格式

系统支持 Excel (.xlsx / .xls)、CSV 和 PDF 文件导入。Excel/CSV 文件应包含以下列（支持中英文表头）：

| SKU | 品名/Name | 数量/Quantity | 单价/UnitPrice | 备注/Note |
|-----|-----------|---------------|----------------|-----------|
| PRD-001 | 螺丝钉 | 500 | 0.50 | 采购入库 |
| PRD-002 | 轴承 | 20 | 35.00 | 补货入库 |

规则：
- SKU 为必填项，用于匹配已有产品或自动创建新产品
- 缺少 SKU 或数量无效的行将被跳过并记录错误
- 可在入库/出库页面点击「下载导入模板」获取标准模板

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| DATABASE_URL | 数据库连接 | file:./dev.db |
| JWT_ACCESS_SECRET | JWT 签名密钥 | — |
| JWT_REFRESH_SECRET | 刷新令牌密钥 | — |
| PORT | 后端端口 | 4000 |
| UPLOAD_DIR | 上传目录 | ./uploads |
| MAX_FILE_SIZE_MB | 最大文件大小(MB) | 10 |

---

## Docker 部署

```bash
docker-compose up -d
```

服务启动后：后端 `http://localhost:4000`，前端 `http://localhost:3000`

---

## 项目结构

```
├── backend/              # Express API 后端 (端口 4000)
│   ├── prisma/           # 数据库 Schema + 种子数据
│   └── src/
│       ├── config/       # 环境变量配置
│       ├── middleware/    # JWT 认证、错误处理、文件上传
│       ├── modules/      # 业务模块
│       └── utils/        # JWT、响应封装、日志
├── frontend/             # React SPA 前端 (端口 5173)
│   └── src/
│       ├── api/          # API 请求层
│       ├── components/   # UI 组件
│       ├── hooks/        # 自定义 Hooks
│       ├── pages/        # 页面组件
│       ├── store/        # Zustand 状态管理
│       └── types/        # TypeScript 类型定义
├── streamlit_app/        # Streamlit Python 版 (端口 8501)
│   ├── app.py            # 主入口 + 登录
│   ├── pages/            # 各功能页面
│   └── utils/            # 数据库、认证、文件解析
├── shared/schemas/       # 前后端共享 Zod 校验
├── docker-compose.yml
└── README.md
```
