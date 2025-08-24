# Prompt Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.1-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red.svg)](https://nestjs.com/)

A sophisticated AI-powered prompt optimization assistant that transforms raw user requests into structured, optimized prompts for better AI interactions. Built with modern technologies and featuring a ChatGPT-like interface with comprehensive file upload support, conversation management, and dark mode.

## 🎯 Overview

Prompt Assistant is a full-stack application designed to help users create better prompts for AI models by:

- **Analyzing** user input and understanding intent
- **Structuring** prompts with clear goals, instructions, and context
- **Optimizing** prompts for better AI model performance
- **Managing** conversation history with infinite scroll pagination
- **Supporting** file uploads (images, documents) for multimodal interactions

## ✨ Features

### 🚀 Core Features

- **AI-Powered Prompt Optimization**: Transform raw requests into structured prompts
- **ChatGPT-like Interface**: Intuitive chat interface with real-time messaging
- **Conversation Management**: Create, rename, delete, and search conversations
- **File Upload Support**: Upload images and documents for multimodal AI interactions
- **User Authentication**: Secure authentication with Clerk
- **Dark/Light Mode**: Comprehensive theme support with system preference detection

### 🎨 UI/UX Features

- **Responsive Design**: Mobile-first design optimized for all devices
- **Infinite Scroll**: Seamless pagination for conversation loading
- **Real-time Search**: Fast conversation search with modal interface
- **Keyboard Shortcuts**: Enhanced productivity with keyboard navigation
- **Loading States**: Smooth loading animations and skeleton components
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 🔧 Technical Features

- **RESTful API**: Well-documented API with Swagger integration
- **Database Integration**: PostgreSQL with Prisma ORM
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: API rate limiting and request throttling
- **File Management**: Cloudinary integration for file storage
- **Type Safety**: Full TypeScript implementation
- **Validation**: Input validation with Zod and class-validator
- **Security**: CORS, Helmet, and authentication guards

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│ (PostgreSQL)    │
│                 │    │                 │    │                 │
│ • React 18      │    │ • REST API      │    │ • Prisma ORM    │
│ • TypeScript    │    │ • WebSocket     │    │ • Migrations    │
│ • Tailwind CSS  │    │ • Authentication│    │ • Indexing      │
│ • Zustand       │    │ • Validation    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │     Cache       │    │   File Storage  │
│   Services      │    │    (Redis)      │    │  (Cloudinary)   │
│                 │    │                 │    │                 │
│ • Clerk Auth    │    │ • Session Cache │    │ • Image Upload  │
│ • Google Gemini │    │ • API Cache     │    │ • Document Store│
│ • Cloudinary    │    │ • Rate Limiting │    │ • CDN Delivery  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page (redirects to chat)
│   ├── sign-in/            # Authentication pages
│   ├── sign-up/
│   └── settings/           # User settings
├── components/
│   ├── auth/               # Authentication components
│   ├── chat/               # Chat interface components
│   │   ├── chat-layout.tsx
│   │   ├── chat-area.tsx
│   │   ├── sidebar.tsx
│   │   ├── message-list.tsx
│   │   └── conversation-menu.tsx
│   ├── settings/           # Settings components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
│   ├── useConversations.ts
│   ├── useMessages.ts
│   └── usePrompts.ts
├── stores/                 # Zustand state management
│   ├── apiKeyStore.ts
│   ├── themeStore.ts
│   └── sidebarStore.ts
└── lib/                    # Utilities and configurations
```

### Backend Architecture

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── auth/                  # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/
│   └── decorators/
├── conversations/         # Conversation management
├── messages/             # Message handling
├── prompts/              # Prompt optimization
├── files/                # File upload management
├── users/                # User management
├── settings/             # User settings
├── webhooks/             # Clerk webhooks
├── health/               # Health checks
└── prisma/               # Database service
```

## 🛠️ Technology Stack

### Frontend Technologies

