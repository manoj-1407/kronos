"""
CPU Scheduling Algorithms
Implements: FCFS, SJF, SRTF, Round Robin, Priority (NP & P), MLFQ
Each algorithm returns gantt chart, per-process metrics, and step log for animation.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from collections import deque
from typing import Optional
import math


@dataclass
class Process:
    pid: str
    arrival: int
    burst: int
    priority: int = 0
    remaining: int = field(init=False)
    completion: int = field(default=0, init=False)
    response: int = field(default=-1, init=False)
    start: int = field(default=-1, init=False)

    def __post_init__(self):
        self.remaining = self.burst

    @property
    def waiting(self) -> int:
        return self.turnaround - self.burst

    @property
    def turnaround(self) -> int:
        return self.completion - self.arrival


def _compute_averages(procs: list[Process], end_time: int) -> dict:
    n = len(procs)
    avg_tat = sum(p.turnaround for p in procs) / n
    avg_wt  = sum(p.waiting   for p in procs) / n
    avg_rt  = sum(p.response  for p in procs) / n
    busy    = sum(p.burst for p in procs)
    util    = (busy / end_time * 100) if end_time > 0 else 0
    tput    = n / end_time if end_time > 0 else 0
    return dict(avg_turnaround=round(avg_tat,2), avg_waiting=round(avg_wt,2),
                avg_response=round(avg_rt,2), cpu_utilization=round(util,2),
                throughput=round(tput,4))


def _build_metrics(procs: list[Process]) -> list[dict]:
    return [dict(pid=p.pid, arrival=p.arrival, burst=p.burst,
                 completion=p.completion, turnaround=p.turnaround,
                 waiting=p.waiting, response=p.response, priority=p.priority)
            for p in procs]


def _merge_gantt(gantt: list[dict]) -> list[dict]:
    """Merge consecutive same-PID entries."""
    if not gantt:
        return gantt
    merged = [gantt[0].copy()]
    for g in gantt[1:]:
        if g["pid"] == merged[-1]["pid"]:
            merged[-1]["end"] = g["end"]
        else:
            merged.append(g.copy())
    return merged


# ── 1. FCFS ───────────────────────────────────────────────────────────────────

def fcfs(processes: list[dict]) -> dict:
    procs = [Process(**p) for p in processes]
    procs.sort(key=lambda p: (p.arrival, p.pid))
    time = 0
    gantt = []
    steps = []
    for p in procs:
        if time < p.arrival:
            steps.append({"time": time, "event": "idle", "until": p.arrival})
            time = p.arrival
        p.response = time - p.arrival
        p.start    = time
        gantt.append({"pid": p.pid, "start": time, "end": time + p.burst})
        steps.append({"time": time, "event": "run", "pid": p.pid,
                      "until": time + p.burst,
                      "desc": f"Running {p.pid} (burst={p.burst})"})
        time += p.burst
        p.completion = time
    return _pack(procs, gantt, steps, time, "FCFS")


# ── 2. SJF (Non-Preemptive) ───────────────────────────────────────────────────

def sjf(processes: list[dict]) -> dict:
    procs  = [Process(**p) for p in processes]
    done   = []
    ready  = []
    time   = 0
    gantt  = []
    steps  = []
    remaining = list(procs)
    remaining.sort(key=lambda p: p.arrival)

    while remaining or ready:
        # Add newly arrived
        arrived = [p for p in remaining if p.arrival <= time]
        for p in arrived:
            ready.append(p)
            remaining.remove(p)
        if not ready:
            next_arr = min(p.arrival for p in remaining)
            steps.append({"time": time, "event": "idle", "until": next_arr})
            time = next_arr
            continue
        ready.sort(key=lambda p: (p.burst, p.arrival))
        p = ready.pop(0)
        # Grab any that arrived during this run
        p.response = time - p.arrival
        p.start    = time
        gantt.append({"pid": p.pid, "start": time, "end": time + p.remaining})
        steps.append({"time": time, "event": "run", "pid": p.pid,
                      "until": time + p.remaining,
                      "desc": f"SJF selected {p.pid} (burst={p.burst}, shortest)"})
        time += p.remaining
        p.remaining   = 0
        p.completion  = time
        done.append(p)
        # Add newly arrived during run
        arrived2 = [q for q in remaining if q.arrival <= time]
        for q in arrived2:
            ready.append(q)
            remaining.remove(q)

    return _pack(done, gantt, steps, time, "SJF")


# ── 3. SRTF (Preemptive SJF) ─────────────────────────────────────────────────

def srtf(processes: list[dict]) -> dict:
    procs     = [Process(**p) for p in processes]
    n         = len(procs)
    time      = 0
    completed = 0
    gantt_raw = []
    steps     = []
    prev_pid  = None

    while completed < n:
        candidates = [p for p in procs if p.arrival <= time and p.remaining > 0]
        if not candidates:
            time += 1
            continue
        p = min(candidates, key=lambda x: (x.remaining, x.arrival))
        if p.response == -1:
            p.response = time - p.arrival
        if prev_pid != p.pid:
            steps.append({"time": time, "event": "preempt" if prev_pid else "run",
                          "pid": p.pid,
                          "desc": f"{'Preempted to ' if prev_pid and prev_pid != p.pid else 'Running '}{p.pid} (rem={p.remaining})"})
        gantt_raw.append({"pid": p.pid, "start": time, "end": time + 1})
        p.remaining -= 1
        time        += 1
        prev_pid     = p.pid
        if p.remaining == 0:
            p.completion = time
            completed   += 1
            prev_pid     = None

    gantt = _merge_gantt(gantt_raw)
    return _pack(procs, gantt, steps, time, "SRTF")


# ── 4. Round Robin ────────────────────────────────────────────────────────────

def round_robin(processes: list[dict], quantum: int = 2) -> dict:
    procs     = sorted([Process(**p) for p in processes], key=lambda p: p.arrival)
    queue     = deque()
    time      = 0
    gantt     = []
    steps     = []
    idx       = 0
    completed = 0
    n         = len(procs)
    in_queue  = set()

    # Seed initial
    while idx < n and procs[idx].arrival <= time:
        queue.append(procs[idx])
        in_queue.add(procs[idx].pid)
        idx += 1

    while completed < n:
        if not queue:
            if idx < n:
                steps.append({"time": time, "event": "idle", "until": procs[idx].arrival})
                time = procs[idx].arrival
                while idx < n and procs[idx].arrival <= time:
                    queue.append(procs[idx])
                    in_queue.add(procs[idx].pid)
                    idx += 1
            continue

        p = queue.popleft()
        in_queue.discard(p.pid)

        if p.response == -1:
            p.response = time - p.arrival

        run       = min(quantum, p.remaining)
        end_time  = time + run
        gantt.append({"pid": p.pid, "start": time, "end": end_time})
        steps.append({"time": time, "event": "run", "pid": p.pid,
                      "until": end_time, "quantum": quantum,
                      "remaining_before": p.remaining,
                      "desc": f"Running {p.pid} for {run} units (q={quantum}, rem={p.remaining})"})
        p.remaining -= run
        time         = end_time

        # Enqueue newly arrived
        while idx < n and procs[idx].arrival <= time:
            queue.append(procs[idx])
            in_queue.add(procs[idx].pid)
            idx += 1

        if p.remaining > 0:
            queue.append(p)
            in_queue.add(p.pid)
            steps.append({"time": time, "event": "requeue", "pid": p.pid,
                          "desc": f"{p.pid} re-queued (rem={p.remaining})"})
        else:
            p.completion = time
            completed   += 1
            steps.append({"time": time, "event": "complete", "pid": p.pid,
                          "desc": f"{p.pid} completed"})

    return _pack(procs, gantt, steps, time, "Round Robin")


# ── 5. Priority Non-Preemptive ────────────────────────────────────────────────

def priority_np(processes: list[dict]) -> dict:
    procs     = [Process(**p) for p in processes]
    done      = []
    ready     = []
    remaining = list(procs)
    remaining.sort(key=lambda p: p.arrival)
    time      = 0
    gantt     = []
    steps     = []

    while remaining or ready:
        arrived = [p for p in remaining if p.arrival <= time]
        for p in arrived:
            ready.append(p)
            remaining.remove(p)
        if not ready:
            nxt = min(p.arrival for p in remaining)
            steps.append({"time": time, "event": "idle", "until": nxt})
            time = nxt
            continue
        # Lower number = higher priority
        ready.sort(key=lambda p: (p.priority, p.arrival))
        p = ready.pop(0)
        p.response = time - p.arrival
        p.start    = time
        gantt.append({"pid": p.pid, "start": time, "end": time + p.remaining})
        steps.append({"time": time, "event": "run", "pid": p.pid,
                      "until": time + p.remaining,
                      "desc": f"Priority {p.priority}: running {p.pid}"})
        time        += p.remaining
        p.remaining  = 0
        p.completion = time
        done.append(p)
        arrived2 = [q for q in remaining if q.arrival <= time]
        for q in arrived2:
            ready.append(q)
            remaining.remove(q)

    return _pack(done, gantt, steps, time, "Priority (NP)")


# ── 6. Priority Preemptive ────────────────────────────────────────────────────

def priority_p(processes: list[dict]) -> dict:
    procs     = [Process(**p) for p in processes]
    n         = len(procs)
    time      = 0
    completed = 0
    gantt_raw = []
    steps     = []
    prev_pid  = None

    while completed < n:
        candidates = [p for p in procs if p.arrival <= time and p.remaining > 0]
        if not candidates:
            time += 1
            continue
        p = min(candidates, key=lambda x: (x.priority, x.arrival))
        if p.response == -1:
            p.response = time - p.arrival
        if prev_pid != p.pid:
            steps.append({"time": time, "event": "preempt" if prev_pid else "run",
                          "pid": p.pid,
                          "desc": f"Priority {p.priority}: {'preempted to ' if prev_pid else 'running '}{p.pid}"})
        gantt_raw.append({"pid": p.pid, "start": time, "end": time + 1})
        p.remaining -= 1
        time        += 1
        prev_pid     = p.pid
        if p.remaining == 0:
            p.completion = time
            completed   += 1
            prev_pid     = None

    gantt = _merge_gantt(gantt_raw)
    return _pack(procs, gantt, steps, time, "Priority (P)")


# ── 7. MLFQ ───────────────────────────────────────────────────────────────────

def mlfq(processes: list[dict], queues: int = 3, base_quantum: int = 2) -> dict:
    """
    Multi-Level Feedback Queue
    - Q0: quantum=base_quantum, Q1: quantum=base_quantum*2, Q(n-1): FCFS
    - Demote on expiry, never promote
    """
    procs     = sorted([Process(**p) for p in processes], key=lambda p: p.arrival)
    mq        = [deque() for _ in range(queues)]
    time      = 0
    gantt     = []
    steps     = []
    idx       = 0
    n         = len(procs)
    completed = 0
    q_level   = {p.pid: 0 for p in procs}   # track each process's current queue

    # Seed
    while idx < n and procs[idx].arrival <= time:
        mq[0].append(procs[idx])
        idx += 1

    while completed < n:
        # Find highest-priority non-empty queue
        q_idx = next((i for i in range(queues) if mq[i]), None)
        if q_idx is None:
            if idx < n:
                steps.append({"time": time, "event": "idle", "until": procs[idx].arrival})
                time = procs[idx].arrival
                while idx < n and procs[idx].arrival <= time:
                    mq[0].append(procs[idx])
                    idx += 1
            continue

        p       = mq[q_idx].popleft()
        quantum = (base_quantum * (2 ** q_idx)) if q_idx < queues - 1 else 10**9
        if p.response == -1:
            p.response = time - p.arrival

        run      = min(quantum, p.remaining)
        end_time = time + run
        gantt.append({"pid": p.pid, "start": time, "end": end_time, "queue": q_idx})
        steps.append({"time": time, "event": "run", "pid": p.pid,
                      "queue": q_idx, "quantum": quantum,
                      "desc": f"Q{q_idx} (q={quantum}): running {p.pid} for {run}"})
        p.remaining -= run
        time         = end_time

        while idx < n and procs[idx].arrival <= time:
            mq[0].append(procs[idx])
            idx += 1

        if p.remaining > 0:
            new_q = min(q_idx + 1, queues - 1)
            q_level[p.pid] = new_q
            mq[new_q].append(p)
            steps.append({"time": time, "event": "demote", "pid": p.pid,
                          "from_q": q_idx, "to_q": new_q,
                          "desc": f"{p.pid} demoted Q{q_idx}→Q{new_q}"})
        else:
            p.completion = time
            completed   += 1

    return _pack(procs, gantt, steps, time, "MLFQ")


# ── Pack result ───────────────────────────────────────────────────────────────

def _pack(procs, gantt, steps, end_time, name) -> dict:
    merged = _merge_gantt(gantt)
    avgs   = _compute_averages(procs, end_time)
    return dict(algorithm=name, gantt=merged,
                metrics=_build_metrics(procs), steps=steps, **avgs)


# ── Dispatcher ────────────────────────────────────────────────────────────────

def run_scheduling(algorithm: str, processes: list[dict],
                   quantum: int = 2, queues: int = 3) -> dict:
    alg = algorithm.lower()
    if   alg == "fcfs":       return fcfs(processes)
    elif alg == "sjf":        return sjf(processes)
    elif alg == "srtf":       return srtf(processes)
    elif alg == "rr":         return round_robin(processes, quantum)
    elif alg == "priority":   return priority_np(processes)
    elif alg == "priority_p": return priority_p(processes)
    elif alg == "mlfq":       return mlfq(processes, queues, quantum)
    else:
        raise ValueError(f"Unknown scheduling algorithm: {algorithm}")
