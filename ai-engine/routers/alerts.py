from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from utils.alerts import dispatch_alert
from utils.db import create_alert, get_alerts, update_alert

router = APIRouter()


class AlertIn(BaseModel):
    facility_id: str
    parameter: str
    severity: str
    message: str
    value: float | None = None
    threshold: float | None = None
    predicted_at: str | None = None
    type: str = "SYSTEM_WARNING"


@router.get("")
async def list_alerts(status: str | None = None):
    return {"alerts": await get_alerts(status)}


@router.post("")
async def create_new_alert(payload: AlertIn):
    alert = await create_alert(payload.model_dump())
    await dispatch_alert(alert)
    return alert


@router.patch("/{alert_id}/ack")
async def acknowledge_alert(alert_id: str):
    alert = await update_alert(alert_id, "ACKNOWLEDGED")
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    alert = await update_alert(alert_id, "RESOLVED")
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