| Technology                   | Version | Purpose                                |
| ---------------------------- | ------- | -------------------------------------- |
| **Next.js**                  | 14.1+   | React framework with App Router        |
| **React**                    | 18.2+   | UI library with hooks and context      |
| **TypeScript**               | 5.3+    | Type safety and development experience |
| **Tailwind CSS**             | 3.4+    | Utility-first CSS framework            |
| **Zustand**                  | 5.0+    | Lightweight state management           |
| **React Query**              | 5.17+   | Server state management and caching    |
| **Clerk**                    | 4.29+   | Authentication and user management     |
| **React Hook Form**          | 7.49+   | Form handling and validation           |
| **Zod**                      | 3.22+   | Schema validation                      |
| **Lucide React**             | 0.322+  | Icon library                           |
| **React Markdown**           | 9.0+    | Markdown rendering                     |
| **React Syntax Highlighter** | 15.5+   | Code syntax highlighting               |

### Backend Technologies

| Technology            | Version | Purpose                           |
| --------------------- | ------- | --------------------------------- |
| **NestJS**            | 10.3+   | Node.js framework with decorators |
| **TypeScript**        | 5.3+    | Type safety and modern JavaScript |
| **Prisma**            | 5.22+   | Next-generation ORM               |
| **PostgreSQL**        | 15+     | Relational database               |
| **Redis**             | 7+      | Caching and session storage       |
| **Clerk SDK**         | 4.13+   | Server-side authentication        |
| **Google Gemini API** | 1.15+   | AI model integration              |
| **Cloudinary**        | 2.7+    | Image and file management         |
| **Swagger**           | 7.1+    | API documentation                 |
| **Winston**           | 3.11+   | Logging framework                 |
| **Helmet**            | 7.1+    | Security middleware               |

### Development & DevOps

| Technology         | Purpose                     |
| ------------------ | --------------------------- |
| **Docker**         | Containerization            |
| **Docker Compose** | Multi-container development |
| **ESLint**         | Code linting                |
| **Prettier**       | Code formatting             |
| **Jest**           | Testing framework           |
| **GitHub Actions** | CI/CD pipeline              |
| **Concurrently**   | Script execution            |

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│    User     │────►│   Conversation   │────►│   Message   │
├─────────────┤     ├──────────────────┤     ├─────────────┤
│ id (UUID)   │     │ id (UUID)        │     │ id (UUID)   │
│ clerkId     │     │ userId (FK)      │     │ convId (FK) │
│ email       │     │ title            │     │ role        │
│ firstName   │     │ createdAt        │     │ content     │
│ lastName    │     │ updatedAt        │     │ metadata    │
│ imageUrl    │     └──────────────────┘     │ createdAt   │
│ geminiApiKey│                              └─────────────┘
│ createdAt   │     ┌──────────────────┐              │
│ updatedAt   │────►│     Prompt       │              │
└─────────────┘     ├──────────────────┤              │
        │           │ id (UUID)        │              │
        │           │ userId (FK)      │              │
        │           │ messageId (FK)   │──────────────┘
        │           │ originalInput    │
        │           │ structuredPrompt │
        │           │ metadata         │
        │           │ createdAt        │
        │           └──────────────────┘
        │
        │           ┌──────────────────┐
        └──────────►│  UploadedFile    │
                    ├──────────────────┤
                    │ id (UUID)        │
                    │ userId (FK)      │
                    │ messageId (FK)   │
                    │ geminiFileId     │
                    │ originalName     │
                    │ displayName      │
                    │ mimeType         │
                    │ sizeBytes        │
                    │ uri              │
                    │ cloudinaryUrl    │
                    │ createdAt        │
                    │ updatedAt        │
                    └──────────────────┘
