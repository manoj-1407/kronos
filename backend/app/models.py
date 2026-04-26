from __future__ import annotations
from typing import Any, Optional
from sqlmodel import SQLModel, Field
from pydantic import BaseModel, Field as PydanticField, model_validator
from datetime import datetime
import json


# ── Database Models ──────────────────────────────────────────────────────────

class SimulationRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str                   # cpu | memory | disk | deadlock
    algorithm: str
    input_data: str                 # JSON blob
    result_data: str                # JSON blob
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_input(self) -> dict:
        return json.loads(self.input_data)

    def get_result(self) -> dict:
        return json.loads(self.result_data)


class ScenarioRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str
    algorithm: str
    payload: str
    notes: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_payload(self) -> dict:
        return json.loads(self.payload)

    def get_tags(self) -> list[str]:
        if not self.tags:
            return []
        return [tag.strip() for tag in self.tags.split(",") if tag.strip()]


# ── CPU Scheduling ────────────────────────────────────────────────────────────

class ProcessInput(BaseModel):
    pid: str
    arrival: int
    burst: int
    priority: int = 0


class SchedulingRequest(BaseModel):
    algorithm: str          # fcfs | sjf | srtf | rr | priority | priority_p | mlfq
    processes: list[ProcessInput]
    quantum: int = 2        # for RR and MLFQ
    queues: int = 3         # for MLFQ

    @model_validator(mode="after")
    def validate_request(self):
        if not self.processes:
            raise ValueError("processes cannot be empty")
        if self.quantum < 1:
            raise ValueError("quantum must be >= 1")
        if self.queues < 1:
            raise ValueError("queues must be >= 1")
        return self


class GanttEntry(BaseModel):
    pid: str
    start: int
    end: int


class ProcessMetrics(BaseModel):
    pid: str
    arrival: int
    burst: int
    completion: int
    turnaround: int
    waiting: int
    response: int
    priority: int = 0


class SchedulingResult(BaseModel):
    algorithm: str
    gantt: list[GanttEntry]
    metrics: list[ProcessMetrics]
    avg_turnaround: float
    avg_waiting: float
    avg_response: float
    throughput: float
    cpu_utilization: float
    steps: list[dict]           # step-by-step for animation


# ── Memory Management ─────────────────────────────────────────────────────────

class MemoryRequest(BaseModel):
    algorithm: str              # fifo | lru | optimal | lfu | clock
    frames: int
    pages: list[int]

    @model_validator(mode="after")
    def validate_request(self):
        if self.frames < 1:
            raise ValueError("frames must be >= 1")
        if not self.pages:
            raise ValueError("pages cannot be empty")
        return self


class FrameState(BaseModel):
    time: int
    page: int
    frames: list[Optional[int]]
    fault: bool
    evicted: Optional[int] = None
    hit_index: Optional[int] = None     # which frame had the hit


class MemoryResult(BaseModel):
    algorithm: str
    frames: int
    pages: list[int]
    states: list[FrameState]
    fault_count: int
    hit_count: int
    fault_rate: float
    hit_rate: float


# ── Disk Scheduling ───────────────────────────────────────────────────────────

class DiskRequest(BaseModel):
    algorithm: str              # fcfs | sstf | scan | cscan | look | clook
    requests: list[int]
    initial_head: int
    disk_size: int = 200
    direction: str = "right"    # for scan/look variants

    @model_validator(mode="after")
    def validate_request(self):
        if self.disk_size < 2:
            raise ValueError("disk_size must be >= 2")
        if not self.requests:
            raise ValueError("requests cannot be empty")
        if self.initial_head < 0 or self.initial_head >= self.disk_size:
            raise ValueError("initial_head must be within disk bounds")
        if self.direction not in {"left", "right"}:
            raise ValueError("direction must be left or right")
        return self


class DiskResult(BaseModel):
    algorithm: str
    initial_head: int
    seek_sequence: list[int]
    total_seek_distance: int
    avg_seek_time: float
    steps: list[dict]


# ── Deadlock ──────────────────────────────────────────────────────────────────

class BankersRequest(BaseModel):
    processes: int
    resources: int
    allocation: list[list[int]]
    max_need: list[list[int]]
    available: list[int]
    request_pid: Optional[int] = None
    request: Optional[list[int]] = None

    @model_validator(mode="after")
    def validate_request(self):
        if self.processes < 1 or self.resources < 1:
            raise ValueError("processes and resources must be >= 1")
        if len(self.allocation) != self.processes or len(self.max_need) != self.processes:
            raise ValueError("allocation and max_need rows must match processes")
        if len(self.available) != self.resources:
            raise ValueError("available length must match resources")
        for row in self.allocation + self.max_need:
            if len(row) != self.resources:
                raise ValueError("each allocation/max_need row must match resources")
        return self


class BankersResult(BaseModel):
    is_safe: bool
    safe_sequence: list[int]
    need_matrix: list[list[int]]
    steps: list[dict]
    request_granted: Optional[bool] = None
    request_reason: Optional[str] = None


# ── Duel Mode ─────────────────────────────────────────────────────────────────

class DuelRequest(BaseModel):
    category: str               # cpu | memory | disk
    algorithm_a: str
    algorithm_b: str
    input_data: dict


class DuelResult(BaseModel):
    algorithm_a: str
    algorithm_b: str
    result_a: dict
    result_b: dict
    winner: str
    comparison: dict


# ── History ───────────────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    id: int
    category: str
    algorithm: str
    input_data: dict
    result_data: dict
    created_at: datetime


class ScenarioCreate(BaseModel):
    name: str
    category: str
    algorithm: str
    payload: dict
    notes: Optional[str] = None
    tags: list[str] = PydanticField(default_factory=list)


class ScenarioItem(BaseModel):
    id: int
    name: str
    category: str
    algorithm: str
    payload: dict
    notes: Optional[str]
    tags: list[str]
    created_at: datetime


class CompareRunsRequest(BaseModel):
    run_ids: list[int]


class CompareRunsResult(BaseModel):
    run_ids: list[int]
    category: str
    metric_key: str
    best_run_id: int
    points: list[dict]
