from datetime import datetime

from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from utils.db import get_alerts, summary_for_report
from utils.report_generator import generate_compliance_report

router = APIRouter()


class ReportRequest(BaseModel):
    reportId: str | None = None
    facilityId: str
    period: str
    type: str


@router.post("/generate")
async def generate_report(payload: ReportRequest):
    facility = {
        "id": payload.facilityId,
        "name": payload.facilityId.replace("_", " ").title(),
        "licenseNo": f"WIA-82-{payload.facilityId[-3:]}",
    }
    readings = await summary_for_report(payload.facilityId)
    alerts = await get_alerts()

    compliant = sum(1 for row in readings if row["max_value"] <= row["limit"])
    score = 100.0 if not readings else (compliant / len(readings)) * 100
    pdf_bytes = generate_compliance_report(facility, readings, alerts, score)

    filename = f"aquaflow-{payload.facilityId}-{datetime.utcnow().strftime('%Y%m%d%H%M')}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
