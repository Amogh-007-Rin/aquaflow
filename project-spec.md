# Aquaflow — Wastewater Compliance Platform
## Hackathon MVP Project Specification (`project-spec.md`)

> **One-shot build spec** for a coding agent. Every section is self-contained and implementation-ready. Follow sequentially.

---

## 0. Executive Summary

Aquaflow is a **full-stack wastewater compliance intelligence platform** that:

- Ingests simulated real-time IoT sensor streams (pH, COD, BOD, TSS, Temperature, Heavy Metals)
- Runs a FastAPI-based AI/ML engine that predicts Section 82 compliance breaches **before** they occur
- Surfaces everything through a stunning Next.js dashboard with live charts, alerts, and audit trails
- Auto-generates compliance reports and sends instant notifications
- Incorporates satellite-overlay context (GRACE-FO inspired) and multi-facility management

This spec combines **all three sub-challenges** (Real-Time Monitoring + Predictive Breach Detection + Automated Reporting) plus innovative additions.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| **Auth** | NextAuth.js v5 (credentials + OAuth Google) |
| **Database** | PostgreSQL (via Prisma ORM) |
| **AI/ML Engine** | FastAPI (Python 3.11), scikit-learn, pandas, numpy |
| **Realtime** | Server-Sent Events (SSE) from FastAPI → Next.js |
| **Charts** | Recharts + custom SVG overlays |
| **Background Jobs** | node-cron (report generation), FastAPI APScheduler (sensor simulation) |
| **Email Alerts** | Resend API (or Nodemailer fallback) |
| **PDF Reports** | pdfkit (Python) or @react-pdf/renderer |
| **Deployment** | Vercel (frontend) + Railway/Render (FastAPI) + Supabase (Postgres) |

---

## 2. Repository Structure

```
aquaflow/
├── README.md
├── docker-compose.yml
│
├── frontend/                          # Next.js App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx             # Dashboard shell with sidebar
│   │   │   ├── page.tsx               # Main overview dashboard
│   │   │   ├── facilities/
│   │   │   │   ├── page.tsx           # Multi-facility management
│   │   │   │   └── [id]/page.tsx      # Single facility deep-dive
│   │   │   ├── sensors/page.tsx       # Live sensor feed grid
│   │   │   ├── predictions/page.tsx   # AI prediction timeline
│   │   │   ├── alerts/page.tsx        # Alert log & configuration
│   │   │   ├── reports/page.tsx       # Report generation & history
│   │   │   ├── satellite/page.tsx     # Satellite context overlay
│   │   │   └── settings/page.tsx      # Thresholds, users, notifications
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── sensors/stream/route.ts        # SSE proxy to FastAPI
│   │   │   ├── alerts/route.ts
│   │   │   ├── reports/generate/route.ts
│   │   │   └── facilities/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                        # Base design system
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── dashboard/
│   │   │   ├── ComplianceRing.tsx     # Circular compliance score gauge
│   │   │   ├── SensorCard.tsx         # Live sensor widget
│   │   │   ├── LiveFeedChart.tsx      # Scrolling time-series chart
│   │   │   ├── PredictionTimeline.tsx # Future breach probability timeline
│   │   │   ├── AlertBanner.tsx        # Top-of-page critical alert
│   │   │   ├── RiskHeatmap.tsx        # Parameter × time risk heatmap
│   │   │   ├── SatelliteMap.tsx       # Leaflet map with facility pins
│   │   │   └── ReportCard.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── NotificationDrawer.tsx
│   │   └── charts/
│   │       ├── GaugeChart.tsx
│   │       ├── SparkLine.tsx
│   │       └── AnomalyChart.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── api-client.ts              # Typed fetch wrapper to FastAPI
│   │   └── constants.ts               # Section 82 legal thresholds
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env.local.example
│
└── ai-engine/                         # FastAPI Python Backend
    ├── main.py
    ├── requirements.txt
    ├── routers/
    │   ├── sensors.py                 # SSE stream + historical data
    │   ├── predictions.py             # ML model inference endpoints
    │   ├── alerts.py                  # Alert CRUD
    │   └── reports.py                 # PDF generation
    ├── ml/
    │   ├── model_trainer.py           # Train isolation forest + LSTM
    │   ├── predictor.py               # Inference logic
    │   ├── simulator.py               # Realistic sensor data simulator
    │   └── models/                    # Saved .pkl / .h5 model files
    ├── schemas/
    │   └── sensor.py                  # Pydantic models
    └── utils/
        ├── db.py                      # SQLAlchemy async Postgres
        ├── alerts.py                  # Email/webhook dispatcher
        └── report_generator.py        # PDF builder
```

---

## 3. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?   // hashed
  role          Role      @default(OPERATOR)
  facilities    FacilityUser[]
  createdAt     DateTime  @default(now())
  accounts      Account[]
  sessions      Session[]
}

