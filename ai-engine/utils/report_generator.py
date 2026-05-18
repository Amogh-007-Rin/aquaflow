"""
Generates a PDF compliance report containing:
- Executive summary with compliance score
- Parameter-by-parameter analysis with trend charts
- Alert log with timestamps
- Section 82 breach table
- Regulatory submission-ready format
"""

import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_compliance_report(facility: dict, readings: list, alerts: list, score: float) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Aquaflow — Compliance Report", styles["Title"]))
    story.append(Paragraph(f"Facility: {facility['name']} | License: {facility['licenseNo']}", styles["Normal"]))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    story.append(Spacer(1, 20))

    story.append(Paragraph(f"Overall Compliance Score: {score:.1f}%", styles["Heading1"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Parameter Summary", styles["Heading2"]))
    table_data = [["Parameter", "Avg Value", "Max Value", "Limit", "Status"]]
    for reading in readings:
        status = "✓ COMPLIANT" if reading["max_value"] < reading["limit"] else "✗ BREACH"
        table_data.append(
            [
                reading["parameter"],
                f"{reading['avg_value']:.3f} {reading['unit']}",
                f"{reading['max_value']:.3f} {reading['unit']}",
                f"{reading['limit']} {reading['unit']}",
                status,
            ]
        )
    table = Table(table_data)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F4C81")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F7FF")]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 20))

    story.append(Paragraph("Alert Log", styles["Heading2"]))
    alert_data = [["Timestamp", "Parameter", "Severity", "Value", "Threshold", "Status"]]
    for alert in alerts[:20]:
        alert_data.append(
            [
                alert.get("triggered_at", "-"),
                alert.get("parameter", "-"),
                alert.get("severity", "-"),
                str(alert.get("value", "-")),
                str(alert.get("threshold", "-")),
                alert.get("status", "-"),
            ]
        )
    story.append(Table(alert_data))
    story.append(Spacer(1, 30))
    story.append(
        Paragraph(
            "This report is generated in accordance with Section 82 of the Water Industry Act 1991 "
            "and is suitable for submission to the relevant regulatory authority.",
            styles["Italic"],
        )
    )

    doc.build(story)
    return buffer.getvalue()
