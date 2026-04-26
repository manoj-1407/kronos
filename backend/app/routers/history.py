from io import StringIO
import csv
import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from ..database import get_session
from ..models import (
    CompareRunsRequest,
    ScenarioCreate,
    ScenarioRecord,
    SimulationRecord,
)

router = APIRouter(prefix="/api/history", tags=["history"])


def serialize_history_record(record: SimulationRecord) -> dict:
    return {
        "id": record.id,
        "category": record.category,
        "algorithm": record.algorithm,
        "created_at": record.created_at.isoformat(),
        "input_data": record.get_input(),
        "result_data": record.get_result(),
    }


def _summary_metric(category: str, result_data: dict) -> tuple[str, float]:
    if category == "cpu":
        return ("avg_waiting", float(result_data.get("avg_waiting", 0.0)))
    if category == "memory":
        return ("fault_count", float(result_data.get("fault_count", 0.0)))
    if category == "disk":
        return ("total_seek_distance", float(result_data.get("total_seek_distance", 0.0)))
    if category == "deadlock":
        return ("safe_state", 1.0 if result_data.get("is_safe", False) else 0.0)
    return ("score", 0.0)


def _insight_text(category: str, algorithm: str, result_data: dict) -> str:
    if category == "cpu":
        wait = float(result_data.get("avg_waiting", 0.0))
        util = float(result_data.get("cpu_utilization", 0.0))
        if wait <= 2:
            return f"{algorithm} keeps queues tight with very low waiting time. Great fit for latency-sensitive CPU workloads."
        if util >= 90:
            return f"{algorithm} drives high utilization but queues are building up. Consider smaller quantum or preemptive strategy."
        return f"{algorithm} produces a balanced schedule for this input. Try changing arrivals to expose starvation or convoy effects."
    if category == "memory":
        fault_rate = float(result_data.get("fault_rate", 0.0))
        if fault_rate < 35:
            return f"{algorithm} exploits locality well for this reference string. The frame budget is healthy for this workload."
        return f"{algorithm} is fault-heavy here. Increase frames or try a policy with better recency/frequency awareness."
    if category == "disk":
        distance = float(result_data.get("total_seek_distance", 0.0))
        return f"{algorithm} traveled {distance:.0f} cylinders in total. Clustered request patterns generally favor directional scan strategies."
    if category == "deadlock":
        safe = bool(result_data.get("is_safe", False))
        return "System remains in a safe state with a valid completion sequence." if safe else "Unsafe allocation detected. Resources cannot guarantee process completion."
    return "No insight available for this run."


@router.get("/")
def list_history(limit: int = 50, category: str = None,
                 db: Session = Depends(get_session)):
    stmt = select(SimulationRecord).order_by(SimulationRecord.id.desc())
    if category:
        stmt = stmt.where(SimulationRecord.category == category)
    stmt = stmt.limit(limit)
    records = db.exec(stmt).all()
    return [serialize_history_record(record) for record in records]


@router.delete("/")
def clear_history(db: Session = Depends(get_session)):
    records = db.exec(select(SimulationRecord)).all()
    for r in records:
        db.delete(r)
    db.commit()
    return {"deleted": len(records)}


@router.post("/compare")
def compare_runs(payload: CompareRunsRequest, db: Session = Depends(get_session)):
    if len(payload.run_ids) < 2:
        raise HTTPException(400, "Select at least two runs to compare")

    records = []
    for run_id in payload.run_ids:
        record = db.get(SimulationRecord, run_id)
        if not record:
            raise HTTPException(404, f"Simulation #{run_id} not found")
        records.append(record)

    categories = {record.category for record in records}
    if len(categories) != 1:
        raise HTTPException(400, "All selected runs must belong to the same category")

    category = records[0].category
    points: list[dict] = []
    metric_key = ""
    best_run_id = records[0].id
    best_metric = float("inf")

    for record in records:
        metric_key, metric_value = _summary_metric(category, record.get_result())
        points.append(
            {
                "id": record.id,
                "algorithm": record.algorithm,
                "metric": metric_value,
                "created_at": record.created_at.isoformat(),
            }
        )
        if metric_value < best_metric:
            best_metric = metric_value
            best_run_id = record.id

    return {
        "run_ids": payload.run_ids,
        "category": category,
        "metric_key": metric_key,
        "best_run_id": best_run_id,
        "points": points,
    }


@router.get("/export/csv")
def export_history_csv(limit: int = 250, db: Session = Depends(get_session)):
    stmt = select(SimulationRecord).order_by(SimulationRecord.id.desc()).limit(limit)
    rows = db.exec(stmt).all()

    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["id", "created_at", "category", "algorithm", "metric", "metric_value"])
    for record in rows:
        metric_key, metric_value = _summary_metric(record.category, record.get_result())
        writer.writerow(
            [record.id, record.created_at.isoformat(), record.category, record.algorithm, metric_key, metric_value]
        )
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="kronos-history.csv"'},
    )


@router.get("/scenarios/")
def list_scenarios(category: str = None, db: Session = Depends(get_session)):
    stmt = select(ScenarioRecord).order_by(ScenarioRecord.id.desc())
    if category:
        stmt = stmt.where(ScenarioRecord.category == category)
    scenarios = db.exec(stmt).all()
    return [
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "algorithm": item.algorithm,
            "payload": item.get_payload(),
            "notes": item.notes,
            "tags": item.get_tags(),
            "created_at": item.created_at.isoformat(),
        }
        for item in scenarios
    ]


@router.post("/scenarios/")
def create_scenario(payload: ScenarioCreate, db: Session = Depends(get_session)):
    scenario = ScenarioRecord(
        name=payload.name.strip(),
        category=payload.category.strip().lower(),
        algorithm=payload.algorithm.strip(),
        payload=json.dumps(payload.payload),
    )
    scenario.notes = payload.notes.strip() if payload.notes else None
    scenario.tags = ",".join([tag.strip() for tag in payload.tags if tag.strip()])
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return {
        "id": scenario.id,
        "name": scenario.name,
        "category": scenario.category,
        "algorithm": scenario.algorithm,
        "payload": scenario.get_payload(),
        "notes": scenario.notes,
        "tags": scenario.get_tags(),
        "created_at": scenario.created_at.isoformat(),
    }


@router.delete("/scenarios/{scenario_id}")
def delete_scenario(scenario_id: int, db: Session = Depends(get_session)):
    scenario = db.get(ScenarioRecord, scenario_id)
    if not scenario:
        raise HTTPException(404, "Scenario not found")
    db.delete(scenario)
    db.commit()
    return {"deleted": scenario_id}


@router.get("/runs/{record_id}")
def get_history(record_id: int, db: Session = Depends(get_session)):
    r = db.get(SimulationRecord, record_id)
    if not r:
        raise HTTPException(404, "Simulation not found")
    return serialize_history_record(r)


@router.delete("/runs/{record_id}")
def delete_history(record_id: int, db: Session = Depends(get_session)):
    r = db.get(SimulationRecord, record_id)
    if not r:
        raise HTTPException(404, "Simulation not found")
    db.delete(r)
    db.commit()
    return {"deleted": record_id}


@router.get("/runs/{record_id}/insight")
def get_run_insight(record_id: int, db: Session = Depends(get_session)):
    record = db.get(SimulationRecord, record_id)
    if not record:
        raise HTTPException(404, "Simulation not found")
    return {
        "id": record.id,
        "category": record.category,
        "algorithm": record.algorithm,
        "insight": _insight_text(record.category, record.algorithm, record.get_result()),
    }
