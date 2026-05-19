# Aquaflow — Wastewater Compliance Platform

> Real-time IoT monitoring + AI breach prediction + automated compliance reporting

## Demo
[Live Demo Link] | [Pitch Video Link]

## Quick Start
### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+

### 1. Clone & Install
```bash
git clone https://github.com/Amogh-007-Rin/aquaflow
cd aquaflow\client
npm install
cd ..\ai-engine
pip install -r requirements.txt
```

### 2. Database Setup
```bash
cd client
copy .env.local.example .env.local
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 3. Start Services
```bash
# Terminal 1 — AI Engine
cd ai-engine
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

## Architecture
- **Frontend:** Next.js App Router + TypeScript + Tailwind CSS + Recharts + React Leaflet
- **Backend:** FastAPI + APScheduler + prediction engine + report generation
- **Data:** Prisma/Postgres for application data
- **Realtime:** SSE stream proxied through Next.js API route

## Compliance Parameters
Section 82 thresholds are defined in `client/lib/constants.ts` and cover pH, COD, BOD, TSS, temperature, ammonia, and heavy metals.

## API Reference
- FastAPI docs: `http://localhost:8000/docs`
- Frontend API routes: `client/app/api`
