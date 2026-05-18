from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List

READINGS: Dict[str, List[dict]] = defaultdict(list)
PREDICTIONS: Dict[str, List[dict]] = defaultdict(list)
ALERTS: List[dict] = []


def _key(facility_id: str, parameter: str) -> str:
    return f"{facility_id}:{parameter}"


async def save_reading(reading: dict):
    key = _key(reading["facility_id"], reading["parameter"])
    READINGS[key].append(reading)
    if len(READINGS[key]) > 5000:
        READINGS[key] = READINGS[key][-5000:]


async def get_recent_readings(facility_id: str, limit: int = 1):
    results = []
    for key, values in READINGS.items():
        if not key.startswith(f"{facility_id}:") or not values:
            continue
        results.extend(values[-limit:])
    results.sort(key=lambda item: item["timestamp"], reverse=True)
    return results[: max(1, limit * 10)]


async def get_all_sensor_readings(facility_id: str, parameter: str, hours: int = 24):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    key = _key(facility_id, parameter)
    return [r for r in READINGS[key] if datetime.fromisoformat(r["timestamp"]) >= cutoff]


async def save_prediction(prediction: dict):
    bucket = PREDICTIONS[prediction["facility_id"]]
    prediction = {**prediction, "created_at": datetime.utcnow().isoformat()}
    bucket.append(prediction)
    if len(bucket) > 2000:
        PREDICTIONS[prediction["facility_id"]] = bucket[-2000:]


async def get_predictions(facility_id: str, days: int = 7):
    cutoff = datetime.utcnow() - timedelta(days=days)
    return [
        p
        for p in PREDICTIONS.get(facility_id, [])
        if datetime.fromisoformat(p["created_at"]) >= cutoff
    ]


async def create_alert(alert: dict):
    payload = {
        "id": f"AL-{len(ALERTS) + 1:05d}",
        "triggered_at": datetime.utcnow().isoformat(),
        "status": "ACTIVE",
        **alert,
    }
    ALERTS.append(payload)
    return payload


async def get_alerts(status: str | None = None):
    if not status:
        return list(reversed(ALERTS))
    status_upper = status.upper()
    return [a for a in reversed(ALERTS) if a["status"] == status_upper]


async def update_alert(alert_id: str, status: str):
    for alert in ALERTS:
        if alert["id"] == alert_id:
            alert["status"] = status
            if status == "RESOLVED":
                alert["resolved_at"] = datetime.utcnow().isoformat()
            return alert
    return None


async def summary_for_report(facility_id: str):
    parameters = [
        "PH",
        "COD",
        "BOD",
        "TSS",
        "TEMPERATURE",
        "AMMONIA",
        "HEAVY_METAL_LEAD",
        "HEAVY_METAL_MERCURY",
    ]
    limits = {
        "PH": 10.0,
        "COD": 500.0,
        "BOD": 300.0,
        "TSS": 600.0,
        "TEMPERATURE": 43.0,
        "AMMONIA": 50.0,
        "HEAVY_METAL_LEAD": 0.1,
        "HEAVY_METAL_MERCURY": 0.01,
    }
    units = {
        "PH": "pH",
        "TEMPERATURE": "°C",
        "HEAVY_METAL_MERCURY": "mg/L",
        "HEAVY_METAL_LEAD": "mg/L",
    }

    output = []
    for parameter in parameters:
        key = _key(facility_id, parameter)
        values = [row["value"] for row in READINGS.get(key, [])[-288:]]
        if not values:
            continue
        output.append(
            {
                "parameter": parameter,
                "avg_value": sum(values) / len(values),
                "max_value": max(values),
                "limit": limits[parameter],
                "unit": units.get(parameter, "mg/L"),
            }
        )
    return output


async def seed_historical_data(simulator):
    if READINGS:
        return
    for minute in range(7 * 24 * 12):
        ts = datetime.utcnow() - timedelta(minutes=5 * (7 * 24 * 12 - minute))
        for facility_id in simulator.FACILITIES:
            for parameter in simulator.BASE_VALUES:
                reading = simulator.generate_reading(parameter, facility_id)
                reading["timestamp"] = ts.isoformat()
                await save_reading(reading)