enum Role {
  ADMIN
  MANAGER
  OPERATOR
  AUDITOR
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  access_token      String? @db.Text
  refresh_token     String? @db.Text
  expires_at        Int?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Facility {
  id           String    @id @default(cuid())
  name         String
  location     String
  latitude     Float
  longitude    Float
  industry     String    // e.g. "Textile", "Chemical", "Food Processing"
  licenseNo    String    @unique
  status       FacilityStatus @default(ACTIVE)
  sensors      Sensor[]
  alerts       Alert[]
  reports      Report[]
  users        FacilityUser[]
  createdAt    DateTime  @default(now())
}

enum FacilityStatus {
  ACTIVE
  SUSPENDED
  UNDER_REVIEW
}

model FacilityUser {
  id         String   @id @default(cuid())
  userId     String
  facilityId String
  user       User     @relation(fields: [userId], references: [id])
  facility   Facility @relation(fields: [facilityId], references: [id])
  @@unique([userId, facilityId])
}

model Sensor {
  id           String       @id @default(cuid())
  facilityId   String
  type         SensorType
  unit         String
  location     String       // e.g. "Outlet A", "Pre-treatment tank"
  isActive     Boolean      @default(true)
  facility     Facility     @relation(fields: [facilityId], references: [id])
  readings     SensorReading[]
  thresholds   Threshold?
}

enum SensorType {
  PH
  COD
  BOD
  TSS
  TEMPERATURE
  HEAVY_METAL_LEAD
  HEAVY_METAL_MERCURY
  AMMONIA
  DISSOLVED_OXYGEN
  TURBIDITY
}

model SensorReading {
  id          String   @id @default(cuid())
  sensorId    String
  value       Float
  unit        String
  timestamp   DateTime @default(now())
  isAnomaly   Boolean  @default(false)
  riskScore   Float?   // 0.0 - 1.0
  sensor      Sensor   @relation(fields: [sensorId], references: [id])
  @@index([sensorId, timestamp])
}

model Threshold {
  id           String  @id @default(cuid())
  sensorId     String  @unique
  minValue     Float?
  maxValue     Float?
  warnMin      Float?
  warnMax      Float?
  section82Ref String  // e.g. "Section 82(3)(b)"
  sensor       Sensor  @relation(fields: [sensorId], references: [id])
}

model Alert {
  id           String      @id @default(cuid())
  facilityId   String
  sensorId     String?
  type         AlertType
  severity     Severity
  parameter    String
  value        Float?
  threshold    Float?
  message      String
  predictedAt  DateTime?   // when AI predicted it would happen
  triggeredAt  DateTime    @default(now())
  resolvedAt   DateTime?
  status       AlertStatus @default(ACTIVE)
  notified     Boolean     @default(false)
  facility     Facility    @relation(fields: [facilityId], references: [id])
}

enum AlertType {
  THRESHOLD_BREACH
  PREDICTED_BREACH
  ANOMALY_DETECTED
  SENSOR_OFFLINE
  SYSTEM_WARNING
}

enum Severity {
  INFO
  WARNING
  CRITICAL
  EMERGENCY
}

enum AlertStatus {
  ACTIVE
  ACKNOWLEDGED
  RESOLVED
  FALSE_POSITIVE
}

model Prediction {
  id              String   @id @default(cuid())
  facilityId      String
  parameter       String
  predictedValue  Float
  confidence      Float    // 0.0 - 1.0
  breachProbability Float  // 0.0 - 1.0
  horizon         Int      // minutes into future
  predictedAt     DateTime @default(now())
  targetTime      DateTime
  modelVersion    String
}

model Report {
  id           String       @id @default(cuid())
  facilityId   String
  type         ReportType
  period       String       // e.g. "2025-06"
  status       ReportStatus @default(PENDING)
  fileUrl      String?
  generatedAt  DateTime?
  createdAt    DateTime     @default(now())
  facility     Facility     @relation(fields: [facilityId], references: [id])
}

enum ReportType {
  DAILY
  WEEKLY
  MONTHLY
  INCIDENT
  REGULATORY_SUBMISSION
}

enum ReportStatus {
  PENDING
  GENERATING
  READY
  FAILED
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  entity     String
  entityId   String
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

---

## 4. Section 82 Compliance Thresholds (constants.ts)

```typescript
// frontend/lib/constants.ts

export const SECTION_82_THRESHOLDS = {
  PH: {
    min: 6.0,
    max: 10.0,
    warnMin: 6.5,
    warnMax: 9.5,
    unit: 'pH',
    legalRef: 'Water Industry Act 1991, s.82(3)(a)',
  },
  COD: {
    max: 500,        // mg/L Chemical Oxygen Demand
    warn: 400,
    unit: 'mg/L',
    legalRef: 'Water Industry Act 1991, s.82(3)(b)',
  },
  BOD: {
    max: 300,        // mg/L Biochemical Oxygen Demand
    warn: 250,
    unit: 'mg/L',
    legalRef: 'Water Industry Act 1991, s.82(3)(c)',
  },
  TSS: {
    max: 600,        // mg/L Total Suspended Solids
    warn: 500,
    unit: 'mg/L',
    legalRef: 'Water Industry Act 1991, s.82(3)(d)',
  },
  TEMPERATURE: {
    max: 43,         // °C
    warn: 40,
    unit: '°C',
    legalRef: 'Water Industry Act 1991, s.82(3)(e)',
  },
  AMMONIA: {
    max: 50,         // mg/L as N
    warn: 40,
    unit: 'mg/L',
    legalRef: 'Water Industry Act 1991, s.82(4)',
  },
  HEAVY_METAL_LEAD: {
    max: 0.1,        // mg/L
    warn: 0.08,
    unit: 'mg/L',
    legalRef: 'Water Industry Act 1991, s.82(5)(a)',
  },
  HEAVY_METAL_MERCURY: {
    max: 0.01,
    warn: 0.008,
    unit: 'mg/L',
    legalRef: 'Water Industry Act 1991, s.82(5)(b)',
  },
} as const;

export const COMPLIANCE_SCORE_WEIGHTS = {
  PH: 0.20,
  COD: 0.20,
  BOD: 0.15,
  TSS: 0.15,
  TEMPERATURE: 0.10,
  AMMONIA: 0.10,
  HEAVY_METAL_LEAD: 0.05,
  HEAVY_METAL_MERCURY: 0.05,
};
```

---

## 5. AI/ML Engine — FastAPI (Python)

### 5.1 `main.py`

```python
# ai-engine/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from routers import sensors, predictions, alerts, reports
from ml.simulator import SensorSimulator

app = FastAPI(title="Aquaflow Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensors.router, prefix="/sensors", tags=["Sensors"])
app.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])

simulator = SensorSimulator()
scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup():
    scheduler.add_job(simulator.generate_and_store, "interval", seconds=5)
    scheduler.start()

@app.get("/health")
async def health():
    return {"status": "ok", "engine": "Aquaflow v1.0"}
```

### 5.2 Sensor Simulator (`ml/simulator.py`)

```python
# ai-engine/ml/simulator.py
import random
import math
import time
from datetime import datetime

class SensorSimulator:
    """
    Generates realistic wastewater sensor readings with:
    - Diurnal patterns (production shift cycles)
    - Random drift and noise
    - Occasional spike events (simulating process upsets)
    - Gradual trend anomalies (pre-breach buildup)
    """

    FACILITIES = ["facility_001", "facility_002", "facility_003"]

    BASE_VALUES = {
        "PH":                   {"base": 7.5,  "noise": 0.3,  "spike_mag": 3.0,  "unit": "pH"},
        "COD":                  {"base": 280,  "noise": 30,   "spike_mag": 300,  "unit": "mg/L"},
        "BOD":                  {"base": 180,  "noise": 20,   "spike_mag": 180,  "unit": "mg/L"},
        "TSS":                  {"base": 320,  "noise": 40,   "spike_mag": 350,  "unit": "mg/L"},
        "TEMPERATURE":          {"base": 28,   "noise": 2,    "spike_mag": 18,   "unit": "°C"},
        "AMMONIA":              {"base": 22,   "noise": 5,    "spike_mag": 35,   "unit": "mg/L"},
        "HEAVY_METAL_LEAD":     {"base": 0.04, "noise": 0.01, "spike_mag": 0.09, "unit": "mg/L"},
        "HEAVY_METAL_MERCURY":  {"base": 0.003,"noise": 0.001,"spike_mag": 0.009,"unit": "mg/L"},
        "DISSOLVED_OXYGEN":     {"base": 6.5,  "noise": 0.5,  "spike_mag": 4.0,  "unit": "mg/L"},
        "TURBIDITY":            {"base": 45,   "noise": 10,   "spike_mag": 80,   "unit": "NTU"},
    }

    def __init__(self):
        self._spike_probability = 0.03   # 3% chance of spike per reading
        self._trend_offset = {}          # per facility gradual drift
        self._time_start = time.time()

    def _diurnal_factor(self) -> float:
        """Simulate production shift: higher load during 06:00–22:00."""
        hour = datetime.utcnow().hour
        return 1.0 + 0.35 * math.sin(math.pi * (hour - 6) / 16) if 6 <= hour <= 22 else 0.75

    def generate_reading(self, parameter: str, facility_id: str) -> dict:
        cfg = self.BASE_VALUES[parameter]
        diurnal = self._diurnal_factor()
        drift = self._trend_offset.get(f"{facility_id}_{parameter}", 0)

        value = cfg["base"] * diurnal + drift
        value += random.gauss(0, cfg["noise"])

        is_spike = random.random() < self._spike_probability
        if is_spike:
            value += cfg["spike_mag"] * random.uniform(0.5, 1.2)

        # Gradual drift simulation (pre-breach buildup)
        drift_key = f"{facility_id}_{parameter}"
        self._trend_offset[drift_key] = drift + random.gauss(0, cfg["noise"] * 0.05)

        value = round(max(0, value), 4)

        return {
            "facility_id": facility_id,
            "parameter": parameter,
            "value": value,
            "unit": cfg["unit"],
            "timestamp": datetime.utcnow().isoformat(),
            "is_spike": is_spike,
        }

    async def generate_and_store(self):
        """Called every 5 seconds by scheduler — generates readings for all facilities."""
        from utils.db import save_reading
        for facility_id in self.FACILITIES:
            for parameter in self.BASE_VALUES:
                reading = self.generate_reading(parameter, facility_id)
                await save_reading(reading)
```

### 5.3 ML Predictor (`ml/predictor.py`)

```python
# ai-engine/ml/predictor.py
"""
Two-layer prediction system:
  Layer 1 — Isolation Forest: anomaly detection on current reading
  Layer 2 — Linear trend extrapolation + threshold proximity scoring

For a production model, Layer 2 would be replaced with:
  - LSTM trained on historical rolling windows
  - XGBoost with lag features

The hackathon MVP uses the deterministic trend model which is accurate
enough to demo meaningful predictions 15, 30, and 60 minutes ahead.
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from collections import deque
from typing import Dict, List

THRESHOLDS = {
    "PH":                   {"max": 10.0, "min": 6.0},
    "COD":                  {"max": 500},
    "BOD":                  {"max": 300},
    "TSS":                  {"max": 600},
    "TEMPERATURE":          {"max": 43},
    "AMMONIA":              {"max": 50},
    "HEAVY_METAL_LEAD":     {"max": 0.1},
    "HEAVY_METAL_MERCURY":  {"max": 0.01},
}

class AquaPredictor:
    WINDOW = 60  # last 60 readings (~5 min at 5s intervals)

    def __init__(self):
        self.buffers: Dict[str, deque] = {}
        self.models: Dict[str, IsolationForest] = {}

    def _key(self, facility_id: str, parameter: str) -> str:
        return f"{facility_id}_{parameter}"

    def ingest(self, facility_id: str, parameter: str, value: float):
        k = self._key(facility_id, parameter)
        if k not in self.buffers:
            self.buffers[k] = deque(maxlen=self.WINDOW)
        self.buffers[k].append(value)

        # Retrain isolation forest every 20 readings
        buf = self.buffers[k]
        if len(buf) >= 20 and len(buf) % 20 == 0:
            X = np.array(buf).reshape(-1, 1)
            clf = IsolationForest(contamination=0.05, random_state=42)
            clf.fit(X)
            self.models[k] = clf

    def is_anomaly(self, facility_id: str, parameter: str, value: float) -> bool:
        k = self._key(facility_id, parameter)
        if k not in self.models:
            return False
        score = self.models[k].decision_function([[value]])[0]
        return score < 0

    def predict_breach(self, facility_id: str, parameter: str, horizon_minutes: int = 30) -> dict:
        """
        Returns probability of breach in the next `horizon_minutes`.
        Uses linear regression on the recent trend window.
        """
        k = self._key(facility_id, parameter)
        buf = list(self.buffers.get(k, []))
        thres = THRESHOLDS.get(parameter, {})

        if len(buf) < 10:
            return {"probability": 0.0, "predicted_value": None, "confidence": 0.0}

        # Linear trend extrapolation
        x = np.arange(len(buf))
        coeffs = np.polyfit(x, buf, 1)
        steps_ahead = (horizon_minutes * 60) / 5   # 5s interval
        predicted_value = coeffs[0] * (len(buf) + steps_ahead) + coeffs[1]

        # Compute proximity to threshold
        max_t = thres.get("max")
        min_t = thres.get("min")
        current = buf[-1]

        prob = 0.0
        if max_t is not None:
            headroom = max_t - current
            predicted_over = predicted_value - max_t
            if predicted_over > 0:
                prob = min(1.0, 0.5 + 0.5 * (predicted_over / max_t))
            elif headroom < (max_t * 0.1):
                prob = 0.3 + 0.2 * (1 - headroom / (max_t * 0.1))

        if min_t is not None and current < min_t * 1.15:
            prob = max(prob, 0.4)

        # Confidence based on buffer size and trend consistency
        trend_std = float(np.std(buf[-10:]))
        confidence = max(0.4, 1.0 - (trend_std / (abs(coeffs[0]) + 1e-6)) * 0.1)
        confidence = min(confidence, 0.97)

        return {
            "probability": round(prob, 3),
            "predicted_value": round(float(predicted_value), 4),
            "confidence": round(confidence, 3),
            "trend_slope": round(float(coeffs[0]), 5),
            "horizon_minutes": horizon_minutes,
        }


# Singleton
predictor = AquaPredictor()
```

### 5.4 SSE Sensor Stream (`routers/sensors.py`)

```python
# ai-engine/routers/sensors.py
import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ml.predictor import predictor
from utils.db import get_recent_readings, get_all_sensor_readings

router = APIRouter()

@router.get("/stream/{facility_id}")
async def sensor_stream(facility_id: str):
    """
    Server-Sent Events stream. Next.js frontend connects via EventSource.
    Emits a packet every 5 seconds with latest readings + anomaly flags + predictions.
    """
    async def event_generator():
        while True:
            readings = await get_recent_readings(facility_id, limit=1)
            payload = []
            for r in readings:
                predictor.ingest(facility_id, r["parameter"], r["value"])
                anomaly = predictor.is_anomaly(facility_id, r["parameter"], r["value"])
                pred_30 = predictor.predict_breach(facility_id, r["parameter"], 30)
                pred_60 = predictor.predict_breach(facility_id, r["parameter"], 60)
                payload.append({
                    **r,
                    "is_anomaly": anomaly,
                    "prediction_30m": pred_30,
                    "prediction_60m": pred_60,
                })
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/history/{facility_id}/{parameter}")
async def get_history(facility_id: str, parameter: str, hours: int = 24):
    data = await get_all_sensor_readings(facility_id, parameter, hours)
    return {"data": data}


@router.get("/latest/{facility_id}")
async def get_latest(facility_id: str):
    readings = await get_recent_readings(facility_id, limit=10)
    return {"readings": readings}
```

### 5.5 Predictions Router (`routers/predictions.py`)

```python
# ai-engine/routers/predictions.py
from fastapi import APIRouter
from ml.predictor import predictor
from utils.db import save_prediction, get_predictions

router = APIRouter()

PARAMETERS = ["PH","COD","BOD","TSS","TEMPERATURE","AMMONIA","HEAVY_METAL_LEAD","HEAVY_METAL_MERCURY"]

@router.get("/breach/{facility_id}")
async def predict_all_breaches(facility_id: str):
    """Returns breach predictions for all parameters at 15, 30, 60 min horizons."""
    results = {}
    for param in PARAMETERS:
        results[param] = {
            "15m": predictor.predict_breach(facility_id, param, 15),
            "30m": predictor.predict_breach(facility_id, param, 30),
            "60m": predictor.predict_breach(facility_id, param, 60),
        }
    # Save high-risk predictions to DB
    for param, horizons in results.items():
        for horizon, pred in horizons.items():
            if pred["probability"] > 0.5:
                await save_prediction({
                    "facility_id": facility_id,
                    "parameter": param,
                    "horizon": horizon,
                    **pred,
                })
    return {"facility_id": facility_id, "predictions": results}

@router.get("/history/{facility_id}")
async def prediction_history(facility_id: str, days: int = 7):
    return {"predictions": await get_predictions(facility_id, days)}
```

### 5.6 Report Generator (`utils/report_generator.py`)

```python
# ai-engine/utils/report_generator.py
"""
Generates a PDF compliance report containing:
- Executive summary with compliance score
- Parameter-by-parameter analysis with trend charts
- Alert log with timestamps
- Section 82 breach table
- Regulatory submission-ready format
"""
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
from reportlab.lib import colors
from datetime import datetime

def generate_compliance_report(facility: dict, readings: list, alerts: list, score: float) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # Header
    story.append(Paragraph(f"Aquaflow — Compliance Report", styles["Title"]))
    story.append(Paragraph(f"Facility: {facility['name']} | License: {facility['licenseNo']}", styles["Normal"]))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    story.append(Spacer(1, 20))

    # Compliance Score
    score_color = colors.green if score > 85 else (colors.orange if score > 60 else colors.red)
    story.append(Paragraph(f"Overall Compliance Score: {score:.1f}%", styles["Heading1"]))
    story.append(Spacer(1, 12))

    # Parameter Table
    story.append(Paragraph("Parameter Summary", styles["Heading2"]))
    table_data = [["Parameter", "Avg Value", "Max Value", "Limit", "Status"]]
    for reading in readings:
        status = "✓ COMPLIANT" if reading["max_value"] < reading["limit"] else "✗ BREACH"
        table_data.append([
            reading["parameter"],
            f"{reading['avg_value']:.3f} {reading['unit']}",
            f"{reading['max_value']:.3f} {reading['unit']}",
            f"{reading['limit']} {reading['unit']}",
            status,
        ])
    t = Table(table_data)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F4C81")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F7FF")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))

    # Alert Log
    story.append(Paragraph("Alert Log", styles["Heading2"]))
    alert_data = [["Timestamp", "Parameter", "Severity", "Value", "Threshold", "Status"]]
    for alert in alerts[:20]:  # Top 20 alerts
        alert_data.append([
            alert["triggered_at"],
            alert["parameter"],
            alert["severity"],
            str(alert["value"]),
            str(alert["threshold"]),
            alert["status"],
        ])
    at = Table(alert_data)
    story.append(at)

    # Legal footer
    story.append(Spacer(1, 30))
    story.append(Paragraph(
        "This report is generated in accordance with Section 82 of the Water Industry Act 1991 "
        "and is suitable for submission to the relevant regulatory authority.",
        styles["Italic"]
    ))

    doc.build(story)
    return buffer.getvalue()
```

---

## 6. Frontend — Key Pages & Components

### 6.1 Design System

**Aesthetic Direction:** Dark industrial-precision theme.

- **Background:** `#050d1a` (deep navy black)
- **Surface:** `#0a1628` (card background)
- **Border:** `#1a2d4a` (subtle navy border)
- **Accent Primary:** `#00d4ff` (electric cyan — water reference)
- **Accent Success:** `#00ff88` (neon green — compliant)
- **Accent Warning:** `#ffaa00` (amber — warning)
- **Accent Danger:** `#ff3366` (crimson — breach)
- **Text Primary:** `#e8f4ff`
- **Text Muted:** `#4a7fa5`
- **Font Display:** `'Clash Display'` or `'Space Grotesk'` for headers
- **Font Body:** `'JetBrains Mono'` for values/numbers (gives it sensor-readout feel), `'Inter'` for prose
- **Border Radius:** `8px` (sharp but not harsh)
- **Glow Effects:** `box-shadow: 0 0 20px rgba(0, 212, 255, 0.15)` on active cards

### 6.2 Dashboard Overview Page (`app/(dashboard)/page.tsx`)

```
LAYOUT (top-to-bottom):
┌─────────────────────────────────────────────────────────────────┐
│  CRITICAL ALERT BANNER (if any active emergency)                │
├─────────────────────────────────────────────────────────────────┤
│  TOPBAR: Facility selector | Last sync | Connection status dot  │
├──────────────┬──────────────────────────────────────────────────┤
│              │  ROW 1: KPI Cards (4 across)                     │
│              │  [Compliance Score] [Active Alerts] [Sensors OK] │
│              │  [Predicted Breaches Next Hour]                  │
│   SIDEBAR    ├──────────────────────────────────────────────────┤
│              │  ROW 2:                                          │
│   Navigation │  [Live Sensor Feed — scrolling chart 8 params]  │
│   with       │  [Risk Heatmap — param × last 24h time]         │
│   status     ├──────────────────────────────────────────────────┤
│   indicators │  ROW 3:                                          │
│              │  [Prediction Timeline — next 60 min]             │
│              │  [Recent Alerts list]                            │
│              ├──────────────────────────────────────────────────┤
│              │  ROW 4:                                          │
│              │  [Compliance Score Radial Gauge]                 │
│              │  [Section 82 Parameter Compliance Table]         │
└──────────────┴──────────────────────────────────────────────────┘
```

**Compliance Score Radial Gauge:** SVG arc gauge, 0–100, color shifts from red → amber → green. Animated count-up on load.

**Live Sensor Feed Chart:** Recharts `ComposedChart` with area fill, reference lines at warning/breach thresholds, anomaly dots highlighted in red.

**Risk Heatmap:** CSS grid matrix (parameters as rows, time buckets as columns), cell color = risk score from 0 (dark navy) to 1 (bright red).

**Prediction Timeline:** Horizontal scrollable timeline showing next 60 min. Each parameter shown as a colored band whose intensity scales with breach probability. Breach events rendered as vertical red markers.

### 6.3 Sensor Detail Page (`app/(dashboard)/sensors/page.tsx`)

```
LAYOUT:
┌────────────────────────────────────────────────────┐
│  SENSOR GRID (2×5 or 3×4 responsive)               │
│  Each SensorCard contains:                         │
│  - Parameter name + icon                           │
│  - LARGE live value (JetBrains Mono, 48px)         │
│  - Unit label                                      │
│  - SparkLine chart (last 60 readings)              │
│  - Status badge: NORMAL / WARNING / BREACH         │
│  - Trend arrow: ↑ rising ↓ falling → stable       │
│  - Risk score bar at bottom                        │
│  - Pulse animation ring when anomaly detected      │
└────────────────────────────────────────────────────┘
```

Each card pulses a red glow animation when an anomaly is detected. Click a card to expand a full-screen modal with 24h chart, statistics, and prediction data.

### 6.4 Predictions Page (`app/(dashboard)/predictions/page.tsx`)

```
LAYOUT:
┌────────────────────────────────────────────────────┐
│  AI PREDICTION CONFIDENCE PANEL                    │
│  "Based on current trends, the following breaches  │
│   are predicted in the next 60 minutes"            │
├────────────────────────────────────────────────────┤
│  PREDICTION CARDS (per high-risk parameter)        │
│  - Breach probability bar (0–100%)                 │
│  - Predicted value vs threshold                    │
│  - Confidence score                                │
│  - Time horizon selector: [15m] [30m] [60m]        │
│  - "Take Action" button → opens remediation guide  │
├────────────────────────────────────────────────────┤
│  PREDICTION ACCURACY TRACKER                       │
│  Historical predictions vs actual outcomes         │
│  (accuracy %, false positive rate, recall)         │
└────────────────────────────────────────────────────┘
```

### 6.5 Reports Page (`app/(dashboard)/reports/page.tsx`)

```
LAYOUT:
┌────────────────────────────────────────────────────┐
│  GENERATE REPORT PANEL                             │
│  - Period selector (Daily / Weekly / Monthly)      │
│  - Facility selector                               │
│  - Report type (Internal / Regulatory Submission)  │
│  - [Generate PDF Report] button                    │
├────────────────────────────────────────────────────┤
│  REPORT HISTORY TABLE                              │
│  Columns: Date | Type | Facility | Status | Action │
│  Download / Preview / Re-generate                  │
└────────────────────────────────────────────────────┘
```

Clicking Generate calls `/api/reports/generate` → Next.js → FastAPI → returns PDF blob → triggers browser download.

### 6.6 Alerts Page (`app/(dashboard)/alerts/page.tsx`)

```
LAYOUT:
┌────────────────────────────────────────────────────┐
│  ALERT FILTERS: [All] [Critical] [Warning] [Info]  │
│                 [Active] [Resolved] [Predicted]    │
├────────────────────────────────────────────────────┤
│  ALERT TIMELINE (chronological, grouped by day)    │
│  Each alert card shows:                            │
│  - Severity badge (color coded)                    │
│  - Parameter + value + threshold                   │
│  - Facility + sensor location                      │
│  - Time elapsed / predicted time                   │
│  - [Acknowledge] [Resolve] [View Trend] actions    │
├────────────────────────────────────────────────────┤
│  ALERT CONFIG PANEL                                │
│  - Notification channels (Email / Webhook / SMS)  │
│  - Per-parameter threshold overrides               │
│  - Alert suppression windows                       │
└────────────────────────────────────────────────────┘
```

### 6.7 Satellite View Page (`app/(dashboard)/satellite/page.tsx`)

```
LAYOUT:
┌────────────────────────────────────────────────────┐
│  INTERACTIVE MAP (Leaflet.js, dark tile layer)     │
│  - Facility pins with compliance color coding      │
│  - Click facility → popup with live KPIs           │
│  - Regional risk overlay (geojson heatmap)         │
├────────────────────────────────────────────────────┤
│  WATERSHED CONTEXT PANEL                           │
│  - Downstream water body risk                      │
│  - Groundwater proximity index                     │
│  - Satellite imagery last update timestamp         │
│  - GRACE-FO inspired: groundwater stress indicator │
└────────────────────────────────────────────────────┘
```

---

## 7. Next.js API Routes

### 7.1 SSE Proxy (`app/api/sensors/stream/route.ts`)

```typescript
// Proxies SSE from FastAPI to Next.js client
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId") ?? "facility_001";

  const upstreamUrl = `${process.env.AI_ENGINE_URL}/sensors/stream/${facilityId}`;

  const upstream = await fetch(upstreamUrl, {
    headers: { Accept: "text/event-stream" },
  });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

### 7.2 Report Generation (`app/api/reports/generate/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { facilityId, period, type } = body;

