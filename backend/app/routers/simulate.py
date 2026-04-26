from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from sqlmodel import Session
import json, asyncio

from ..database import get_session
from ..models import (SchedulingRequest, MemoryRequest, DiskRequest,
                      BankersRequest, DuelRequest, SimulationRecord)
from ..algorithms.scheduling import run_scheduling
from ..algorithms.memory     import run_memory
from ..algorithms.disk       import run_disk
from ..algorithms.deadlock   import run_deadlock

router = APIRouter(prefix="/api/simulate", tags=["simulate"])


# ── HTTP endpoints (instant full result) ─────────────────────────────────────

@router.post("/cpu")
async def simulate_cpu(req: SchedulingRequest, db: Session = Depends(get_session)):
    try:
        result = run_scheduling(req.algorithm,
                                [p.model_dump() for p in req.processes],
                                req.quantum, req.queues)
    except ValueError as e:
        raise HTTPException(400, str(e))

    record = SimulationRecord(
        category="cpu", algorithm=req.algorithm,
        input_data=req.model_dump_json(),
        result_data=json.dumps(result))
    db.add(record); db.commit(); db.refresh(record)
    return {**result, "simulation_id": record.id}


@router.post("/memory")
async def simulate_memory(req: MemoryRequest, db: Session = Depends(get_session)):
    try:
        result = run_memory(req.algorithm, req.pages, req.frames)
    except ValueError as e:
        raise HTTPException(400, str(e))

    record = SimulationRecord(
        category="memory", algorithm=req.algorithm,
        input_data=req.model_dump_json(),
        result_data=json.dumps(result))
    db.add(record); db.commit(); db.refresh(record)
    return {**result, "simulation_id": record.id}


@router.post("/disk")
async def simulate_disk(req: DiskRequest, db: Session = Depends(get_session)):
    try:
        result = run_disk(req.algorithm, req.requests,
                          req.initial_head, req.disk_size, req.direction)
    except ValueError as e:
        raise HTTPException(400, str(e))

    record = SimulationRecord(
        category="disk", algorithm=req.algorithm,
        input_data=req.model_dump_json(),
        result_data=json.dumps(result))
    db.add(record); db.commit(); db.refresh(record)
    return {**result, "simulation_id": record.id}


@router.post("/deadlock")
async def simulate_deadlock(req: BankersRequest, db: Session = Depends(get_session)):
    result = run_deadlock(req.allocation, req.max_need, req.available,
                          req.request_pid, req.request)
    record = SimulationRecord(
        category="deadlock", algorithm="bankers",
        input_data=req.model_dump_json(),
        result_data=json.dumps(result))
    db.add(record); db.commit(); db.refresh(record)
    return {**result, "simulation_id": record.id}


@router.post("/duel")
async def simulate_duel(req: DuelRequest, db: Session = Depends(get_session)):
    """Run two algorithms on same input and compare."""
    cat = req.category.lower()
    try:
        if cat == "cpu":
            procs = req.input_data.get("processes", [])
            q     = req.input_data.get("quantum", 2)
            ra    = run_scheduling(req.algorithm_a, procs, q)
            rb    = run_scheduling(req.algorithm_b, procs, q)
            winner_key = "avg_waiting"
            winner = req.algorithm_a if ra[winner_key] <= rb[winner_key] else req.algorithm_b
            comparison = {
                "avg_waiting":    {req.algorithm_a: ra["avg_waiting"],    req.algorithm_b: rb["avg_waiting"]},
                "avg_turnaround": {req.algorithm_a: ra["avg_turnaround"], req.algorithm_b: rb["avg_turnaround"]},
                "avg_response":   {req.algorithm_a: ra["avg_response"],   req.algorithm_b: rb["avg_response"]},
                "cpu_utilization":{req.algorithm_a: ra["cpu_utilization"],req.algorithm_b: rb["cpu_utilization"]},
            }
        elif cat == "memory":
            pages  = req.input_data.get("pages", [])
            frames = req.input_data.get("frames", 3)
            ra     = run_memory(req.algorithm_a, pages, frames)
            rb     = run_memory(req.algorithm_b, pages, frames)
            winner = req.algorithm_a if ra["fault_count"] <= rb["fault_count"] else req.algorithm_b
            comparison = {
                "fault_count": {req.algorithm_a: ra["fault_count"], req.algorithm_b: rb["fault_count"]},
                "hit_rate":    {req.algorithm_a: ra["hit_rate"],    req.algorithm_b: rb["hit_rate"]},
            }
        elif cat == "disk":
            reqs  = req.input_data.get("requests", [])
            head  = req.input_data.get("initial_head", 0)
            dsize = req.input_data.get("disk_size", 200)
            ra    = run_disk(req.algorithm_a, reqs, head, dsize)
            rb    = run_disk(req.algorithm_b, reqs, head, dsize)
            winner = req.algorithm_a if ra["total_seek_distance"] <= rb["total_seek_distance"] else req.algorithm_b
            comparison = {
                "total_seek_distance": {req.algorithm_a: ra["total_seek_distance"], req.algorithm_b: rb["total_seek_distance"]},
                "avg_seek_time":       {req.algorithm_a: ra["avg_seek_time"],       req.algorithm_b: rb["avg_seek_time"]},
            }
        else:
            raise HTTPException(400, f"Unknown duel category: {cat}")
    except ValueError as e:
        raise HTTPException(400, str(e))

    return {"algorithm_a": req.algorithm_a, "algorithm_b": req.algorithm_b,
            "result_a": ra, "result_b": rb,
            "winner": winner, "comparison": comparison}


# ── WebSocket — live step streaming ──────────────────────────────────────────

@router.websocket("/ws/{category}")
async def ws_simulate(websocket: WebSocket, category: str):
    await websocket.accept()
    try:
        raw = await websocket.receive_text()
        data = json.loads(raw)

        cat = category.lower()
        if cat == "cpu":
            result = run_scheduling(data["algorithm"],
                                    data.get("processes", []),
                                    data.get("quantum", 2),
                                    data.get("queues", 3))
        elif cat == "memory":
            result = run_memory(data["algorithm"],
                                data.get("pages", []),
                                data.get("frames", 3))
        elif cat == "disk":
            result = run_disk(data["algorithm"],
                              data.get("requests", []),
                              data.get("initial_head", 0),
                              data.get("disk_size", 200),
                              data.get("direction", "right"))
        elif cat == "deadlock":
            result = run_deadlock(data["allocation"], data["max_need"],
                                  data["available"],
                                  data.get("request_pid"),
                                  data.get("request"))
        else:
            await websocket.send_json({"type": "error", "msg": f"Unknown category: {cat}"})
            return

        steps = result.pop("steps", [])
        await websocket.send_json({"type": "start", "total_steps": len(steps)})

        for i, step in enumerate(steps):
            await websocket.send_json({"type": "step", "index": i, "step": step})
            await asyncio.sleep(0.05)   # 50ms between steps

        await websocket.send_json({"type": "complete", "result": result})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "msg": str(e)})
        except:
            pass
