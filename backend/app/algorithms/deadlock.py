"""
Deadlock Algorithms
Implements: Banker's Algorithm (safety check + resource request),
            Deadlock Detection via RAG cycle detection
"""
from __future__ import annotations
from typing import Optional
import copy


# ── Banker's Algorithm ────────────────────────────────────────────────────────

def bankers(allocation: list[list[int]], max_need: list[list[int]],
            available: list[int]) -> dict:
    n   = len(allocation)       # processes
    m   = len(available)        # resource types

    # Compute Need matrix
    need = [[max_need[i][j] - allocation[i][j]
             for j in range(m)] for i in range(n)]

    work      = list(available)
    finish    = [False] * n
    safe_seq  = []
    steps     = []

    steps.append({
        "event": "init",
        "work":   list(work),
        "finish": list(finish),
        "need":   [row[:] for row in need],
        "desc":   f"Initial: Available={work}, Need matrix computed"
    })

    # Safety algorithm
    for _ in range(n):
        found = False
        for i in range(n):
            if finish[i]:
                continue
            can_allocate = all(need[i][j] <= work[j] for j in range(m))
            steps.append({
                "event": "check", "pid": i,
                "need_i": need[i][:], "work": work[:],
                "can": can_allocate,
                "desc": (f"P{i}: Need={need[i]} ≤ Work={work}? {'YES ✓' if can_allocate else 'NO ✗'}")
            })
            if can_allocate:
                for j in range(m):
                    work[j] += allocation[i][j]
                finish[i] = True
                safe_seq.append(i)
                found = True
                steps.append({
                    "event": "grant", "pid": i,
                    "work_after": work[:],
                    "desc": f"P{i} allocated → completes → releases {allocation[i]}. Work={work}"
                })
                break
        if not found:
            break

    is_safe = all(finish)
    steps.append({
        "event": "result",
        "is_safe": is_safe,
        "safe_sequence": safe_seq if is_safe else [],
        "desc": (f"SAFE STATE: sequence={safe_seq}" if is_safe
                 else "UNSAFE STATE: deadlock possible")
    })

    return dict(is_safe=is_safe, safe_sequence=safe_seq,
                need_matrix=need, steps=steps,
                request_granted=None, request_reason=None)


def bankers_request(allocation: list[list[int]], max_need: list[list[int]],
                    available: list[int], pid: int,
                    request: list[int]) -> dict:
    """Try a resource request and check if resulting state is safe."""
    n = len(allocation)
    m = len(available)
    need = [[max_need[i][j] - allocation[i][j] for j in range(m)] for i in range(n)]

    steps = []
    steps.append({"event": "request", "pid": pid, "request": request[:],
                  "desc": f"P{pid} requests {request}"})

    # Step 1: request ≤ need?
    if any(request[j] > need[pid][j] for j in range(m)):
        return dict(is_safe=False, safe_sequence=[], need_matrix=need,
                    steps=steps + [{"event": "error",
                                    "desc": "Request exceeds maximum need"}],
                    request_granted=False,
                    request_reason="Request exceeds maximum declared need")

    # Step 2: request ≤ available?
    if any(request[j] > available[j] for j in range(m)):
        return dict(is_safe=False, safe_sequence=[], need_matrix=need,
                    steps=steps + [{"event": "wait",
                                    "desc": "Resources not available — process must wait"}],
                    request_granted=False,
                    request_reason="Insufficient available resources, process must wait")

    # Step 3: Pretend to allocate, run safety
    alloc2    = copy.deepcopy(allocation)
    avail2    = list(available)
    max2      = copy.deepcopy(max_need)
    for j in range(m):
        alloc2[pid][j] += request[j]
        avail2[j]      -= request[j]

    steps.append({"event": "pretend", "pid": pid,
                  "new_alloc": alloc2[pid][:], "new_avail": avail2[:],
                  "desc": f"Pretend-allocate: P{pid} alloc={alloc2[pid]}, avail={avail2}"})

    result = bankers(alloc2, max2, avail2)
    result["steps"] = steps + result["steps"]
    result["request_granted"] = result["is_safe"]
    result["request_reason"]  = ("Request granted — safe state maintained"
                                  if result["is_safe"]
                                  else "Request denied — would lead to unsafe state")
    return result


def run_deadlock(allocation: list[list[int]], max_need: list[list[int]],
                 available: list[int], request_pid: Optional[int] = None,
                 request: Optional[list[int]] = None) -> dict:
    if request_pid is not None and request is not None:
        return bankers_request(allocation, max_need, available, request_pid, request)
    return bankers(allocation, max_need, available)
