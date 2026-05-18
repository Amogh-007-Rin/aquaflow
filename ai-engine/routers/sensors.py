import asyncio
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from ml.predictor import predictor
from utils.db import get_all_sensor_readings, get_recent_readings

router = APIRouter()


@router.get("/stream/{facility_id}")
async def sensor_stream(facility_id: str):
    async def event_generator():
        while True:
            readings = await get_recent_readings(facility_id, limit=1)
            payload = []
            for reading in readings:
                predictor.ingest(facility_id, reading["parameter"], reading["value"])
                anomaly = predictor.is_anomaly(facility_id, reading["parameter"], reading["value"])
                pred_30 = predictor.predict_breach(facility_id, reading["parameter"], 30)
                pred_60 = predictor.predict_breach(facility_id, reading["parameter"], 60)
                payload.append(
                    {
                        **reading,
                        "is_anomaly": anomaly,
                        "prediction_30m": pred_30,
                        "prediction_60m": pred_60,
                    }
                )
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
