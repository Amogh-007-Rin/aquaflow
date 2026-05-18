from datetime import datetime

from pydantic import BaseModel


class SensorReading(BaseModel):
    facility_id: str
    parameter: str
    value: float
    unit: str
    timestamp: datetime
    is_spike: bool = False