```

### Key Database Features

- **UUID Primary Keys**: All entities use UUID for better security and distribution
- **Foreign Key Constraints**: Proper relationships with cascading deletes
- **Indexing Strategy**: Optimized indexes for queries and performance
- **Soft Deletes**: Preserve data integrity with soft deletion patterns
- **Audit Trails**: Created/updated timestamps on all entities
- **JSON Metadata**: Flexible metadata storage for extensibility

### Database Schema Details

#### Users Table

- Stores user profile information from Clerk
- Links to user's personal Gemini API key
- Tracks user creation and updates
- One-to-many relationships with conversations, prompts, and files

#### Conversations Table

- Represents chat conversations
- Belongs to a specific user
- Contains conversation metadata and title
- Has many messages

#### Messages Table

- Stores individual chat messages
- Supports USER and ASSISTANT roles
- Contains message content and metadata
- Links to uploaded files and prompts

#### Prompts Table

- Stores optimized prompt structures
- Links original input to structured output
- Contains metadata about optimization process
- Optional link to specific messages

#### UploadedFiles Table

- Manages file uploads for conversations
- Integrates with both Gemini File API and Cloudinary
- Tracks file metadata and storage locations
- Supports various file types (images, documents)

#### UserSessions Table

- Manages user session state
- Integrates with Clerk token management
- Tracks session activity and expiration
- Supports session cleanup and security

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/prompt-assistant.git
cd prompt-assistant
```

### 2. Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit environment files with your values
```

### 3. Required Environment Variables

#### Root `.env`

```bash
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/prompt_assistant"
REDIS_URL="redis://localhost:6379"
```

#### Frontend `.env.local`

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
```

#### Backend `.env`

```bash
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/prompt_assistant"
CLERK_SECRET_KEY="your-clerk-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### 4. Installation & Setup

#### Option A: Docker Compose (Recommended)

```bash
# Install dependencies
npm run install:all

# Start all services with Docker
npm run docker:up

# Run database migrations
npm run db:migrate

# (Optional) Seed database
npm run db:seed
```

#### Option B: Manual Setup

```bash
# Install dependencies
npm run install:all

# Start PostgreSQL and Redis locally
# Then run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Database Studio**: `npm run db:studio`

## 📖 API Documentation

### Authentication

All API endpoints require authentication via Clerk. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <clerk-session-token>
```

### Core Endpoints

#### Conversations

- `GET /api/conversations` - List user conversations with pagination
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `PUT /api/conversations/:id` - Update conversation title
- `DELETE /api/conversations/:id` - Delete conversation

#### Messages

- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send new message
- `DELETE /api/messages/:id` - Delete message

#### Prompts

- `GET /api/prompts` - List user prompts
- `POST /api/prompts/optimize` - Optimize a prompt
- `GET /api/prompts/:id` - Get prompt details

#### Files

- `POST /api/files/upload` - Upload file for AI processing
- `GET /api/files/:id` - Get file details
- `DELETE /api/files/:id` - Delete file

#### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings/api-key` - Update Gemini API key
- `POST /api/settings/api-key/test` - Test API key validity

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}
```

## 🎨 UI/UX Features

### Design System

- **Color Palette**: Comprehensive dark/light theme support
- **Typography**: Inter font family with responsive scaling
- **Spacing**: Consistent 8px grid system
- **Icons**: Lucide React icon library
- **Animations**: Smooth transitions and micro-interactions

### Responsive Design

- **Mobile First**: Optimized for mobile devices (320px+)
- **Tablet Support**: Enhanced layout for tablets (768px+)
- **Desktop Experience**: Full-featured desktop interface (1024px+)
- **Breakpoints**: Tailwind CSS responsive breakpoints

### Accessibility

- **WCAG 2.1 Compliance**: Level AA accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **High Contrast**: Support for high contrast themes
- **Focus Management**: Visible focus indicators

### Dark Mode Implementation

- **System Preference**: Automatic detection of system theme
- **Manual Toggle**: User-controlled theme switching
- **Persistent State**: Theme preference saved to localStorage
- **Component Coverage**: All components support both themes
- **Smooth Transitions**: Animated theme transitions

## 🔧 Development

### Project Structure

```
prompt-assistant/
├── frontend/               # Next.js frontend application
├── backend/               # NestJS backend API
├── shared/                # Shared types and utilities
├── database/              # Database scripts and migrations
├── docker/                # Docker configuration files
├── docs/                  # Additional documentation
└── scripts/               # Build and deployment scripts
```

### Development Scripts

```bash
# Development
npm run dev                # Start both frontend and backend
npm run dev:frontend       # Start only frontend
npm run dev:backend        # Start only backend

