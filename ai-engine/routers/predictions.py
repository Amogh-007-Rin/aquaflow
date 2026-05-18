from fastapi import APIRouter

from ml.predictor import predictor
from utils.db import get_predictions, save_prediction

router = APIRouter()

PARAMETERS = [
    "PH",
    "COD",
    "BOD",
    "TSS",
    "TEMPERATURE",
    "AMMONIA",
    "HEAVY_METAL_LEAD",
    "HEAVY_METAL_MERCURY",
]


@router.get("/breach/{facility_id}")
async def predict_all_breaches(facility_id: str):
    results = {}
    for param in PARAMETERS:
        results[param] = {
            "15m": predictor.predict_breach(facility_id, param, 15),
            "30m": predictor.predict_breach(facility_id, param, 30),
            "60m": predictor.predict_breach(facility_id, param, 60),
        }

    for param, horizons in results.items():
        for horizon, pred in horizons.items():
            if pred["probability"] > 0.5:
                await save_prediction(
                    {
                        "facility_id": facility_id,
                        "parameter": param,
                        "horizon": horizon,
                        **pred,
                    }
                )
    return {"facility_id": facility_id, "predictions": results}


@router.get("/history/{facility_id}")
async def prediction_history(facility_id: str, days: int = 7):
    return {"predictions": await get_predictions(facility_id, days)}
