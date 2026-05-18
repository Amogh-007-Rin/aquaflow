"""
Two-layer prediction system:
  Layer 1 — Isolation Forest: anomaly detection on current reading
  Layer 2 — Linear trend extrapolation + threshold proximity scoring
"""

from collections import deque
from typing import Dict

import numpy as np
from sklearn.ensemble import IsolationForest

THRESHOLDS = {
    "PH": {"max": 10.0, "min": 6.0},
    "COD": {"max": 500},
    "BOD": {"max": 300},
    "TSS": {"max": 600},
    "TEMPERATURE": {"max": 43},
    "AMMONIA": {"max": 50},
    "HEAVY_METAL_LEAD": {"max": 0.1},
    "HEAVY_METAL_MERCURY": {"max": 0.01},
}


class AquaPredictor:
    WINDOW = 60

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

        buf = self.buffers[k]
        if len(buf) >= 20 and len(buf) % 20 == 0:
            x = np.array(buf).reshape(-1, 1)
            model = IsolationForest(contamination=0.05, random_state=42)
            model.fit(x)
            self.models[k] = model

    def is_anomaly(self, facility_id: str, parameter: str, value: float) -> bool:
        k = self._key(facility_id, parameter)
        if k not in self.models:
            return False
        score = self.models[k].decision_function([[value]])[0]
        return score < 0

    def predict_breach(self, facility_id: str, parameter: str, horizon_minutes: int = 30) -> dict:
        k = self._key(facility_id, parameter)
        buf = list(self.buffers.get(k, []))
        threshold = THRESHOLDS.get(parameter, {})

        if len(buf) < 10:
            return {"probability": 0.0, "predicted_value": None, "confidence": 0.0}

        x = np.arange(len(buf))
        coeffs = np.polyfit(x, buf, 1)
        steps_ahead = (horizon_minutes * 60) / 5
        predicted_value = coeffs[0] * (len(buf) + steps_ahead) + coeffs[1]

        max_t = threshold.get("max")
        min_t = threshold.get("min")
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


predictor = AquaPredictor()
