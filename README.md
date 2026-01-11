# 🌟 Ziggy Alpha Hub

**Personal Alpha-style learning platform for Ziggy**

A comprehensive learning management system that orchestrates multiple learning tracks with mastery-based progression and spaced repetition.

![Ziggy Alpha Hub](https://img.shields.io/badge/Status-MVP-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## 📚 Features

### Learning Tracks
- **11+ Coach** - UK 11+ preparation (Maths, English, VR, NVR)
- **Coding Coach** - Python-first programming with projects
- **Animation Track** - Digital art & animation basics
- **Digital Health** - Health literacy & wellbeing

### Core Capabilities
- ✅ Mastery-based progression (no moving on without evidence)
- ✅ Spaced Repetition System (SRS) for optimal retention
- ✅ Daily "Today" plan that blends review + new learning
- ✅ Parent dashboard ("control tower") for progress tracking
- ✅ RAG status (Red/Amber/Green) for quick gap identification
- ✅ TrackSpec configuration system for extensibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd ziggy-alpha-hub
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

3. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open in browser**
- Landing: http://localhost:3000
- Login: http://localhost:3000/login
- Learner View: http://localhost:3000/today
- Parent Dashboard: http://localhost:3000/parent/dashboard

### Demo Credentials
```
Email: joseph@ziggyalpha.com
Password: ziggy2024
```

## 📁 Project Structure

```
ziggy-alpha-hub/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Database seeding script
│   └── seed-data/          # TrackSpec JSON configs
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── today/          # Learner daily plan
│   │   ├── practice/       # Question answering flow
│   │   ├── parent/         # Parent dashboard
│   │   └── login/          # Authentication
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utilities (Prisma, Auth)
│   ├── services/           # Business logic
│   │   ├── mastery.ts      # Mastery calculation
│   │   ├── srs.ts          # Spaced repetition
│   │   ├── planner.ts      # Daily plan generation
│   │   └── scoring.ts      # Attempt scoring
│   └── types/              # TypeScript definitions
└── package.json
```

## 🔧 Configuration

### Adding New Tracks

Tracks are defined via TrackSpec JSON files in `prisma/seed-data/`. Example:

```json
{
  "track_id": "track_new",
  "name": "New Track",
  "description": "Description here",
  "time_priority": "core_skill",
  "default_weekly_minutes": 120,
  "icon": "📚",
  "color": "#3B82F6",
  "subjects": [...],
  "topics": [...]
}
```

### Mastery Thresholds

Default mastery rules (configurable per topic):
- **Red**: < 60% accuracy
- **Amber**: 60-79% accuracy
- **Green**: ≥ 80% accuracy
- **Mastered**: Green + min attempts + time span requirements

### SRS Algorithm

Based on SM-2 algorithm with:
- Default ease factor: 2.5
- Min ease factor: 1.3
- Interval multiplied by ease on correct
- Interval reset to 1 on incorrect

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Learner
- `GET /api/learners/:id/today-plan` - Get daily learning plan
- `GET /api/learners/:id/mastery` - Get mastery states

### Items & Attempts
- `GET /api/items?ids=...` - Fetch items by ID
- `POST /api/items` - Query items by criteria
- `POST /api/attempts` - Submit an answer attempt

### Parent
- `GET /api/parent/:id/overview` - Dashboard overview

### Tracks
- `GET /api/tracks` - List all tracks with subjects

## 🎨 UI Components

### Learner Theme (Kid-Friendly)
- Warm, playful color palette
- Rounded corners and soft shadows
- Encouraging feedback and animations
- Simple "do this now" flow

### Parent Theme (Professional)
- Clean, data-dense dashboard
- RAG status indicators
- Detailed mastery tables
- Progress tracking charts

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with initial data
```

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Styling**: Tailwind CSS
- **Auth**: JWT with HTTP-only cookies

## 📝 License

MIT License - Built with 💜 for Ziggy's learning journey.

## 🙏 Acknowledgments

Inspired by Alpha School's mastery-based learning approach and built to support personalized education at home.
