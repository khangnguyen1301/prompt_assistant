# 🎯 Prompt Assistant

Ứng dụng web tối ưu hóa prompt giống ChatGPT, hỗ trợ người dùng chuyển đổi yêu cầu thô thành prompt có cấu trúc chuyên nghiệp.

## 🏗️ Kiến trúc

```
prompt_assistant/
├── frontend/           # Next.js 14 + TypeScript
├── backend/           # NestJS + Prisma
├── database/          # PostgreSQL scripts
├── docker/           # Docker configurations
├── docs/             # Documentation
└── shared/           # Shared types & utilities
```

## 🚀 Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn/ui**
- **Clerk** (Authentication & User Management)
- **React Query** (State management)
- **React Hook Form** + **Zod** (Form validation)

### Backend

- **NestJS** (Framework)
- **Prisma** (ORM)
- **PostgreSQL** (Database)
- **Redis** (Caching)
- **Google Gemini API** (AI Service)
- **Winston** (Logging)

### DevOps

- **Docker** + **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Sentry** (Error tracking)

## 📦 Features

### 🎯 Core Features

- ✅ Chat interface giống ChatGPT
- ✅ Tối ưu hóa prompt từ yêu cầu thô
- ✅ Lưu trữ lịch sử hội thoại
- ✅ Định dạng prompt chuẩn (Goal/Input/Output/Instructions/Notes)

### 🔮 Advanced Features

- ✅ Authentication & Authorization
- ✅ Real-time typing indicators
- ✅ Export/Import conversations
- ✅ Prompt templates library
- ✅ Analytics & usage tracking

## 🚀 Quick Start

```bash
# Clone repository
git clone <repo-url>
cd prompt_assistant

# Start with Docker Compose
docker-compose up -d

# Or run separately:
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

## 📊 Database Schema

### Core Tables

- `users` - User management
- `conversations` - Chat sessions
- `messages` - Individual messages
- `prompts` - Generated prompts
- `templates` - Prompt templates

## 🔧 Environment Variables

See `.env.example` files in respective directories.

## 📝 API Documentation

API docs available at: `http://localhost:3001/api/docs`

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request