# Building
npm run build              # Build both applications
npm run build:frontend     # Build frontend only
npm run build:backend      # Build backend only

# Testing
npm run test               # Run all tests
npm run test:frontend      # Run frontend tests
npm run test:backend       # Run backend tests

# Linting
npm run lint               # Lint all code
npm run lint:frontend      # Lint frontend code
npm run lint:backend       # Lint backend code

# Database
npm run db:migrate         # Run database migrations
npm run db:reset           # Reset database
npm run db:seed            # Seed database with sample data
npm run db:studio          # Open Prisma Studio
```

### Code Style & Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Extended configurations for React and Node.js
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages
- **Husky**: Pre-commit hooks for quality assurance

### Testing Strategy

- **Unit Tests**: Jest for component and service testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for end-to-end testing
- **Coverage**: Minimum 80% code coverage target

## 🚢 Deployment

### Production Environment Variables

Ensure all environment variables are properly configured for production:

```bash
# Security
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
HELMET_ENABLED=true

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
CLERK_SECRET_KEY=your-production-clerk-secret
CLERK_WEBHOOK_SECRET=your-production-webhook-secret

# AI Services
GEMINI_API_KEY=your-production-gemini-key

# File Storage
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret
```

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

### Database Migrations

```bash
# Production migration
npm run prisma:deploy

# Backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔐 Security

### Authentication & Authorization

- **Clerk Integration**: Secure user authentication and session management
- **JWT Tokens**: Stateless authentication with proper validation
- **Role-Based Access**: User permissions and access control
- **Session Security**: Secure session handling and cleanup

### API Security

- **Rate Limiting**: Request throttling to prevent abuse
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Helmet Integration**: Security headers and protection
- **SQL Injection Prevention**: Parameterized queries with Prisma

### Data Protection

- **Encryption**: Sensitive data encryption at rest
- **Secure Headers**: Security-focused HTTP headers
- **Environment Variables**: Secure configuration management
- **File Upload Security**: Validated and sanitized file uploads

## 📊 Performance

### Frontend Optimizations

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component with optimization
- **Lazy Loading**: Component and route-based lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Effective browser and CDN caching strategies

### Backend Optimizations

- **Database Indexing**: Optimized database queries and indexes
- **Redis Caching**: Application-level caching with Redis
- **Connection Pooling**: Efficient database connection management
- **Compression**: Response compression with gzip
- **Query Optimization**: Efficient Prisma query patterns

### Monitoring & Analytics

- **Health Checks**: Endpoint health monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time and throughput monitoring
- **User Analytics**: User behavior and engagement tracking

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with proper tests
4. Commit using conventional commits: `git commit -m "feat: add new feature"`
5. Push to your branch: `git push origin feature/your-feature-name`
6. Create a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure accessibility compliance
- Follow the established code style

### Code Review Process

- All changes require code review
- Automated tests must pass
- Documentation must be updated
- Performance impact must be considered

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **NestJS Team** - For the robust Node.js framework
- **Clerk** - For authentication and user management
- **Google** - For the Gemini AI API
- **Vercel** - For deployment and hosting solutions
- **Contributors** - For their valuable contributions

## 📞 Support

### Getting Help

- **Documentation**: Check this README and API docs
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: contact@your-domain.com

---

## 🚀 Quick Start Summary

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/prompt-assistant.git
cd prompt-assistant
cp .env.example .env

# 2. Install dependencies
npm run install:all

# 3. Start with Docker (recommended)
npm run docker:up
npm run db:migrate

# 4. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

**Ready to optimize your prompts? Start building better AI interactions today!** 🎯
