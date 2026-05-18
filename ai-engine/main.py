from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ml.simulator import SensorSimulator
from routers import alerts, predictions, reports, sensors
from utils.db import seed_historical_data

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
    await seed_historical_data(simulator)
    scheduler.add_job(simulator.generate_and_store, "interval", seconds=5)
    scheduler.start()


@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown(wait=False)


@app.get("/health")
async def health():
    return {"status": "ok", "engine": "Aquaflow v1.0"}
