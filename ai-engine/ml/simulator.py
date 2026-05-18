import math
import random
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
        "PH": {"base": 7.5, "noise": 0.3, "spike_mag": 3.0, "unit": "pH"},
        "COD": {"base": 280, "noise": 30, "spike_mag": 300, "unit": "mg/L"},
        "BOD": {"base": 180, "noise": 20, "spike_mag": 180, "unit": "mg/L"},
        "TSS": {"base": 320, "noise": 40, "spike_mag": 350, "unit": "mg/L"},
        "TEMPERATURE": {"base": 28, "noise": 2, "spike_mag": 18, "unit": "°C"},
        "AMMONIA": {"base": 22, "noise": 5, "spike_mag": 35, "unit": "mg/L"},
        "HEAVY_METAL_LEAD": {"base": 0.04, "noise": 0.01, "spike_mag": 0.09, "unit": "mg/L"},
        "HEAVY_METAL_MERCURY": {"base": 0.003, "noise": 0.001, "spike_mag": 0.009, "unit": "mg/L"},
        "DISSOLVED_OXYGEN": {"base": 6.5, "noise": 0.5, "spike_mag": 4.0, "unit": "mg/L"},
        "TURBIDITY": {"base": 45, "noise": 10, "spike_mag": 80, "unit": "NTU"},
    }

    def __init__(self):
        self._spike_probability = 0.03
        self._trend_offset = {}
        self._time_start = time.time()

    def _diurnal_factor(self) -> float:
        hour = datetime.utcnow().hour
        return 1.0 + 0.35 * math.sin(math.pi * (hour - 6) / 16) if 6 <= hour <= 22 else 0.75

    def generate_reading(self, parameter: str, facility_id: str) -> dict:
        cfg = self.BASE_VALUES[parameter]
        diurnal = self._diurnal_factor()
        drift = self._trend_offset.get(f"{facility_id}_{parameter}", 0)

        value = cfg["base"] * diurnal + drift + random.gauss(0, cfg["noise"])

        is_spike = random.random() < self._spike_probability or (
            facility_id == "facility_002" and parameter == "COD" and random.random() < 0.18
        )
        if is_spike:
            value += cfg["spike_mag"] * random.uniform(0.5, 1.2)

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
        from utils.db import save_reading

        for facility_id in self.FACILITIES:
            for parameter in self.BASE_VALUES:
                reading = self.generate_reading(parameter, facility_id)
                await save_reading(reading)