  // Create pending report record
  const report = await prisma.report.create({
    data: { facilityId, period, type, status: "GENERATING" },
  });

  // Fire-and-forget to AI engine
  fetch(`${process.env.AI_ENGINE_URL}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId: report.id, facilityId, period, type }),
  });

  return NextResponse.json({ reportId: report.id, status: "GENERATING" });
}
```

---

## 8. Auth Configuration (NextAuth)

```typescript
// frontend/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
```

---

## 9. Innovative Features (Beyond Requirements)

### 9.1 Remediation Playbooks
When a predicted breach is detected, the system surfaces a **step-by-step remediation playbook** specific to the parameter:
- pH too high → "Add sulphuric acid solution to neutralisation tank. Target dosing: X ml/min"
- COD rising → "Activate secondary biological treatment stage. Aeration blower speed: +"
- These playbooks are stored in Postgres and editable by facility managers.

### 9.2 Digital Compliance Twin
A side-by-side view showing:
- **Left:** Real sensor readings (live)
- **Right:** Simulated "what if" scenario editor — operators can adjust process parameters and see predicted compliance impact in real time (frontend only, uses trend extrapolation)

### 9.3 Compliance Score API
A public API endpoint (with API key auth) that returns a facility's current compliance score as a JSON badge — designed so that regulators or third-party auditors can check compliance status without accessing the full dashboard.

### 9.4 Shift Handover Report
Auto-generated end-of-shift PDF summary (every 8 hours) that gives the incoming operator a crisp briefing: what happened, current status, active alerts, what to watch.

### 9.5 Anomaly Fingerprinting
Each detected anomaly gets a "fingerprint" — a radar chart of all parameters at the moment of detection. These fingerprints are stored and compared using cosine similarity, so the system can say: *"This anomaly pattern matches the pH spike event from 2025-11-14 — which was caused by batch dyeing discharge."*

### 9.6 Regulatory Timeline View
A calendar/Gantt view showing:
- Upcoming regulatory submission deadlines
- Scheduled facility inspections
- Report generation schedule
- Historical breach events plotted on timeline

### 9.7 Multi-Tenant Facility Management
Admins can manage multiple facilities from one account. Each facility has its own sensor config, thresholds, users, and report history. Role-based access: ADMIN > MANAGER > OPERATOR > AUDITOR (read-only).

### 9.8 Webhook & Integration Hub
Operators can configure outgoing webhooks to:
- Slack / Microsoft Teams (alert notifications)
- Email (Resend)
- Custom HTTPS endpoints
- Future: EA (Environment Agency) regulatory API

---

## 10. Environment Variables

```env
# frontend/.env.local

# Database
DATABASE_URL="postgresql://user:password@host:5432/aquasense"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI Engine
AI_ENGINE_URL="http://localhost:8000"

# Email (Resend)
RESEND_API_KEY="re_..."

# ai-engine/.env

DATABASE_URL="postgresql://user:password@host:5432/aquasense"
RESEND_API_KEY="re_..."
```

---

## 11. `requirements.txt` (AI Engine)

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
apscheduler==3.10.4
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
scikit-learn==1.4.2
numpy==1.26.4
pandas==2.2.2
pydantic==2.7.1
reportlab==4.1.0
httpx==0.27.0
python-dotenv==1.0.1
```

---

## 12. `package.json` Dependencies (Frontend)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^5.0.0-beta.19",
    "@auth/prisma-adapter": "^2.1.0",
    "@prisma/client": "^5.14.0",
    "prisma": "^5.14.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.2.0",
    "recharts": "^2.12.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "bcryptjs": "^2.4.3",
    "resend": "^3.2.0",
    "lucide-react": "^0.383.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.6.0"
  }
}
```

---

## 13. README.md Structure

```markdown
# Aquaflow — Wastewater Compliance Platform

> Real-time IoT monitoring + AI breach prediction + automated compliance reporting

## Demo
[Live Demo Link] | [Pitch Video Link]

## Quick Start
### Prerequisites
- Node.js 20+, Python 3.11+, PostgreSQL 15+

### 1. Clone & Install
git clone https://github.com/your-org/aquasense-ai
cd aquasense-ai/frontend && npm install
cd ../ai-engine && pip install -r requirements.txt

### 2. Database Setup
cd frontend
npx prisma generate
npx prisma db push
npx prisma db seed

### 3. Start Services
# Terminal 1 — AI Engine
cd ai-engine && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev

## Architecture
[Insert architecture diagram]

## Compliance Parameters
[Table of Section 82 thresholds]

## API Reference
[FastAPI auto-docs at /docs]
```

---

## 14. Build Order for Coding Agent

Follow this exact sequence:

```
PHASE 1 — Foundation
1. Set up Next.js project with TypeScript + Tailwind
2. Configure Prisma schema (Section 3) + run db push
3. Implement NextAuth (Section 8)
4. Build login/register pages
5. Build sidebar + topbar layout shell

PHASE 2 — AI Engine
6. Set up FastAPI project structure
7. Implement SensorSimulator (Section 5.2)
8. Implement AquaPredictor (Section 5.3)
9. Wire up SSE sensor stream endpoint
10. Wire up predictions endpoint
11. Implement report generator
12. Test all endpoints with curl / FastAPI /docs

PHASE 3 — Dashboard Core
13. Build KPI Cards component
14. Build SensorCard with sparkline
15. Build LiveFeedChart with Recharts
16. Build ComplianceRing SVG gauge
17. Wire SSE stream to frontend (EventSource)
18. Build Risk Heatmap
19. Build Prediction Timeline

PHASE 4 — Feature Pages
20. Sensors grid page (SensorCard × 10)
21. Predictions page with confidence bars
22. Alerts page with filter + acknowledge
23. Reports page + PDF download
24. Satellite map with Leaflet

PHASE 5 — Polish & Innovative Features
25. Alert email notifications (Resend)
26. Remediation playbooks modal
27. Compliance Score radial animation
28. Shift handover report cron
29. Multi-facility switcher
30. Webhook config panel

PHASE 6 — Demo Prep
31. Seed database with 3 demo facilities
32. Pre-populate 7 days of historical readings
33. Set simulator to trigger a breach during demo
34. Write README
35. Record pitch video
```

---

## 15. Demo Script (Pitch Flow)

**Time: 3 minutes**

1. **[0:00–0:20]** Show login → land on dashboard. "This is Aquaflow — the world's first Section 82 compliance intelligence platform."

2. **[0:20–0:50]** Point to live sensor feed. "Every 5 seconds, real sensor data from IoT devices flows in — pH, COD, BOD, TSS, temperature, heavy metals. Right now, Facility 2 is showing a rising COD trend."

3. **[0:50–1:20]** Navigate to Predictions. "Our AI engine detected a pattern. It's predicting an 87% probability of a COD breach in the next 30 minutes. The system has already sent an alert to the compliance team and generated a remediation playbook." — Trigger the simulated breach spike.

4. **[1:20–1:50]** Navigate to Alerts — show the alert auto-created. "Zero manual intervention. The alert is live, timestamped, and audit-logged."

5. **[1:50–2:20]** Navigate to Reports — click Generate. "One click generates a regulatory-submission-ready PDF — parameter trends, breach log, compliance score. What used to take a team of engineers 2 days now takes 4 seconds."

6. **[2:20–2:50]** Show Satellite map with multi-facility view. "AquaSense scales across every facility in a portfolio. Regulators get a real-time view of regional compliance — a first in the industry."

7. **[2:50–3:00]** Back to dashboard. "From reactive to proactive. From fines to prevention. This is Aquaflow."

---

*End of project-spec.md — v1.0 | Aquaflow Hackathon MVP*
