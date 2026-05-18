import os

import httpx


async def dispatch_alert(alert: dict):
    webhook_url = os.getenv("ALERT_WEBHOOK_URL")
    if not webhook_url:
        return {"dispatched": False}

    async with httpx.AsyncClient(timeout=5) as client:
        response = await client.post(webhook_url, json=alert)
        response.raise_for_status()
    return {"dispatched": True}
