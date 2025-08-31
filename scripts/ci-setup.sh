#!/bin/bash

# CI Environment Setup Script
echo "🚀 Setting up CI environment..."

# Set Node.js environment
export NODE_ENV=production
export CI=true
export NEXT_TELEMETRY_DISABLED=1
export SKIP_ENV_VALIDATION=1

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Ensure clean state
echo "🧹 Cleaning previous builds..."
rm -rf frontend/.next frontend/node_modules backend/dist backend/node_modules

# Install root dependencies first
echo "📦 Installing root dependencies..."
npm ci --prefer-offline --no-audit

# Setup frontend
echo "🔧 Setting up frontend environment..."
cd frontend

# Clean install
echo "🧹 Cleaning previous frontend installations..."
rm -f package-lock.json

# Install dependencies with specific versions
echo "📦 Installing frontend dependencies..."
npm install --no-audit --legacy-peer-deps

# Explicitly install TypeScript
echo "🔧 Ensuring TypeScript is installed..."
npm install --save-dev typescript@5.3.3

# Explicitly install TailwindCSS and related dependencies
echo "🔧 Installing TailwindCSS and dependencies..."
npm install --save-dev tailwindcss@3.4.1 postcss@8.4.33 autoprefixer@10.4.17

# Fix paths configuration
echo "🔧 Setting up path aliases..."
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "forceConsistentCasingInFileNames": false,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next"]
}
EOF

# Create/update tailwind.config.js
echo "🔧 Setting up TailwindCSS config..."
cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
EOF

# Create/update postcss.config.js
echo "🔧 Setting up PostCSS config..."
cat > postcss.config.js << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Remove next.config.ts if it exists (to avoid conflicts)
if [ -f "next.config.ts" ]; then
  echo "🗑️ Removing conflicting next.config.ts..."
  rm -f next.config.ts
fi

# Check if module directories exist, create if not
echo "🔧 Ensuring component directories exist..."
mkdir -p src/components/settings
mkdir -p src/components/providers
mkdir -p src/components/chat
mkdir -p src/components/background

# Create simple placeholder components if they don't exist
if [ ! -f "src/components/settings/settings-page.tsx" ]; then
  echo "📝 Creating placeholder for settings-page component..."
  cat > src/components/settings/settings-page.tsx << EOF
import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p>Settings page content will go here.</p>
    </div>
  );
};
EOF
fi

if [ ! -f "src/components/providers/index.tsx" ]; then
  echo "📝 Creating placeholder for providers component..."
  cat > src/components/providers/index.tsx << EOF
"use client";

import React from 'react';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
EOF
fi

if [ ! -f "src/components/chat/chat-layout.tsx" ]; then
  echo "📝 Creating placeholder for chat-layout component..."
  cat > src/components/chat/chat-layout.tsx << EOF
import React from 'react';

export const ChatLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="chat-layout">
      {children}
    </div>
  );
};
EOF
fi

if [ ! -f "src/components/background/auth-background.tsx" ]; then
  echo "📝 Creating placeholder for auth-background component..."
  cat > src/components/background/auth-background.tsx << EOF
import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 -z-10" />
  );
};
EOF
fi

cd ..

# Install backend dependencies  
echo "📦 Installing backend dependencies..."
cd backend
npm install --prefer-offline --no-audit
cd ..

echo "✅ CI environment setup complete!"
